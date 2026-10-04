"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-32">
      <h1 className="text-4xl">Something interrupted the build.</h1>
      <p className="mt-5 text-zinc-400">
        Retry this screen. A failed request is not treated as successful
        registration.
      </p>
      <button className="action-primary mt-7" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
