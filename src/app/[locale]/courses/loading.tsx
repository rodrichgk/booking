import { SkeletonCard } from '@/components/ui/skeleton';

export default function CoursesLoading() {
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
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-64" />
                    <div className="h-5 bg-gray-200 rounded-md animate-pulse w-80 mt-4" />
                </div>
            </div>

            {/* Course grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-48 bg-gray-200 animate-pulse" />
                            <div className="p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                                    <div className="h-5 bg-gray-200 rounded-md animate-pulse w-12" />
                                </div>
                                <div className="h-5 bg-gray-200 rounded-md animate-pulse w-3/4" />
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-full" />
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-2/3" />
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-20" />
                                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
