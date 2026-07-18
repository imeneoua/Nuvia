from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from google import genai
import os
from pydantic import BaseModel
from retriever import search_recipes
from fastapi.middleware.cors import CORSMiddleware
from langdetect import detect_langs
from deep_translator import GoogleTranslator

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-nuvia-domain.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

@app.get("/")
def home():
    return {"message": "Chatbot backend is running!"}

@app.get("/test")
def test():
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents="Say hello to the Nuvia recipe assistant."
    )

    return {
        "reply": response.text
    }

SYSTEM_PROMPT = """
You are Nuvia, a friendly and knowledgeable AI recipe assistant.

Answer naturally and conversationally, like a helpful home cook would — 
not like you're describing search results.

When you have relevant recipes:
- Jump straight into the recommendation, don't preface it with phrases 
  like "I have recipes in my database" or "as I mentioned"
- Present ingredients and steps clearly and concisely
- If there are multiple good options, briefly present them and ask 
  which direction they'd like to go
- Only use information that appears in the recipes provided — never 
  invent ingredients or steps

When no relevant recipe is available:
- Say so briefly and naturally, then offer general cooking guidance 
  or a suggestion based on your own knowledge

If the question is unrelated to cooking:
- Gently redirect, explaining you're a recipe assistant

Keep responses focused and avoid unnecessary meta-commentary about 
what you do or don't have access to.
"""

def clean_query(raw_message: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=(
                "Fix any spelling or grammar errors in this cooking-related message. "
                "Return ONLY the corrected text, nothing else, no explanation:\n\n"
                f"{raw_message}"
            )
        )
        return response.text.strip()
    except Exception:
        return raw_message


KNOWN_GREETINGS = {
    "hola": "es", "bonjour": "fr", "salut": "fr", "ciao": "it",
    "hallo": "de", "olá": "pt", "oi": "pt", "hej": "sv",
    "hi": "en", "hello": "en", "hey": "en",
    "merhaba": "tr", "marhaba": "ar", "salaam": "ar",
    "konnichiwa": "ja", "ni hao": "zh",
}

def detect_language(text: str) -> str:
    stripped = text.strip().lower()
    if stripped in KNOWN_GREETINGS:
        return KNOWN_GREETINGS[stripped]
    try:
        if len(text.strip()) < 4:
            return "en"
        langs = detect_langs(text)
        if langs and langs[0].lang != "en" and langs[0].prob > 0.90:
            return langs[0].lang
        return "en"
    except Exception:
        return "en"

def translate_text(text: str, source: str, target: str) -> str:
    try:
        return GoogleTranslator(source=source, target=target).translate(text)
    except Exception:
        return text


conversation_history = []

GREETINGS = {"hi", "hello", "hey", "yo", "sup", "hiya", "greetings"}

def is_smalltalk(message: str, raw_message: str = "") -> bool:
    stripped = message.strip().lower().strip("!.,? ")
    raw_stripped = raw_message.strip().lower().strip("!.,? ")
    return (
        stripped in GREETINGS
        or raw_stripped in KNOWN_GREETINGS
        or len(stripped) <= 2
    )  

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        # Detect language of the raw message
        lang = detect_language(request.message)

        # Translate to English if needed, before cleaning/retrieval
        message_en = translate_text(request.message, source=lang, target="en") if lang != "en" else request.message

        # Fix spelling/grammar (on the English version)
        cleaned_message = clean_query(message_en)

        if is_smalltalk(cleaned_message, request.message):
            context = "No relevant recipes found."
        else:
            recent_user_turns = [
                m.replace("User: ", "") for m in conversation_history if m.startswith("User: ")
            ][-2:]
            search_query = " ".join(recent_user_turns + [cleaned_message])

            recipes = search_recipes(search_query)

            if recipes.empty:
                context = "No relevant recipes found."
            else:
                context = ""
                for _, recipe in recipes.iterrows():
                    context += f"""
        Title:
        {recipe['title']}

        Ingredients:
        {recipe['ingredients']}

        Instructions:
        {recipe['instructions']}

        ------------------------
        """

        # Build the full prompt (still in English)
        prompt = f"""
{SYSTEM_PROMPT}

Recipe Database:

{context}

Previous Conversation:

{chr(10).join(conversation_history)}

Current User Question:

{cleaned_message}

Assistant:
"""

        # Ask Gemini
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )
        reply_en = response.text

        # Translate reply back to the user's language
        reply = translate_text(reply_en, source="en", target=lang) if lang != "en" else reply_en

        # Save conversation (store English version for consistent context)
        conversation_history.append(f"User: {cleaned_message}")
        conversation_history.append(f"Assistant: {reply_en}")

        conversation_history[:] = conversation_history[-10:]
        return {
            "reply": reply
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))