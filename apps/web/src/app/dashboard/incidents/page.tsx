export default function IncidentsPage() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">AI-Generated Incident Reports</h1>
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Queue Topology Degradation</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <strong>Root Cause:</strong> Configuration drift in worker environment.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded">
            <strong>Ops AI Recommendation:</strong> Re-apply env snapshot, rotate JWT keys.
          </div>
        </div>
      </div>
    </div>
  );
}
