export default function EventLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-[85vh] lg:h-[90vh] bg-gray-200" />

      {/* Details bar skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-30">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden mb-16 md:mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {[0, 1, 2].map(i => (
              <div key={i} className="p-8 lg:p-12 flex flex-col items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <div className="w-16 h-3 rounded bg-gray-200" />
                <div className="w-32 h-5 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
