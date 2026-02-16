import { SkeletonStat } from '@/components/ui/skeleton';

export default function MySpaceLoading() {
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

            {/* User profile header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="space-y-3">
                            <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48" />
                            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-56" />
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Stats */}
                    <div className="bg-white border-b border-gray-200 rounded-xl">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <SkeletonStat key={i} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Shop cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="h-10 bg-gray-200 animate-pulse" />
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                                            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24" />
                                        </div>
                                        <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded-md animate-pulse" />
                                        <div className="h-3 bg-gray-200 rounded-md animate-pulse w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded-md animate-pulse w-1/2" />
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
