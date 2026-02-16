import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton';

export default function BarbershopDetailLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex space-x-4">
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image gallery skeleton */}
                        <div className="rounded-2xl overflow-hidden">
                            <div className="h-72 sm:h-96 bg-gray-200 animate-pulse" />
                            <div className="flex space-x-2 mt-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>

                        {/* Title & info */}
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-2/3" />
                            <div className="flex items-center space-x-4">
                                <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse" />
                                <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse" />
                                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse" />
                            </div>
                            <SkeletonText lines={3} />
                        </div>

                        {/* Services section */}
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32" />
                                                <div className="h-3 bg-gray-200 rounded-md animate-pulse w-20" />
                                            </div>
                                        </div>
                                        <div className="h-5 bg-gray-200 rounded-md animate-pulse w-12" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team section */}
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded-md animate-pulse w-32" />
                            <div className="flex space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="text-center space-y-2">
                                        <SkeletonCircle size="lg" />
                                        <div className="h-3 bg-gray-200 rounded-md animate-pulse w-16 mx-auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Booking card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-4 sticky top-8">
                            <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24" />
                                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 space-y-3">
                            <div className="h-5 bg-gray-200 rounded-md animate-pulse w-28" />
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-40" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
