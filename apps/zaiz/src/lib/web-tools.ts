import { getZAI } from "./glm";
import type { SearchResult, SearchResponse, PageContent } from "./web-tools-client";

/**
 * Web search + research tools — server-only.
 *
 * Uses the z-ai-web-dev-sdk `functions.invoke` API for web_search and
 * page_reader. These are server-side SDK calls.
 */

/** Perform a web search. */
export async function webSearch(query: string, num = 8): Promise<SearchResponse> {
  try {
    const zai = await getZAI();
    const results = await zai.functions.invoke("web_search", { query, num });
    if (!Array.isArray(results)) {
      return { ok: false, query, count: 0, results: [], error: "Unexpected response format" };
    }
    return {
      ok: true,
      query,
      count: results.length,
      results: results.map((r: { url: string; name: string; snippet: string; host_name: string; date?: string }) => ({
        url: r.url,
        name: r.name,
        snippet: r.snippet,
        host_name: r.host_name,
        date: r.date,
      })),
    };
  } catch (err) {
    return {
      ok: false,
      query,
      count: 0,
      results: [],
      error: err instanceof Error ? err.message : "Search failed",
    };
  }
}

/** Read a web page and extract its content. */
export async function readPage(url: string): Promise<PageContent> {
  try {
    const zai = await getZAI();
    const result = await zai.functions.invoke("page_reader", { url });
    const data = (result as { data?: { title?: string; html?: string; publishedTime?: string } }).data;
    if (!data) {
      return { ok: false, url, title: "", html: "", text: "", error: "No data returned" };
    }
    // Strip HTML tags for a plain-text preview.
    const text = (data.html ?? "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    return {
      ok: true,
      url,
      title: data.title ?? url,
      html: data.html ?? "",
      text,
      publishedTime: data.publishedTime,
    };
  } catch (err) {
    return {
      ok: false,
      url,
      title: "",
      html: "",
      text: "",
      error: err instanceof Error ? err.message : "Page read failed",
    };
  }
}

/** Summarize text using GLM (streams). */
export async function* summarizeText(text: string, query?: string): AsyncGenerator<string, void, unknown> {
  // Use the local model import lazily to avoid circular deps — call runStream via dynamic import.
  const { runStream } = await import("./glm");
  const systemPrompt = `You are a research assistant. Summarize the following content concisely. ${query ? `Focus on: ${query}.` : ""} Use bullet points and keep it under 200 words.`;
  const messages = [{ role: "user" as const, content: `Summarize this:\n\n${text.slice(0, 8000)}` }];
  for await (const delta of runStream(systemPrompt, messages, null)) {
    yield delta;
  }
}

export type { SearchResult, SearchResponse, PageContent };
