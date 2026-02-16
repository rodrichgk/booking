import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function HomeLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header skeleton */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex space-x-4">
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Hero skeleton */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-3/4" />
                        <div className="h-6 bg-gray-200 rounded-md animate-pulse w-1/2" />
                        <div className="flex space-x-4 pt-4">
                            <div className="h-12 w-40 bg-gray-300 rounded-lg animate-pulse" />
                            <div className="h-12 w-36 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured barbershops skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12 space-y-4">
                    <div className="h-8 bg-gray-200 rounded-md animate-pulse w-64 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-96 mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>

            {/* Services skeleton */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-12 space-y-4">
                        <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48 mx-auto" />
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-80 mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mx-auto" />
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4 mx-auto" />
                                <div className="h-3 bg-gray-200 rounded-md animate-pulse w-1/2 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
