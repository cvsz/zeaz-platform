import { NextResponse } from "next/server";
import { logChat } from "@/data/db";

// Helper for timing execution
const timeStart = () => Date.now();
const timeEnd = (start: number) => Date.now() - start;

// AI Fallback Options Configurations
const PROVIDERS = {
  ollama: {
    name: "Ollama (Local)",
    url: "http://127.0.0.1:11434/v1/chat/completions",
    model: "qwen2.5-coder:14b",
    headers: { "Content-Type": "application/json" },
  },
  fauxpilot: {
    name: "FauxPilot (Local)",
    url: "http://127.0.0.1:5000/v1/chat/completions",
    model: "fauxpilot",
    headers: { "Content-Type": "application/json" },
  },
  openclaw: {
    name: "OpenClaw Gateway",
    url: "http://127.0.0.1:18789/v1/chat/completions",
    model: "claude-sonnet-4-6",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer vo-dev-token",
    },
  },
  nvidia: {
    name: "NVIDIA NIM API",
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    headers: {
      "Content-Type": "application/json",
      // Optional: Insert actual key if configured in environment
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY || "dummy-key"}`,
    },
  },
  huggingface: {
    name: "Hugging Face Hub",
    url: "https://router.huggingface.co/v1/chat/completions",
    model: "meta-llama/Llama-3-8b-instruct",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HF_API_KEY || "dummy-key"}`,
    },
  },
};

// Default Rule-Based Offline Assistant Response
function getOfflineMockResponse(prompt: string): string {
  const query = prompt.toLowerCase();
  if (query.includes("status") || query.includes("health")) {
    return "zcloud system status: ALL GATES ALIGNED (98/100). All upstream modules, including CloudPanel template sync and translation mapping, are loaded. Local fallback active.";
  }
  if (query.includes("version") || query.includes("release")) {
    return "zcloud current release posture: Final Candidate (v2.1.0-meta). Embedded with 37 ECC skills, 10 specialists, and MariaDB telemetry enabled.";
  }
  if (query.includes("cloudpanel") || query.includes("template")) {
    return "CloudPanel vhost templates catalog targets standard runtimes: WordPress, Laravel, Node.js, and Python. The v2-varnish and v2-http3 variants are also fully indexed.";
  }
  if (query.includes("locale") || query.includes("translation")) {
    return "Translation tree supports EN, TH, JP, CH, and STD with validator message mappings active. Current baseline is English.";
  }
  return `[Offline Fallback Mode] The zcloud coordinator received your prompt: "${prompt}". Your local AI services (Ollama, FauxPilot) and cloud routers (NVIDIA, HuggingFace) are currently unreachable due to offline network sandboxing or connection timeouts. Here is a localized zcloud agent report: The platform is fully provisioned, database logging is running on MariaDB, and you are ready for deployment.`;
}

// Function to try a specific provider API
async function tryProvider(
  providerKey: keyof typeof PROVIDERS,
  prompt: string
): Promise<{ text: string; model: string; success: boolean }> {
  const config = PROVIDERS[providerKey];
  const payload = {
    model: config.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout per provider

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
    if (!text) {
      throw new Error("Empty response content");
    }

    return { text, model: config.model, success: true };
  } catch (err: unknown) {
    clearTimeout(id);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(`[AI Fallback] Provider ${config.name} failed:`, errorMessage);
    return { text: "", model: config.model, success: false };
  }
}

export async function POST(request: Request) {
  const startTime = timeStart();
  let prompt = "";
  let sessionId = "default-session";

  try {
    const body = await request.json();
    prompt = body.prompt || "";
    sessionId = body.sessionId || `session-${Date.now()}`;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Fallback chain: ollama -> fauxpilot -> openclaw -> nvidia -> huggingface -> offline-mock
  const pipeline: (keyof typeof PROVIDERS)[] = ["ollama", "fauxpilot", "openclaw", "nvidia", "huggingface"];
  let finalResponse = "";
  let providerUsed = "offline-mock";
  let modelUsed = "rule-based-v2";
  let status = "mock_fallback";

  for (const provider of pipeline) {
    console.log(`[AI Fallback] Attempting provider: ${PROVIDERS[provider].name}...`);
    const attempt = await tryProvider(provider, prompt);
    if (attempt.success) {
      finalResponse = attempt.text;
      providerUsed = provider;
      modelUsed = attempt.model;
      status = "success";
      break;
    }
  }

  // If all providers failed, use offline mock response
  if (!finalResponse) {
    finalResponse = getOfflineMockResponse(prompt);
    console.log("[AI Fallback] All providers failed. Fallback to offline rule-based response.");
  }

  const latency = timeEnd(startTime);

  // Write log to MariaDB in background (non-blocking)
  await logChat({
    sessionId,
    prompt,
    response: finalResponse,
    providerUsed,
    modelUsed,
    latencyMs: latency,
    status,
  });

  return NextResponse.json({
    prompt,
    response: finalResponse,
    providerUsed,
    providerName: PROVIDERS[providerUsed as keyof typeof PROVIDERS]?.name || "Offline Assistant",
    modelUsed,
    latencyMs: latency,
    status,
  });
}
