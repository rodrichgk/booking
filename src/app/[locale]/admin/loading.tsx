import { SkeletonStat, SkeletonTable } from '@/components/ui/skeleton';

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex space-x-4">
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48" />
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-72 mt-2" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonStat key={i} />
                    ))}
                </div>

                {/* Table */}
                <SkeletonTable rows={8} cols={5} />
            </div>
        </div>
    );
}
