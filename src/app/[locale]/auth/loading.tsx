export default function AuthLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
                    {/* Logo */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse mx-auto" />
                        <div className="h-7 bg-gray-200 rounded-md animate-pulse w-40 mx-auto" />
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-52 mx-auto" />
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse w-8" />
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-16" />
                                <div className="h-11 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>

                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />

                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-48 mx-auto" />
                </div>
            </div>
        </div>
    );
}
