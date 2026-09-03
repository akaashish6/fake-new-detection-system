import os
import re
import json
import base64
import requests
from urllib.parse import urlparse, quote
from datetime import datetime
from zoneinfo import ZoneInfo
from bs4 import BeautifulSoup
from PIL import Image
import io
from google import genai
from google.genai import types

# Default Gemini flagship model
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please configure your .env file with a valid Gemini API key.")
    return genai.Client(api_key=api_key)

def detect_language(text):
    """Detect Hindi script, Hinglish keywords, or English."""
    if not text:
        return "English"
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
    hinglish_keywords = {
        'karo', 'karne', 'bhejo', 'share', 'viral', 'sach', 'jhooth', 'jhut',
        'subah', 'sham', 'raat', 'modi', 'sarkar', 'yojana', 'free', 'milega',
        'dekho', 'dhyan', 'kripya', 'dost', 'bhai', 'khabar', 'news', 'rupaye',
        'hai', 'hain', 'mein', 'me', 'ke', 'ka', 'ki', 'se', 'ko', 'par', 'per',
        'ne', 'bhi', 'nhi', 'nahi', 'hoga', 'hogi', 'raha', 'rahi', 'rahe',
        'kya', 'kaise', 'kab', 'kahan', 'kyun', 'wala', 'wali', 'wale', 'mil',
        'rha', 'rhi', 'rhe', 'diya', 'diye', 'chahiye', 'karna', 'karto', 'dene',
        'milegi', 'rahenge', 'rahengi', 'milgaya', 'milgaye', 'paise', 'paisa'
    }
    words = [w.lower() for w in re.findall(r'\b\w+\b', text)]
    if any(w in hinglish_keywords for w in words):
        return "Hinglish"
    return "English"

def extract_text_from_url(url):
    """Scrapes news article title and snippet from URL."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=8)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string.strip() if soup.title and soup.title.string else ""
        meta = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        meta_desc = meta['content'].strip() if meta and meta.get('content') else ""
        paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 30]
        snippet = " ".join(paragraphs[:5])
        return f"URL Title: {title}\nMeta Description: {meta_desc}\nSnippet: {snippet}".strip()
    except Exception as e:
        return f"URL: {url} (Scrape note: {str(e)})"

def extract_search_query(text):
    """Clean text to extract key search keywords for web search."""
    if not text:
        return ""
    clean = re.sub(r'https?://\S+', '', text)
    clean = re.sub(r'[^\w\s]', ' ', clean)
    words = clean.split()
    if len(words) <= 6:
        return " ".join(words)
    stopwords = {
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between',
        'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
        'up', 'down', 'out', 'of', 'off', 'over', 'under', 'again', 'further',
        'then', 'once', 'this', 'that', 'these', 'those', 'am', 'stand', 'stands',
        'today', 'per', 'gram', 'claim', 'news', 'viral', 'says', 'said'
    }
    filtered = [w for w in words if w.lower() not in stopwords]
    return " ".join(filtered[:6]) if filtered else " ".join(words[:6])

def resolve_publisher_url(encoded_url):
    """Try to decode Google News redirect URL to direct publisher link."""
    if not encoded_url or "news.google.com" not in encoded_url:
        return encoded_url
    try:
        match = re.search(r"/(?:rss/)?articles/([^/?]+)", encoded_url)
        if match:
            encoded = match.group(1)
            padded = encoded + "=" * (-len(encoded) % 4)
            decoded = base64.urlsafe_b64decode(padded)
            url_match = re.search(rb"https?://[^\x00\s\"<>]+", decoded)
            if url_match:
                candidate = url_match.group(0).decode("utf-8", errors="ignore").split("\x00")[0]
                if candidate.startswith(("http://", "https://")):
                    return candidate
    except Exception:
        pass
    return encoded_url

def search_web_sources(query, max_results=4):
    """Search Google News RSS for real-time web verification sources."""
    search_term = extract_search_query(query)
    if not search_term:
        return []

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    results = []
    seen_urls = set()

    # Try specific query first, then clean topic query if needed
    queries = [search_term]
    topic_only = re.sub(r'\b\d+\b', '', search_term).strip()
    if topic_only and topic_only != search_term and len(topic_only) > 3:
        queries.append(topic_only)

    for q in queries:
        if len(results) >= max_results:
            break
        rss_url = f"https://news.google.com/rss/search?q={quote(q)}&hl=en-IN&gl=IN&ceid=IN:en"
        try:
            res = requests.get(rss_url, headers=headers, timeout=8)
            res.raise_for_status()
            soup = BeautifulSoup(res.content, "xml")
            items = soup.find_all("item")

            for item in items:
                if len(results) >= max_results:
                    break
                title = item.find("title").get_text(" ", strip=True) if item.find("title") else ""
                google_url = item.find("link").get_text(strip=True) if item.find("link") else ""
                source_tag = item.find("source")
                source_name = source_tag.get_text(" ", strip=True) if source_tag else "News Source"
                pub_date = item.find("pubDate").get_text(" ", strip=True) if item.find("pubDate") else ""
                desc_tag = item.find("description")
                desc = desc_tag.get_text(" ", strip=True) if desc_tag else ""
                clean_desc = BeautifulSoup(desc, "html.parser").get_text(" ", strip=True) if desc else ""

                direct_url = resolve_publisher_url(google_url)

                if title and direct_url and direct_url not in seen_urls:
                    seen_urls.add(direct_url)
                    results.append({
                        "title": title,
                        "source": source_name,
                        "url": direct_url,
                        "published": pub_date,
                        "content": f"{title} - {clean_desc}"[:1500]
                    })
        except Exception as e:
            print(f"[WEB SEARCH] Failed for '{q}': {e}")

    return results

def parse_json_response(raw_text):
    """Safely extracts JSON from raw Gemini response text."""
    if not raw_text:
        raise ValueError("Empty response from Gemini API.")
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\n?```$', '', cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r'(\{[\s\S]*\})', cleaned)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse JSON output: {raw_text[:200]}")

def analyze_claim(input_type, content, image_bytes=None, audio_bytes=None, audio_mime_type=None):
    """Main fact-checking function powered by Gemini 3.6 Flash & Web Grounding."""
    client = get_client()

    extracted_text = ""
    pil_image = None
    audio_part = None

    if input_type == 'url':
        extracted_text = extract_text_from_url(content)
        claim_context = f"Analyze the credibility of this news article / URL:\nURL: {content}\nExtracted Content:\n{extracted_text}"
    elif input_type == 'image':
        if not image_bytes:
            raise ValueError("No image provided.")
        pil_image = Image.open(io.BytesIO(image_bytes))
        claim_context = "Analyze the text, claim, or news screenshot in this image for truthfulness and digital tampering."
    elif input_type == 'audio':
        if not audio_bytes:
            raise ValueError("No audio provided.")
        raw_mime = (audio_mime_type or "audio/mp3").split(";")[0].strip().lower()
        mime = "audio/mp3"
        for ext in ["webm", "wav", "ogg", "mp4", "aac", "mpeg"]:
            if ext in raw_mime:
                mime = f"audio/{ext}"
                break
        audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime)
        claim_context = "Listen to this voice note carefully. Transcribe and verify the spoken claim for truthfulness."
    else:
        extracted_text = content
        claim_context = f"Analyze the credibility of the following claim / news story:\n\"{content}\""

    detected_lang = detect_language(extracted_text or content)

    # 1. Perform Web Evidence Search
    web_sources = search_web_sources(extracted_text or content, max_results=4)
    web_evidence = ""
    if web_sources:
        web_evidence = "\n\nVERIFIED WEB EVIDENCE:\n"
        for i, s in enumerate(web_sources, 1):
            web_evidence += f"SOURCE {i}: {s['title']} ({s['source']})\nURL: {s['url']}\nCONTENT: {s['content']}\n\n"
    else:
        web_evidence = "\n\nWEB EVIDENCE: No direct web search hit found. Use your general factual knowledge, domain logic, and numerical checks to evaluate."

    # 2. System Instruction
    current_date = datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%d %B %Y")

    if detected_lang == "Hindi":
        lang_directive = (
            "MANDATORY LANGUAGE RULE: The user input is in DEVANAGARI HINDI (हिंदी).\n"
            "You MUST write 'claim_text', 'reasoning', and ALL items in 'verdict_reasons' strictly in DEVANAGARI HINDI script.\n"
            "Do NOT use English language or Latin script for reasoning or verdict_reasons.\n"
        )
    elif detected_lang == "Hinglish":
        lang_directive = (
            "MANDATORY LANGUAGE RULE: The user input is in HINGLISH (Hindi language spoken in Roman/Latin script).\n"
            "You MUST write 'claim_text', 'reasoning', and ALL items in 'verdict_reasons' strictly in HINGLISH (Hindi words written in Latin alphabet, e.g., 'Yeh claim bilkul jhooth hai kyunki...').\n"
            "CRITICAL: Do NOT translate the explanation to English! Keep the entire explanation in conversational Roman Hindi/Hinglish.\n"
            "Example Hinglish output:\n"
            "reasoning: 'Yeh claim bilkul galat aur fake hai. Bharat me petrol ka rate ₹90-₹110 per litre hai, ₹2000 per litre ki khabar ek viral afwah hai.'\n"
            "verdict_reasons: ['Petrol ka actual price ₹90 se ₹110 ke beech hai, ₹2000 per litre bilkul galat rate hai.', 'Oil companies ne aisa koi price hike announce nahi kiya.']\n"
        )
    else:
        lang_directive = (
            "MANDATORY LANGUAGE RULE: The user input is in ENGLISH.\n"
            "Write 'claim_text', 'reasoning', and 'verdict_reasons' strictly in clear English.\n"
        )

    system_instruction = (
        "You are an unbiased AI Fact-Checker specializing in global news, digital rumors, social media claims, "
        "regional Indian context, Hindi, Hinglish, viral WhatsApp messages, and financial rates.\n\n"
        f"CURRENT DATE: {current_date}.\n\n"
        f"{lang_directive}\n"
        "VERDICT DETERMINATION RULES:\n"
        "1. Real: Reliable current sources or facts directly support the main claim.\n"
        "2. Fake: Verified sources, factual logic, or standard market prices directly contradict the claim. "
        "For example, absurd numbers (e.g. Gold at ₹15,201/g when standard price is ~₹7,000-₹8,000/g) or known scam forwards MUST be marked FAKE.\n"
        "3. Misleading: Claim has a partial truth but distorts context or facts.\n"
        "4. Unverifiable: ONLY use Unverifiable as a last resort if there is zero logical or factual way to evaluate the claim.\n"
        "Do NOT mark absurd claims or false numerical rates as Unverifiable — evaluate them using factual domain knowledge.\n\n"
        "RESPONSE RULES:\n"
        "- Return ONLY a raw JSON object.\n"
        "- Schema:\n"
        "{\n"
        f'  "claim_text": "Summary of claim in {detected_lang}",\n'
        '  "verdict": "Real | Fake | Misleading | Unverifiable",\n'
        '  "confidence_score": 95,\n'
        f'  "language_detected": "{detected_lang}",\n'
        f'  "reasoning": "Clear explanation written strictly in {detected_lang}",\n'
        '  "verdict_reasons": [\n'
        f'    "Bullet point 1 strictly in {detected_lang}",\n'
        f'    "Bullet point 2 strictly in {detected_lang}",\n'
        f'    "Bullet point 3 strictly in {detected_lang}"\n'
        '  ],\n'
        '  "manipulation_techniques": ["Exaggerated Numbers", "False Urgency"],\n'
        '  "sources": [{"title": "Source Title", "url": "https://..."}]\n'
        "}"
    )

    user_prompt = (
        f"FACT-CHECK REQUEST ({input_type.upper()}):\n{claim_context}\n\n"
        f"MUST RESPOND STRICTLY IN LANGUAGE: {detected_lang}\n"
        f"DO NOT TRANSLATE TO ENGLISH IF LANGUAGE IS HINGLISH OR HINDI!\n\n"
        f"{web_evidence}"
    )

    contents = []
    if pil_image:
        contents.append(pil_image)
    if audio_part:
        contents.append(audio_part)
    contents.append(user_prompt)

    models_to_try = [
        DEFAULT_MODEL,
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    models_to_try = list(dict.fromkeys(models_to_try))

    response_text = None
    last_error = None
    for m in models_to_try:
        try:
            cfg = types.GenerateContentConfig(system_instruction=system_instruction)
            resp = client.models.generate_content(model=m, contents=contents, config=cfg)
            response_text = resp.text
            break
        except Exception as e:
            last_error = e

    if not response_text:
        raise RuntimeError(f"Gemini API error across models: {last_error}")

    parsed = parse_json_response(response_text)

    parsed_sources = parsed.get("sources", [])
    if not isinstance(parsed_sources, list):
        parsed_sources = []
    if web_sources:
        existing_urls = {s.get("url") for s in parsed_sources if isinstance(s, dict)}
        for ws in web_sources:
            if ws["url"] not in existing_urls:
                parsed_sources.append({"title": ws["title"], "url": ws["url"]})
    parsed["sources"] = parsed_sources[:4]

    verdict = parsed.get("verdict", "Unverifiable")
    if verdict not in ["Real", "Fake", "Misleading", "Unverifiable"]:
        verdict = "Unverifiable"

    try:
        conf = int(parsed.get("confidence_score", 85))
        conf = max(0, min(100, conf))
    except (ValueError, TypeError):
        conf = 85

    claim_txt = parsed.get("claim_text", "").strip() or content
    verdict_reasons = parsed.get("verdict_reasons", [])
    if not isinstance(verdict_reasons, list) or not verdict_reasons:
        verdict_reasons = []

    return {
        "claim_text": claim_txt,
        "verdict": verdict,
        "confidence_score": conf,
        "language_detected": parsed.get("language_detected", detected_lang),
        "reasoning": parsed.get("reasoning", "Analysis completed based on factual knowledge and web grounding."),
        "verdict_reasons": verdict_reasons,
        "manipulation_techniques": parsed.get("manipulation_techniques", []),
        "sources": parsed.get("sources", [])
    }
