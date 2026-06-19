import { getCampaigns } from "@/lib/api";

export default async function CampaignsPage(){
  const campaigns = await getCampaigns().catch(()=>[]);
  return <main className="space-y-4"><h1 className="text-2xl font-semibold">Campaigns</h1><ul>{campaigns.map((c)=><li key={c.id} className="border rounded p-3"><div className="font-medium">{c.title ?? c.topic}</div><div className="text-sm text-gray-500">{c.status}</div></li>)}</ul></main>;
}
