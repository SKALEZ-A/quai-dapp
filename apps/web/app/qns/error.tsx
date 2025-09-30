"use client";

export default function QnsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
      <h1 className="text-2xl font-bold mb-2">QNS error</h1>
      <p className="text-gray-400 mb-6">{error?.message || 'An error occurred while loading QNS.'}</p>
      <button onClick={reset} className="px-4 py-2 rounded-md bg-primary text-white">Retry</button>
    </div>
  );
}
