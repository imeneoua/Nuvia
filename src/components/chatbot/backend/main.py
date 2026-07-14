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
        model="gemini-3.1-flash-lite",
        contents="Say hello to the Nuvia recipe assistant."
    )

    return {
        "reply": response.text
    }

SYSTEM_PROMPT = """
You are Nuvia, an AI recipe assistant.

Use the recipes provided in the Recipe Database to answer the user's question.

If relevant recipes are found:
- Recommend the best recipe(s).
- Mention the ingredients.
- Summarize the cooking steps.
- Do not invent information that isn't in the database.

If no relevant recipe is found,
say so politely and then provide general cooking advice.

If the question is unrelated to cooking,
politely explain that you are a recipe assistant.
"""

conversation_history = []
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        # Retrieve the most relevant recipes
        recipes = search_recipes(request.message)

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

        # Build the full prompt
        prompt = f"""
{SYSTEM_PROMPT}

Recipe Database:

{context}

Previous Conversation:

{chr(10).join(conversation_history)}

Current User Question:

{request.message}

Assistant:
"""

        # Ask Gemini
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        # Save conversation
        conversation_history.append(f"User: {request.message}")
        conversation_history.append(f"Assistant: {response.text}")

        # Keep only last 10 messages again
        conversation_history[:] = conversation_history[-10:]
        return {
            "reply": response.text
        }

    except Exception as e:
        print(e)
        return {
            "error": str(e)
        }