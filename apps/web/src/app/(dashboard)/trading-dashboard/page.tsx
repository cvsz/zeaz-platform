export default function TradingDashboard() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">AI Auto Trader - Control Center</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Total Equity</h2>
          <p className="text-3xl text-green-600">$1,245,000.00</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Active Strategies</h2>
          <p className="text-3xl text-blue-600">8 / 12</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Risk Mode</h2>
          <p className="text-3xl text-green-600">NORMAL</p>
        </div>
      </div>
    </div>
  );
}
