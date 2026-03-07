export default function OverviewLoading() {
  return (
    <div className="min-h-full space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-200 to-pink-200 p-6 md:p-8 lg:p-10 dark:from-rose-900/40 dark:to-pink-900/40">
        <div className="h-4 w-40 rounded bg-white/30" />
        <div className="mt-4 h-8 w-64 rounded bg-white/30" />
        <div className="mt-3 h-4 w-80 rounded bg-white/20" />
        <div className="mt-6 flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-white/30" />
          <div className="h-10 w-36 rounded-xl bg-white/20" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div>
        <div className="mb-4 h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="mt-2 h-8 w-28 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats pills skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="h-6 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div>
        <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mt-1 h-3 w-40 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
