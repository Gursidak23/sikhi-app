/**
 * Loading skeleton for the Kirtan page
 * Shown during client-side navigation while the page component loads
 */

export default function KirtanLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      {/* Nav placeholder */}
      <div className="h-16 bg-white border-b border-gray-100" />

      {/* Header */}
      <section className="py-8 md:py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-5xl mb-3">🎵</div>
          <div className="h-10 w-64 bg-emerald-100 rounded-lg animate-pulse mx-auto" />
          <div className="h-5 w-80 bg-emerald-50 rounded animate-pulse mx-auto mt-3" />
        </div>
      </section>

      {/* Search & Filters */}
      <section className="pb-6">
        <div className="max-w-5xl mx-auto px-4">
          {/* Search bar placeholder */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
            <div className="w-14 h-12 bg-emerald-100 rounded-xl animate-pulse" />
          </div>

          {/* Raag pills placeholder */}
          <div className="mb-6">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-emerald-50 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid placeholder */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-5 w-20 bg-emerald-100 rounded-full animate-pulse" />
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-full bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-6 w-3/4 bg-gray-50 rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
