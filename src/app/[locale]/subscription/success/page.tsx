import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default async function SubscriptionSuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Subscription Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Welcome to our platform! Your barbershop subscription is now active.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Next Steps:</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              Set up your barbershop profile and add photos
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              Add your barbers and their schedules
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              Configure your services and pricing
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              Start accepting bookings!
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/my-space`}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to My Space
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
