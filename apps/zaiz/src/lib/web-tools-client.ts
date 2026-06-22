/**
 * Web search tools — client-safe types.
 * Server logic uses the z-ai-web-dev-sdk functions.invoke API.
 */

export interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  date?: string;
}

export interface SearchResponse {
  ok: boolean;
  query: string;
  count: number;
  results: SearchResult[];
  error?: string;
}

export interface PageContent {
  ok: boolean;
  url: string;
  title: string;
  html: string;
  text: string;
  publishedTime?: string;
  error?: string;
}
