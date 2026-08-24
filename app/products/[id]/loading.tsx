export default function ProductDetailLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="h-4 w-64 animate-pulse rounded-full bg-zinc-200" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-square animate-pulse rounded-3xl bg-zinc-200" />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-24 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-zinc-200" />
          <div className="h-5 w-48 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-9 w-40 animate-pulse rounded-xl bg-zinc-200" />
          <div className="flex flex-col gap-2 pt-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-zinc-200" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-zinc-200" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-200" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200" />
          </div>
          <div className="mt-3 flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-full bg-zinc-200" />
            <div className="h-12 w-36 animate-pulse rounded-full bg-zinc-200" />
          </div>
        </div>
      </div>
      <div className="mt-14 border-t border-zinc-200 pt-10">
        <div className="h-8 w-52 animate-pulse rounded-xl bg-zinc-200" />
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3" aria-hidden="true">
              <div className="aspect-square animate-pulse rounded-2xl bg-zinc-200" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
