export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Profile card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse" />
                        <div className="space-y-3 flex-1">
                            <div className="h-7 bg-gray-200 rounded-md animate-pulse w-48" />
                            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-56" />
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                        </div>
                        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>

                {/* Form fields */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
                    <div className="h-6 bg-gray-200 rounded-md animate-pulse w-40" />
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24" />
                            <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
                        </div>
                    ))}
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-40" />
                </div>
            </div>
        </div>
    );
}
