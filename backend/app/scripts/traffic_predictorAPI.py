"""
Wraps traffic_predictor.py in a FastAPI service so it can be exposed as an API endpoint
so that it can be used by the frontend.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
from .traffic_predictor import run_prediction_pipeline  # your refactored function
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your frontend (adjust if deployed)
origins = [
    "http://localhost:8001",  # or 3000, 8080, etc. depending on your frontend port
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],              # ["POST", "GET"] is more secure
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    area_type: str  # "district" or "street"
    area_name: str
    timestamp: str  # format: "YYYY-MM-DD HH:MM"

@app.post("/predict")
def predict_area(req: PredictionRequest):
    try:
        print("📦 Incoming:", req) # debug
        # try parsing timestamp to fail fast if invalid
        pd.to_datetime(req.timestamp)
        result = run_prediction_pipeline(req.area_type, req.area_name, req.timestamp)
        return result
    except Exception as e:
        print("🔥 Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    return
    
# uvicorn fastapi_app:app --reload --port 8001
