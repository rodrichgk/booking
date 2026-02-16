export default function BookingLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress steps */}
                <div className="flex items-center justify-center space-x-4 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <div className={`w-10 h-10 rounded-full animate-pulse ${i === 1 ? 'bg-gray-300' : 'bg-gray-200'}`} />
                            <div className="h-3 bg-gray-200 rounded-md animate-pulse w-16 hidden sm:block" />
                            {i < 4 && <div className="h-0.5 bg-gray-200 w-8 animate-pulse" />}
                        </div>
                    ))}
                </div>

                {/* Shop info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24" />
                        </div>
                    </div>
                </div>

                {/* Service selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-md animate-pulse w-48" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-36" />
                                        <div className="h-3 bg-gray-200 rounded-md animate-pulse w-20" />
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="h-5 bg-gray-200 rounded-md animate-pulse w-12" />
                                    <div className="h-3 bg-gray-200 rounded-md animate-pulse w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
