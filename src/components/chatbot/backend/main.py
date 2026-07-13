from fastapi import FastAPI
from dotenv import load_dotenv
from google import genai
import os
from pydantic import BaseModel
from retriever import search_recipes

load_dotenv()

app = FastAPI()
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
        model="gemini-flash-latest",
        contents="Say hello to the Nuvia recipe assistant."
    )

    return {
        "reply": response.text
    }

SYSTEM_PROMPT = """
You are Nuvia, an AI recipe assistant.

Your job is to help users with:

- recipes
- cooking instructions
- meal planning
- ingredient substitutions
- healthy food suggestions
- baking tips

Be friendly.

Keep answers clear and organized.

If someone asks something unrelated to cooking or food,
politely explain that you are a recipe assistant and redirect
the conversation back to cooking.
"""

conversation_history = []
@app.post("/chat")
def chat(request: ChatRequest):
    try:

        # Retrieve the most relevant recipes
        recipes = search_recipes(request.message)

        # Build recipe context
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
        # Save user message
        conversation_history.append(
            f"User: {request.message}"
        )

        # Build the full prompt
        prompt = f"""
{SYSTEM_PROMPT}

Recipe Database:

{context}

Conversation:

{chr(10).join(conversation_history)}
"""

        # Ask Gemini
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        # Save assistant reply
        conversation_history.append(
            f"Assistant: {response.text}"
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }
    
