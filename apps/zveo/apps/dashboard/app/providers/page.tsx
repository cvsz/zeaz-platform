import { ProviderHealthCards } from "../../components/dashboard";
import { EmptyState, ErrorState } from "../../components/states";
import { getProvidersHealth } from "../../lib/api";

export default async function ProvidersPage() { try { const providers = await getProvidersHealth(); if (providers.length === 0) return <main className="p-8"><EmptyState title="No providers" message="No provider health entries were returned." /></main>; return <main className="p-8 space-y-4"><h1 className="text-2xl">Providers</h1><ProviderHealthCards providers={providers} /></main>; } catch (error) { return <main className="p-8"><ErrorState title="Provider health unavailable" message={error instanceof Error ? error.message : "Unknown error"} /></main>; } }
