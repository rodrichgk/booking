import { SkeletonTable } from '@/components/ui/skeleton';

export default function BookingsLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Title */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-7 bg-gray-200 rounded-md animate-pulse w-40" />
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-64" />
                    </div>
                    <div className="flex space-x-3">
                        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-9 rounded-lg animate-pulse ${i === 1 ? 'w-20 bg-gray-300' : 'w-24 bg-gray-200'}`} />
                    ))}
                </div>

                {/* Table */}
                <SkeletonTable rows={10} cols={6} />
            </div>
        </div>
    );
}
