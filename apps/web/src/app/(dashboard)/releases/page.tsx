export default function ReleasesPage() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Autonomous Releases</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Deployment Timeline</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium">v1.4.2 - HEALTHY</p>
              <p className="text-sm text-gray-500">Autonomous validation passed.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="font-medium">v1.4.1 - ROLLED_BACK</p>
              <p className="text-sm text-gray-500">Risk engine blocked due to missing auth middleware.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
