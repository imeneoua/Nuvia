from fastapi import FastAPI
from dotenv import load_dotenv
from google import genai
import os
from pydantic import BaseModel

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


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=request.message
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "error": str(e)
        }