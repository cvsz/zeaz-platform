export type SceneId = string;
export type CharacterId = string;
export type VisualReferenceId = string;
export type EnvironmentId = string;

export type TransitionKind =
  | "cut"
  | "match_cut"
  | "dissolve"
  | "whip_pan"
  | "j_cut"
  | "l_cut"
  | "fade";

export interface CameraState {
  framing: string;
  movement: string;
  lensMm: number;
  aperture?: string;
  angle?: string;
  stabilization?: string;
}

export interface LightingState {
  setup: string;
  colorTemperature: string;
  contrast: string;
  direction?: string;
  motivatedBy?: string;
}

export interface EnvironmentState {
  id: EnvironmentId;
  location: string;
  timeOfDay: string;
  weather: string;
  geography?: string;
  persistentProps: string[];
  continuityNotes?: string;
}

export interface CharacterMemory {
  id: CharacterId;
  name: string;
  appearance: string;
  wardrobe: string;
  voice?: string;
  currentState?: string;
  emotionalArc?: string;
  referenceAssetIds: string[];
  visualReferenceIds: VisualReferenceId[];
}

export interface VisualEmbeddingReference {
  id: VisualReferenceId;
  embeddingUri: string;
  description: string;
  assetIds: string[];
  tags: string[];
  weight?: number;
}

export interface ContinuityPolicy {
  inheritCamera?: boolean;
  inheritLighting?: boolean;
  persistEnvironment?: boolean;
  carryCharacters?: boolean;
}

export interface SceneNodeInput {
  id: SceneId;
  title: string;
  description: string;
  durationSeconds: number;
  inheritsFrom?: SceneId;
  previousSceneIds?: SceneId[];
  characterIds?: CharacterId[];
  visualReferenceIds?: VisualReferenceId[];
  environment?: Partial<EnvironmentState> & Pick<EnvironmentState, "id">;
  camera?: Partial<CameraState>;
  lighting?: Partial<LightingState>;
  continuityPolicy?: ContinuityPolicy;
  characterStateUpdates?: Record<CharacterId, string>;
  transitionIn?: TransitionKind;
  priority?: number;
}

export interface SceneGraphInput {
  id: string;
  name: string;
  styleGuide: string;
  targetPlatforms?: string[];
  characters?: CharacterMemory[];
  visualReferences?: VisualEmbeddingReference[];
  scenes: SceneNodeInput[];
}

export interface ResolvedSceneNode {
  id: SceneId;
  title: string;
  description: string;
  durationSeconds: number;
  inheritsFrom?: SceneId;
  previousSceneIds: SceneId[];
  characterIds: CharacterId[];
  visualReferenceIds: VisualReferenceId[];
  environment: EnvironmentState;
  camera: CameraState;
  lighting: LightingState;
  continuityPolicy: Required<ContinuityPolicy>;
  characterStateUpdates: Record<CharacterId, string>;
  transitionIn: TransitionKind;
  priority: number;
}

export interface TransitionPlan {
  fromSceneId?: SceneId;
  toSceneId: SceneId;
  kind: TransitionKind;
  durationSeconds: number;
  rationale: string;
  cameraBridge: string;
  lightingBridge: string;
}

export interface TimelineSegment {
  sceneId: SceneId;
  startSeconds: number;
  endSeconds: number;
  transition: TransitionPlan;
}

export interface CompiledScene {
  workflowId: string;
  scene: ResolvedSceneNode;
  order: number;
  timeline: TimelineSegment;
  continuityPrompt: string;
  prompt: string;
  negativePrompt: string;
  characterMemory: CharacterMemory[];
  visualReferences: VisualEmbeddingReference[];
  transitionPlan: TransitionPlan;
  metadata: Record<string, unknown>;
}

export interface CompiledSceneGraph {
  workflowId: string;
  name: string;
  orderedSceneIds: SceneId[];
  timeline: TimelineSegment[];
  scenes: CompiledScene[];
  totalDurationSeconds: number;
}
