export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-[50vh] text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-purple-500 mr-3" />
      <span>Loading dashboard...</span>
    </div>
  );
}
