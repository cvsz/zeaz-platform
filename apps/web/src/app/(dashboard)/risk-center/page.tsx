export default function RiskCenter() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-red-600 dark:text-red-400">Risk Center & Kill Switches</h1>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-300">EMERGENCY CONTROLS</h2>
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700">
            EMERGENCY STOP
          </button>
          <button className="px-6 py-3 bg-orange-500 text-white font-bold rounded shadow hover:bg-orange-600">
            REDUCE ONLY MODE
          </button>
        </div>
      </div>
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Circuit Breakers</h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
          <li>Max Drawdown: 15% (Current: 2.1%)</li>
          <li>Slippage Protection: ACTIVE</li>
          <li>Exchange Connectivity: HEALTHY</li>
        </ul>
      </div>
    </div>
  );
}
