export default function RiskAnalysisPage() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pre-Deployment Risk Analysis</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 border-t-4 border-t-green-500">
          <h2 className="text-xl font-semibold mb-2">Current Risk Score: LOW</h2>
          <p className="text-gray-600 dark:text-gray-300">All automated checks passed successfully.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Checks Performed</h2>
          <ul className="space-y-2">
            <li className="flex items-center text-green-600">
              <span className="mr-2">✓</span> Compose diff safe
            </li>
            <li className="flex items-center text-green-600">
              <span className="mr-2">✓</span> Environment unchanged
            </li>
            <li className="flex items-center text-green-600">
              <span className="mr-2">✓</span> No public ports exposed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
