from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()


# === Novita AI Config ===
NOVITA_API_KEY = "sk_Y5Ts5IQs3XmuCBaIwTRm_VYPsFW9wmcByaIRFql31Ew"  # Replace with your real key
NOVITA_BASE_URL = "https://api.novita.ai/v3/openai"
MODEL_NAME = "qwen/qwen3-0.6b-fp8"  # Cheap, free model

# === FastAPI Setup ===
app = FastAPI()

# Allow all CORS for development (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Request schema ===
class ReportRequest(BaseModel):
    prompt: str = "Generate a basic traffic report."

# === Endpoint ===
@app.post("/generate_report")
def generate_report(request: ReportRequest):
    try:
        client = OpenAI(api_key=NOVITA_API_KEY, base_url=NOVITA_BASE_URL)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": request.prompt}
            ],
            max_tokens=512
        )
        return {"report": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
