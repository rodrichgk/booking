export default function FavoritesLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="h-8 bg-gray-200 rounded-md animate-pulse w-40 mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-48 bg-gray-200 animate-pulse" />
                            <div className="p-6 space-y-3">
                                <div className="h-5 bg-gray-200 rounded-md animate-pulse w-3/4" />
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2" />
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 bg-gray-200 rounded-md animate-pulse w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
