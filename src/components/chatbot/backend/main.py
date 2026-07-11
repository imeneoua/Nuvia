from fastapi import FastAPI
from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

app = FastAPI()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

@app.get("/")
def home():
    return {"message": "Chatbot backend is running!"}


@app.get("/test")
def test():
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents="Say hello to the Nuvia recipe assistant."
    )

    return {
        "reply": response.text
    }