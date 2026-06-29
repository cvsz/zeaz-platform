import { Logger, type RenderProvider } from "@zveo/core";
import { renderJobPayloadSchema, type RenderJobPayload } from "@zveo/contracts";
import { HttpRenderProviderAdapter, MuapiRenderProviderAdapter, ProviderRegistry, type ProviderRenderResult } from "@zveo/providers";

export interface ProviderConfig { endpoint?: string; apiKey?: string }
export interface ProviderRegistryConfig {
  nodeEnv?: string;
  providerMockMode?: string;
  providerTimeoutMs: number;
  veo: ProviderConfig;
  googleFlow: ProviderConfig;
  nanoBanana: ProviderConfig;
}

const providerConfigs: ReadonlyArray<{ provider: RenderProvider; configKey: string; getConfig: (config: ProviderRegistryConfig) => ProviderConfig }> = [
  { provider: "veo", configKey: "VEO_PROVIDER_ENDPOINT", getConfig: (cfg) => cfg.veo },
  { provider: "google_flow", configKey: "GOOGLE_FLOW_PROVIDER_ENDPOINT", getConfig: (cfg) => cfg.googleFlow },
  { provider: "nano_banana", configKey: "NANO_BANANA_PROVIDER_ENDPOINT", getConfig: (cfg) => cfg.nanoBanana },
];

export function createProviderRegistry(config: ProviderRegistryConfig, logger: Logger, fetchImpl?: typeof fetch): ProviderRegistry {
  const registry = new ProviderRegistry(logger);
  const allowMock = config.nodeEnv === "test" || config.providerMockMode === "true";
  for (const { provider, configKey, getConfig } of providerConfigs) {
    const providerConfig = getConfig(config);
    if (provider === "veo") {
      const apiKey = providerConfig.apiKey;
      if (!apiKey && !allowMock) {
        throw new Error(`Missing API Key configuration for ${provider}: VEO provider requires API Key`);
      }
      if (allowMock) {
        registry.register(new MockRenderProviderAdapter(provider));
      } else {
        registry.register(new MuapiRenderProviderAdapter({
          apiKey: apiKey!,
          endpoint: providerConfig.endpoint,
          timeoutMs: config.providerTimeoutMs,
          ...(fetchImpl ? { fetchImpl } : {}),
          logger
        }));
      }
      continue;
    }

    if (!providerConfig.endpoint) {
      if (allowMock) { registry.register(new MockRenderProviderAdapter(provider)); continue; }
      throw new Error(`Missing provider configuration for ${provider}: required ${configKey}`);
    }
    registry.register(new HttpRenderProviderAdapter({ provider, endpoint: providerConfig.endpoint, timeoutMs: config.providerTimeoutMs, ...(providerConfig.apiKey ? { apiKey: providerConfig.apiKey } : {}), ...(fetchImpl ? { fetchImpl } : {}), logger }));
  }
  return registry;
}

export async function executeProviderRender(registry: ProviderRegistry, payload: RenderJobPayload): Promise<ProviderRenderResult> {
  const validated = renderJobPayloadSchema.parse(payload);
  return registry.get(validated.provider).render(validated);
}

class MockRenderProviderAdapter extends HttpRenderProviderAdapter {
  constructor(provider: RenderProvider) { super({ provider, endpoint: "http://mock-provider.local" }); }
  override async render(payload: RenderJobPayload): Promise<ProviderRenderResult> {
    return { providerJobId: `mock-${payload.jobId}`, status: "completed", artifactUri: `s3://${payload.output.bucket}/${payload.output.keyPrefix}/render.mp4`, metadata: { mock: true } };
  }
}
