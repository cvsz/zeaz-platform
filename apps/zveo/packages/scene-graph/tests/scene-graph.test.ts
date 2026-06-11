import assert from "node:assert/strict";
import { test } from "node:test";

import { compileSceneGraph, InMemorySceneGraphCache, SceneGraphEngine, SceneGraphRestApi } from "../src/index.js";
import type { SceneGraphInput } from "../src/index.js";

function sampleGraph(): SceneGraphInput {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Neon Alley Chase",
    styleGuide: "anamorphic cyberpunk noir with practical rain reflections",
    targetPlatforms: ["youtube", "broadcast"],
    characters: [
      {
        id: "mara",
        name: "Mara",
        appearance: "short silver hair, amber eyes, angular face scar over left brow",
        wardrobe: "black raincoat with brass collar pins and worn combat boots",
        currentState: "calm but alert",
        referenceAssetIds: ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
        visualReferenceIds: ["mara-face"],
      },
    ],
    visualReferences: [
      {
        id: "mara-face",
        embeddingUri: "s3://zveo-refs/mara-face.embedding",
        description: "identity lock for Mara's face, hair, scar, and eye color",
        assetIds: ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
        tags: ["character", "face"],
        weight: 1.3,
      },
      {
        id: "alley-wide",
        embeddingUri: "s3://zveo-refs/neon-alley.embedding",
        description: "wet alley geometry with noodle shop sign and blue-magenta neon",
        assetIds: [],
        tags: ["environment"],
      },
    ],
    scenes: [
      {
        id: "s1",
        title: "Alley entrance",
        description: "Mara steps into a rain-soaked alley and notices a drone reflection in a puddle.",
        durationSeconds: 5,
        characterIds: ["mara"],
        visualReferenceIds: ["mara-face", "alley-wide"],
        environment: {
          id: "alley",
          location: "blue-magenta neon alley behind a noodle shop",
          timeOfDay: "night",
          weather: "heavy rain",
          persistentProps: ["red umbrella", "broken delivery drone"],
        },
        camera: { framing: "low wide shot", movement: "slow push-in", lensMm: 32 },
        lighting: { setup: "neon practicals with wet bounce", colorTemperature: "4300K", contrast: "high" },
        characterStateUpdates: { mara: "alert and scanning reflections" },
      },
      {
        id: "s2",
        title: "Drone reveal",
        description: "The camera matches the puddle reflection as the drone rises behind Mara.",
        durationSeconds: 4,
        previousSceneIds: ["s1"],
        transitionIn: "match_cut",
        camera: { movement: "reflection match tilt upward" },
        characterStateUpdates: { mara: "tense, right hand reaching for coat pocket" },
      },
      {
        id: "s3",
        title: "Inherited insert",
        description: "A tight insert of Mara's brass collar pins catching the same neon colors.",
        durationSeconds: 3,
        inheritsFrom: "s2",
        previousSceneIds: ["s2"],
        camera: { framing: "extreme close-up", lensMm: 85 },
        transitionIn: "j_cut",
      },
    ],
  };
}

test("traverses the scene DAG in dependency order", () => {
  const engine = new SceneGraphEngine(sampleGraph());

  assert.deepEqual(engine.topologicalOrder(), ["s1", "s2", "s3"]);
});

test("rejects cyclic previous-scene references", () => {
  const graph = sampleGraph();
  graph.scenes[0] = { ...graph.scenes[0]!, previousSceneIds: ["s3"] };

  assert.throws(() => new SceneGraphEngine(graph), /cycle detected/);
});

test("compiles inherited continuity, character memory, transitions, and timeline stitching", () => {
  const compiled = compileSceneGraph(sampleGraph());

  assert.deepEqual(compiled.orderedSceneIds, ["s1", "s2", "s3"]);
  assert.equal(compiled.totalDurationSeconds, 12);
  assert.equal(compiled.timeline[1]?.startSeconds, 5);
  assert.equal(compiled.timeline[2]?.transition.kind, "j_cut");
  assert.equal(compiled.scenes[1]?.scene.environment.location, "blue-magenta neon alley behind a noodle shop");
  assert.equal(compiled.scenes[2]?.scene.camera.framing, "extreme close-up");
  assert.equal(compiled.scenes[2]?.scene.lighting.setup, "neon practicals with wet bounce");
  assert.match(compiled.scenes[2]?.negativePrompt ?? "", /identity drift/);
  assert.match(compiled.scenes[1]?.continuityPrompt ?? "", /Mara/);
  assert.match(compiled.scenes[1]?.continuityPrompt ?? "", /s3|s2|s1/);
});

test("REST API compiles and serves cached scene graphs", async () => {
  const api = new SceneGraphRestApi({ redis: new InMemorySceneGraphCache(), cacheTtlSeconds: 60 });
  const graph = sampleGraph();

  const compileResponse = await api.handle(new Request("https://api.zveo.local/scene-graphs/compile", {
    method: "POST",
    body: JSON.stringify(graph),
  }));
  assert.equal(compileResponse.status, 201);
  const compileBody = await compileResponse.json() as { status: string };
  assert.equal(compileBody.status, "compiled");

  const cachedResponse = await api.handle(new Request(`https://api.zveo.local/scene-graphs/${graph.id}`));
  assert.equal(cachedResponse.status, 200);
  const cachedBody = await cachedResponse.json() as { compiled: { workflowId: string } };
  assert.equal(cachedBody.compiled.workflowId, graph.id);
});
