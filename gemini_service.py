import os
import re
import json
import requests
from bs4 import BeautifulSoup
from PIL import Image
import io
from google import genai
from google.genai import types

DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set. Please configure your .env file with a valid Gemini API key.")
    return genai.Client(api_key=api_key)

def detect_language(text):
    """
    Basic detection for Hindi script or common Hinglish patterns.
    """
    if not text:
        return "English"
        
    # Check for Devanagari script range \u0900-\u097F
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
        
    # Common Hinglish words check
    hinglish_keywords = [
        'karo', 'karne', 'bhejo', 'share', 'viral', 'sach', 'jhooth', 'jhut',
        'subah', 'sham', 'raat', 'modi', 'sarkar', 'yojana', 'free', 'milega',
        'dekho', 'dhyan', 'kripya', 'dost', 'bhai', 'khabar', 'news'
    ]
    words = re.findall(r'\b\w+\b', text.lower())
    match_count = sum(1 for w in words if w in hinglish_keywords)
    if match_count >= 2:
        return "Hinglish"
        
    return "English"

def extract_text_from_url(url):
    """
    Scrapes title and main paragraph text from news article URL.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=8)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title
        title = soup.title.string.strip() if soup.title and soup.title.string else ""
        
        # Extract meta description
        meta_desc = ""
        meta = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        if meta and meta.get('content'):
            meta_desc = meta['content'].strip()
            
        # Extract main paragraphs
        paragraphs = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 30]
        content_snippet = " ".join(paragraphs[:5])  # First 5 paragraphs
        
        extracted = f"URL Title: {title}\nMeta Description: {meta_desc}\nContent Snippet: {content_snippet}"
        return extracted.strip()
    except Exception as e:
        return f"URL Link: {url} (Note: Could not scrape full content automatically: {str(e)})"

def parse_json_response(raw_text):
    """
    Safely extracts JSON from raw Gemini response text.
    """
    if not raw_text:
        raise ValueError("Empty response received from Gemini API.")
        
    # Remove markdown code fence if present
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```(?:json)?\n?', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\n?```$', '', cleaned)
        cleaned = cleaned.strip()
        
    # Attempt parsing
    try:
        data = json.loads(cleaned)
        return data
    except json.JSONDecodeError:
        # Regex search for json block if extraneous text exists
        match = re.search(r'(\{[\s\S]*\})', cleaned)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Failed to parse structured JSON from model output: {raw_text[:200]}...")

def analyze_claim(input_type, content, image_bytes=None):
    """
    Main fact-checking routine using Gemini API with Search Grounding tool.
    """
    client = get_client()
    
    # 1. Prepare input content & language context
    extracted_text = ""
    pil_image = None
    
    if input_type == 'url':
        extracted_text = extract_text_from_url(content)
        claim_context = f"Analyze the credibility of this news article / claim URL.\nURL: {content}\nExtracted Content:\n{extracted_text}"
    elif input_type == 'image':
        if not image_bytes:
            raise ValueError("No image provided for image analysis.")
        pil_image = Image.open(io.BytesIO(image_bytes))
        claim_context = "Analyze the text, claim, post, or news screenshot in this image for truthfulness and authenticity."
    else:  # text
        extracted_text = content
        claim_context = f"Analyze the credibility of the following claim / news story:\n\"{content}\""
        
    detected_lang = detect_language(extracted_text or content)
    
    # 2. Construct Fact-Checking System Prompt
    system_instruction = (
        "You are an expert, unbiased AI Fact-Checker specializing in global news, digital rumors, social media claims, "
        "and regional Indian context (including Hindi, Hinglish, viral WhatsApp messages, fake government notices, and clickbait).\n"
        "Your task is to thoroughly verify the provided claim/image/link using web search grounding and critical logical reasoning.\n\n"
        "RULES FOR YOUR RESPONSE:\n"
        "1. You MUST respond with ONLY a valid, raw JSON object (no markdown intro or extra commentary).\n"
        "2. Verdict MUST be one of: \"Real\", \"Fake\", \"Misleading\", \"Unverifiable\".\n"
        "3. Confidence score MUST be an integer between 0 and 100.\n"
        "4. Language detected MUST be one of: \"English\", \"Hindi\", \"Hinglish\", or appropriate language.\n"
        "5. Reasoning MUST be concise (2-4 sentences) explaining the fact check, background context, and truth status in clear, objective terms.\n"
        "6. Manipulation techniques MUST be a list of tags (0 to 4 max) if present (e.g., [\"Emotional Language\", \"False Urgency\", \"Fabricated Quote\", \"Out of Context Claim\", \"Manipulated Image\", \"Misleading Headline\"]). If none found, return an empty list [].\n"
        "7. Sources MUST be a list of 1 to 4 credible source objects used for verification: [{\"title\": \"Source Name / Fact Check Title\", \"url\": \"https://...\"}]. If specific sources aren't available, provide domain recommendations.\n\n"
        "JSON SCHEMA SPECIFICATION:\n"
        "{\n"
        '  "verdict": "Real | Fake | Misleading | Unverifiable",\n'
        '  "confidence_score": 90,\n'
        '  "language_detected": "English | Hindi | Hinglish",\n'
        '  "reasoning": "Concise factual breakdown...",\n'
        '  "manipulation_techniques": ["Emotional Language", "False Urgency"],\n'
        '  "sources": [{"title": "PIB Fact Check / Alt News / Reuters", "url": "https://..."}]\n'
        "}"
    )
    
    user_prompt = f"FACT-CHECK REQUEST ({input_type.upper()}):\n{claim_context}\n\nDetected Primary Language Context: {detected_lang}.\n"
    if detected_lang in ['Hindi', 'Hinglish']:
        user_prompt += "Note: The claim is in Hindi/Hinglish. Please understand the cultural context, local idioms, and viral rumors, but provide clear reasoning in English or easy Hinglish for the user.\n"
    
    # 3. Call Gemini API
    contents = []
    if pil_image:
        contents.append(pil_image)
    contents.append(user_prompt)
    
    # List active, supported models in order of priority
    models_to_try = [
        DEFAULT_MODEL,
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash"
    ]
    models_to_try = list(dict.fromkeys(models_to_try))
    
    last_error = None
    response_text = None
    grounding_sources = []
    
    for model_name in models_to_try:
        try:
            # Try with Google Search Grounding first
            config_with_tools = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                tools=[types.Tool(google_search=types.GoogleSearch())],
            )
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config_with_tools
                )
            except Exception as tool_err:
                # If grounding tool raises error (e.g. quota limit), retry without tools
                config_no_tools = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.1,
                )
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config_no_tools
                )

            response_text = response.text
            
            # Extract grounding metadata if provided by Gemini Search Tool
            try:
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                        gm = candidate.grounding_metadata
                        if hasattr(gm, 'grounding_chunks') and gm.grounding_chunks:
                            for chunk in gm.grounding_chunks:
                                if hasattr(chunk, 'web') and chunk.web:
                                    web_title = getattr(chunk.web, 'title', '') or 'Fact Check Source'
                                    web_url = getattr(chunk.web, 'uri', '')
                                    if web_url and not any(s['url'] == web_url for s in grounding_sources):
                                        grounding_sources.append({"title": web_title, "url": web_url})
            except Exception:
                pass
                
            break  # Success
        except Exception as e:
            last_error = e
            continue
            
    if not response_text:
        raise RuntimeError(f"Gemini API Call failed across available models: {str(last_error)}")
        
    # 4. Parse JSON Response
    parsed = parse_json_response(response_text)
    
    # Merge grounding sources if response didn't include enough sources
    if grounding_sources:
        existing_urls = {s.get('url') for s in parsed.get('sources', []) if isinstance(s, dict)}
        for gs in grounding_sources[:3]:
            if gs['url'] not in existing_urls:
                parsed.setdefault('sources', []).append(gs)
                
    # Normalize schema & defaults
    verdict = parsed.get('verdict', 'Unverifiable')
    if verdict not in ['Real', 'Fake', 'Misleading', 'Unverifiable']:
        verdict = 'Unverifiable'
        
    confidence = parsed.get('confidence_score', 75)
    try:
        confidence = int(confidence)
        confidence = max(0, min(100, confidence))
    except (ValueError, TypeError):
        confidence = 75
        
    result = {
        'verdict': verdict,
        'confidence_score': confidence,
        'language_detected': parsed.get('language_detected', detected_lang),
        'reasoning': parsed.get('reasoning', 'Fact checking analysis completed based on available web references.'),
        'manipulation_techniques': parsed.get('manipulation_techniques', []),
        'sources': parsed.get('sources', [])
    }
    
    return result
