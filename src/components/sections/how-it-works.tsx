'use client';

import { Search, Calendar, Scissors, Star } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Find Your Perfect Match',
    description: 'Search for barbershops specializing in your hair type and preferred services in your area.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Book Your Appointment',
    description: 'Choose your preferred date, time, and barber. View real availability and book instantly.',
    icon: Calendar,
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Get Your Perfect Cut',
    description: 'Arrive at your appointment and enjoy professional service from verified expert barbers.',
    icon: Scissors,
    color: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Share Your Experience',
    description: 'Rate your experience and help other customers find the best barbershops in the community.',
    icon: Star,
    color: 'bg-yellow-500',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting your perfect haircut has never been easier. Follow these simple steps to book with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.id} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-center h-full">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600 mb-2">
                      Step {step.id}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-500"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                      <div className="w-0 h-0 border-l-4 border-l-primary-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who trust AfroBook for their hair care needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Find Barbershops
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
