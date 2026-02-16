export default function SubscriptionLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="h-5 bg-gray-200 rounded-md animate-pulse w-40" />
                </div>
            </div>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Shop info card */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32" />
                                    </div>
                                </div>
                                <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing card */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                            <div className="bg-gray-200 px-8 py-12 animate-pulse">
                                <div className="h-8 bg-gray-300 rounded-md w-48 mx-auto mb-4" />
                                <div className="h-14 bg-gray-300 rounded-md w-32 mx-auto mb-4" />
                                <div className="h-4 bg-gray-300 rounded-md w-64 mx-auto" />
                            </div>
                            <div className="px-8 py-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-32" />
                                                <div className="h-3 bg-gray-200 rounded-md animate-pulse w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <div className="h-14 w-64 bg-gray-200 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
