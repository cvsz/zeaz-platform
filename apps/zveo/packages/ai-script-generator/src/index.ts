import { sceneGraphSchema } from "@zveo/contracts";
import { z } from "zod";

export const campaignCreateSchema = z.object({
  tenantId: z.string().uuid(), projectId: z.string().uuid(), niche: z.string().min(1), audience: z.string().min(1), topic: z.string().min(1),
  language: z.string().min(1), tone: z.string().min(1), durationSeconds: z.number().int().positive()
});
export const scriptOutputSchema = z.object({
  title: z.string(), hook: z.string(), script: z.string(),
  scene_by_scene: z.array(z.object({ scene: z.number().int().positive(), duration: z.string(), visual: z.string(), voiceover: z.string(), text_on_screen: z.string() })),
  caption: z.string(), hashtags: z.array(z.string()), cta: z.string(), video_style: z.string(), safety_note: z.string()
});

export type Campaign = z.infer<typeof campaignCreateSchema> & { id: string; status: "draft"|"script_generated"|"workflow_created"; createdAt: string; updatedAt: string; title?: string; hook?: string; script?: string; scenes?: unknown; caption?: string; hashtags?: string[]; workflowId?: string };
export interface ScriptModelAdapter { generateCampaignScript(input: z.infer<typeof campaignCreateSchema>): Promise<unknown>; }
export class InMemoryCampaignStore { private readonly data = new Map<string, Campaign>();
  create(c: Campaign){ this.data.set(c.id,c); return c; }
  list(){ return [...this.data.values()]; }
  get(id:string){ return this.data.get(id); }
  update(id:string, patch: Partial<Campaign>){ const curr=this.data.get(id); if(!curr) return; const next={...curr,...patch,updatedAt:new Date().toISOString()}; this.data.set(id,next); return next; }
}
export async function generateAndStoreScript(c: Campaign, adapter: ScriptModelAdapter, store: InMemoryCampaignStore){
  const output = scriptOutputSchema.parse(await adapter.generateCampaignScript(c));
  return store.update(c.id,{title:output.title,hook:output.hook,script:output.script,scenes:output.scene_by_scene,caption:output.caption,hashtags:output.hashtags,status:"script_generated"});
}
export function campaignToSceneGraph(c: Campaign){
  const scenes = z.array(z.object({scene:z.number(),duration:z.string(),visual:z.string(),voiceover:z.string(),text_on_screen:z.string()})).parse(c.scenes ?? []);
  return sceneGraphSchema.parse({
    id: crypto.randomUUID(), name: c.title ?? `${c.topic} campaign`, styleGuide: `${c.tone} tone for ${c.audience}`, targetPlatforms:["tiktok"], characters:[], visualReferences:[],
    scenes: scenes.map((s: { scene:number; duration:string; visual:string; voiceover:string; text_on_screen:string },idx:number)=>({id:`scene-${s.scene}`,title:`Scene ${s.scene}`,description:`${s.visual}. VO: ${s.voiceover}. Text: ${s.text_on_screen}`.slice(0,4096),durationSeconds: Math.max(1,Math.round(c.durationSeconds/Math.max(1,scenes.length))), previousSceneIds: idx===0?[]:[`scene-${scenes[idx-1]!.scene}`], characterIds:[], visualReferenceIds:[] }))
  });
}
