import { SkeletonCard } from '@/components/ui/skeleton';

export default function BarbersLoading() {
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

            {/* Hero */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-72" />
                    <div className="h-5 bg-gray-200 rounded-md animate-pulse w-96 mt-4" />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 text-center space-y-4">
                                <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse mx-auto" />
                                <div className="h-5 bg-gray-200 rounded-md animate-pulse w-32 mx-auto" />
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24 mx-auto" />
                                <div className="flex justify-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <div key={s} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                    ))}
                                </div>
                                <div className="h-3 bg-gray-200 rounded-md animate-pulse w-20 mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
