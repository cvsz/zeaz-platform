export default function AutonomousActionsPage() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Autonomous Actions & Rollbacks</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Action Log</h2>
        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 pl-6 space-y-6">
          <div>
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] mt-1.5"></div>
            <h3 className="font-medium">Rollback Engine Triggered</h3>
            <p className="text-sm text-gray-500">Restored previous compose state and env snapshot.</p>
          </div>
          <div>
            <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[6.5px] mt-1.5"></div>
            <h3 className="font-medium">Self-Healing Runtime</h3>
            <p className="text-sm text-gray-500">Restarted degraded worker node automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
