export default function RootLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-500 mr-3" />
      <span>Loading...</span>
    </div>
  );
}
