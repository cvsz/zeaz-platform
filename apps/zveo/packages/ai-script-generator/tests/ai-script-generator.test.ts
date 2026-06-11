import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryCampaignStore, campaignToSceneGraph, generateAndStoreScript, type ScriptModelAdapter } from "../src/index.js";

test("generates script with mocked model output", async()=>{
  const store = new InMemoryCampaignStore();
  const campaign = store.create({id:crypto.randomUUID(),tenantId:crypto.randomUUID(),projectId:crypto.randomUUID(),niche:"tech",audience:"founders",topic:"ai",language:"en",tone:"punchy",durationSeconds:15,status:"draft",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  const adapter: ScriptModelAdapter = { async generateCampaignScript(){ return {title:"T",hook:"H",script:"S",scene_by_scene:[{scene:1,duration:"0-3s",visual:"v",voiceover:"vo",text_on_screen:"tos"}],caption:"c",hashtags:["#a"],cta:"go",video_style:"fast",safety_note:"none"}; } };
  const updated = await generateAndStoreScript(campaign,adapter,store);
  assert.equal(updated?.status,"script_generated");
  const sg = campaignToSceneGraph(updated!);
  assert.equal(sg.scenes.length,1);
});
