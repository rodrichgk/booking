import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { barbershops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
            console.error('Missing stripe-signature header');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        console.log(`Received Stripe webhook: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }

            case 'charge.failed': {
                const charge = event.data.object as Stripe.Charge;
                await handleChargeFailed(charge);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`Payment intent succeeded: ${paymentIntent.id}, amount: ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentFailed(paymentIntent);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
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
 * Handle checkout.session.completed - Initial subscription setup
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const shopId = session.metadata?.shopId;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!shopId) {
        console.error('No shopId in checkout session metadata');
        return;
    }

    console.log(`Checkout completed for shop ${shopId}, subscription ${subscriptionId}`);

    // Retrieve subscription details to get current_period_end
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Update barbershop with subscription info
    await db
        .update(barbershops)
        .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            currentPeriodEnd: currentPeriodEnd,
            isActive: true,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shopId));

    console.log(`Shop ${shopId} subscription activated until ${currentPeriodEnd.toISOString()}`);
}

/**
 * Handle invoice.paid - Auto-renewal success (fires each billing cycle)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
        console.log('Invoice not related to a subscription');
        return;
    }

    console.log(`Invoice paid for subscription ${subscriptionId}`);

    // Retrieve subscription to get updated period end
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Find and update the barbershop by subscription ID
    const [shop] = await db
        .select({ id: barbershops.id })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId));

    if (!shop) {
        console.error(`No barbershop found with subscription ${subscriptionId}`);
        return;
    }

    // Update subscription period end (this handles auto-renewal)
    await db
        .update(barbershops)
        .set({
            subscriptionStatus: 'active',
            currentPeriodEnd: currentPeriodEnd,
            isActive: true,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shop.id));

    console.log(`Shop ${shop.id} subscription renewed until ${currentPeriodEnd.toISOString()}`);
}

/**
 * Handle customer.subscription.updated - Status changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    console.log(`Subscription ${subscriptionId} updated: status=${status}`);

    // Find barbershop by subscription ID
    const [shop] = await db
        .select({ id: barbershops.id })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId));

    if (!shop) {
        console.error(`No barbershop found with subscription ${subscriptionId}`);
        return;
    }

    // Map Stripe status to our status
    let mappedStatus: string;
    let isActive = true;

    switch (status) {
        case 'active':
        case 'trialing':
            mappedStatus = status;
            isActive = true;
            break;
        case 'past_due':
            mappedStatus = 'past_due';
            isActive = true; // Keep active during grace period
            break;
        case 'canceled':
        case 'unpaid':
        case 'incomplete_expired':
            mappedStatus = 'canceled';
            isActive = false;
            break;
        default:
            mappedStatus = 'inactive';
            isActive = false;
    }

    await db
        .update(barbershops)
        .set({
            subscriptionStatus: mappedStatus,
            currentPeriodEnd: currentPeriodEnd,
            isActive: isActive,
            updatedAt: new Date(),
        })
        .where(eq(barbershops.id, shop.id));

    console.log(`Shop ${shop.id} subscription status updated to ${mappedStatus}`);
}

/**
 * Handle customer.subscription.deleted - Subscription canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id;

    console.log(`Subscription ${subscriptionId} deleted`);

    // Find barbershop by subscription ID
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
 * Handle invoice.payment_failed - Recurring payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
        console.log('Invoice payment failed but not related to a subscription');
        return;
    }

    console.log(`Invoice payment failed for subscription ${subscriptionId}`);

    // Find barbershop by subscription ID
    const [shop] = await db
        .select({ id: barbershops.id })
        .from(barbershops)
        .where(eq(barbershops.stripeSubscriptionId, subscriptionId));

    if (!shop) {
        console.error(`No barbershop found with subscription ${subscriptionId}`);
        return;
    }

    // Set status to past_due - customer has a grace period to update payment
    await db
        .update(barbershops)
        .set({
            subscriptionStatus: 'past_due',
            updatedAt: new Date(),
            // Keep isActive true during grace period
        })
        .where(eq(barbershops.id, shop.id));

    console.log(`Shop ${shop.id} subscription payment failed - status set to past_due`);
}

/**
 * Handle charge.failed - Individual charge failed
 */
async function handleChargeFailed(charge: Stripe.Charge) {
    console.log(`Charge failed: ${charge.id}`);
    console.log(`Failure code: ${charge.failure_code}, message: ${charge.failure_message}`);

    // If this is related to a customer, try to find their shop
    const customerId = charge.customer as string;

    if (customerId) {
        const [shop] = await db
            .select({ id: barbershops.id, name: barbershops.name })
            .from(barbershops)
            .where(eq(barbershops.stripeCustomerId, customerId));

        if (shop) {
            console.log(`Charge failed for shop ${shop.id} (${shop.name})`);
            // Note: We don't update status here as invoice.payment_failed handles subscription payments
        }
    }
}

/**
 * Handle payment_intent.payment_failed - Payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log(`Payment intent failed: ${paymentIntent.id}`);
    console.log(`Last payment error: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);

    const customerId = paymentIntent.customer as string;

    if (customerId) {
        const [shop] = await db
            .select({ id: barbershops.id, name: barbershops.name })
            .from(barbershops)
            .where(eq(barbershops.stripeCustomerId, customerId));

        if (shop) {
            console.log(`Payment intent failed for shop ${shop.id} (${shop.name})`);
            // Log for monitoring - actual status change is handled by invoice.payment_failed
        }
    }
}
