import { SkeletonStat } from '@/components/ui/skeleton';

export default function ManageShopLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            {/* Shop header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48" />
                                <div className="flex space-x-4">
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-20" />
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex space-x-6 mt-6 border-b border-gray-200">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center space-x-2 pb-3">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className={`h-4 bg-gray-200 rounded-md animate-pulse ${i === 1 ? 'w-20' : 'w-16'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <SkeletonStat key={i} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
                        <div className="h-5 bg-gray-200 rounded-md animate-pulse w-40" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-4">
                        <div className="h-5 bg-gray-200 rounded-md animate-pulse w-36" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-28" />
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
