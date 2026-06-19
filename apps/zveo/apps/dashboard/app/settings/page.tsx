export default function SettingsPage() { return <main className="p-8"><h1 className="text-2xl">Settings</h1><p>ZVEO_API_URL: {process.env.ZVEO_API_URL ?? "http://localhost:8080"}</p></main>; }
