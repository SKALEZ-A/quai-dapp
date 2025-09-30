"use client";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-gray-400 mb-6">{error?.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} className="px-4 py-2 rounded-md bg-primary text-white">Try again</button>
    </div>
  );
}
