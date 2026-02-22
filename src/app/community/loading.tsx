/**
 * Loading skeleton for the Community/Sangat page
 * Shown during client-side navigation while the page component loads
 */

export default function CommunityLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF8F0] via-white to-[#fef9e7]">
      {/* Nav placeholder */}
      <div className="h-16 bg-white border-b border-gray-100" />

      {/* Info banner placeholder */}
      <div className="w-full bg-amber-50/80 border-b border-amber-200/50 py-1.5 px-4 flex items-center justify-center">
        <div className="h-4 w-64 bg-amber-100 rounded animate-pulse" />
      </div>

      {/* Hero header placeholder */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 py-5 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 animate-pulse" />
            <div>
              <div className="h-7 w-48 bg-white/20 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat area placeholder */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-4 w-full">
        <div className="flex h-[calc(100vh-14rem)] rounded-2xl border border-amber-200/30 overflow-hidden bg-white">
          {/* Sidebar placeholder */}
          <div className="hidden md:block w-72 border-r border-gray-100 p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mt-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Main chat placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-2 border-amber-200 rounded-full" />
                <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
