import { SkeletonCard } from '@/components/ui/skeleton';

export default function BarbershopsLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header skeleton */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex space-x-4">
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Hero/Search area */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-96" />
                        <div className="h-5 bg-gray-200 rounded-md animate-pulse w-64" />
                    </div>
                    {/* Search/filter bar */}
                    <div className="flex space-x-4 mt-8">
                        <div className="h-12 bg-white rounded-xl animate-pulse flex-1 border border-gray-200 shadow-sm" />
                        <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
