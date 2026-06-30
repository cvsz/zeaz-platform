from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import re
import os
import openai

router = APIRouter(prefix="/geo", tags=["GEO Auditor"])

class GeoRequest(BaseModel):
    url: str
    keyword: str

def extract_text_from_html(html: str) -> str:
    if not html: return ""
    clean = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', ' ', html, flags=re.IGNORECASE)
    clean = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', ' ', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<!--[\s\S]*?-->', ' ', clean)
    clean = re.sub(r'<[^>]+>', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

SYSTEM_PROMPT = """You are an expert Generative Engine Optimization (GEO) auditor and AI Search Visibility specialist.
Your task is to analyze the scraped website text and evaluate how well it is optimized to be cited, referenced, and surfaced in AI-driven search answers (ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini) for the user's target search query.

You MUST respond with a single, valid JSON object matching this schema exactly:
{
  "visibility_score": 85, 
  "eeat_score": 75, 
  "citation_likelihood": 65, 
  "readability_score": 90, 
  "summary": "Short overview summarizing the website's AI search readiness...",
  "strengths": ["Strength 1"],
  "weaknesses": ["Weakness 1"],
  "technical_audit": {
    "robots_txt": "Status",
    "schema_markup": "Status",
    "sitemap": "Status"
  },
  "recommendations": [
    {
      "area": "Category",
      "priority": "High/Medium/Low",
      "tips": "Detail..."
    }
  ]
}
DO NOT return any text outside of the JSON object.
"""

@router.post("/audit")
async def audit_url(request: GeoRequest):
    url = request.url
    if not url.startswith('http'):
        url = 'https://' + url

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            res.raise_for_status()
            text = extract_text_from_html(res.text)[:8500]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

    prompt = f"Target URL: {url}\nTarget Keyword: {request.keyword}\n\nScraped Content:\n{text}"
    
    # Normally we call the wallet-service here to deduct credits first.
    # For now, we simulate the LLM call using OpenAI or direct return for the migration demo
    client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy"))
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        # Fallback Mock if no API key
        return {
            "visibility_score": 85,
            "summary": "Mock GEO Audit for migration testing",
            "strengths": ["Good keyword density"],
            "recommendations": [{"area": "Schema", "priority": "High", "tips": "Add JSON-LD FAQ schema"}]
        }
