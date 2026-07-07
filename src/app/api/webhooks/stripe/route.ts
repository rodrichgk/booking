import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { barbershops, coursePurchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { decideSubscriptionState } from '@/lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.type === 'course_purchase' || session.metadata?.courseId) {
                    await handleCoursePurchaseCompleted(session);
                } else {
                    await handleCheckoutCompleted(session);
                }
                break;
            }

            // Renewal succeeded (fires each billing cycle). Some accounts emit
            // `invoice.payment_succeeded` instead of / in addition to `invoice.paid`.
            case 'invoice.paid':
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error(`Payment intent failed: ${paymentIntent.id} (${paymentIntent.last_payment_error?.message || 'unknown'})`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await syncBarbershopSubscription(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Single source of truth for a shop's subscription state.
 *
 * Rule: a shop stays publicly visible (`isActive: true`) as long as EITHER
 *   - it has paid through a date in the future (`current_period_end > now`), OR
 *   - Stripe currently reports a healthy/grace status (active, trialing, past_due).
 *
 * It is only switched OFF when the subscription is in a terminal state AND the
 * paid-through date has actually passed. This prevents the previous bug where a
 * transient status during the renewal window flipped the shop off even though the
 * customer had just paid.
 *
 * Out-of-order protection: Stripe does not guarantee webhook ordering, and it can
 * redeliver events. We ignore any event that would move the paid-through date
 * backwards (a stale/duplicate event from a previous cycle), so a late-arriving
 * event cannot clobber a shop that has already been renewed.
 */
async function syncBarbershopSubscription(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    const [shop] = await db
        .select({ id: barbershops.id, currentPeriodEnd: barbershops.currentPeriodEnd })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId));

    if (!shop) {
        console.error(`No barbershop found with subscription ${subscriptionId}`);
        return;
    }

    const decision = decideSubscriptionState({
        status,
        currentPeriodEndMs: currentPeriodEnd.getTime(),
        storedPeriodEndMs: shop.currentPeriodEnd ? shop.currentPeriodEnd.getTime() : null,
    });

    if (decision.ignore) {
        console.warn(
            `Ignoring stale subscription event for shop ${shop.id}: event period ${currentPeriodEnd.toISOString()} < stored ${shop.currentPeriodEnd?.toISOString()}`
        );
        return;
    }

    await db
        .update(barbershops)
        .set({
            subscriptionStatus: decision.subscriptionStatus,
            currentPeriodEnd,
            isActive: decision.isActive,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shop.id));

    console.log(`Shop ${shop.id} synced: status=${decision.subscriptionStatus}, isActive=${decision.isActive}, paidUntil=${currentPeriodEnd.toISOString()}`);
}

/**
 * checkout.session.completed - initial subscription setup. Stores the Stripe
 * identifiers on the shop, then defers all state to syncBarbershopSubscription.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const shopId = session.metadata?.shopId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!shopId || !subscriptionId) {
        console.error('checkout.session.completed missing shopId or subscription');
        return;
    }

    await db
        .update(barbershops)
        .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shopId));

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncBarbershopSubscription(subscription);
}

/**
 * invoice.paid / invoice.payment_succeeded - renewal succeeded. Retrieve the
 * subscription so we sync from its authoritative (already-advanced) period.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncBarbershopSubscription(subscription);
}

/**
 * invoice.payment_failed - a recurring charge failed. We deliberately do NOT
 * disable the shop here: syncBarbershopSubscription keeps it active while the
 * subscription is in the `past_due` grace window and Stripe retries the card.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncBarbershopSubscription(subscription);
}

/**
 * customer.subscription.deleted - the subscription is gone for good.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id;

    const [shop] = await db
        .select({ id: barbershops.id })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId));

    if (!shop) {
        console.error(`No barbershop found with subscription ${subscriptionId}`);
        return;
    }

    await db
        .update(barbershops)
        .set({
            subscriptionStatus: 'canceled',
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shop.id));

    console.log(`Shop ${shop.id} subscription canceled`);
}

/**
 * Course purchase checkout.session.completed
 */
async function handleCoursePurchaseCompleted(session: Stripe.Checkout.Session) {
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;
    const paymentIntentId = session.payment_intent as string;

    if (!courseId || !userId) {
        console.error('Course purchase session missing courseId or userId');
        return;
    }

    const [existingPurchase] = await db
        .select()
        .from(coursePurchases)
        .where(
            and(
                eq(coursePurchases.stripeSessionId, session.id),
                eq(coursePurchases.status, 'pending')
            )
        );

    if (existingPurchase) {
        await db
            .update(coursePurchases)
            .set({
                stripePaymentIntentId: paymentIntentId,
                status: 'completed',
                purchasedAt: new Date(),
            })
            .where(eq(coursePurchases.id, existingPurchase.id));
    } else {
        await db
            .insert(coursePurchases)
            .values({
                userId: userId,
                courseId: courseId,
                stripePaymentIntentId: paymentIntentId,
                stripeSessionId: session.id,
                amountPaid: session.amount_total || 0,
                currency: session.currency?.toUpperCase() || 'EUR',
                status: 'completed',
                purchasedAt: new Date(),
            });
    }
}
