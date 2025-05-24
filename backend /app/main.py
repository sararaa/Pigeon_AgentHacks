import os
import csv
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

NOVITA_API_KEY = os.getenv("NOVITA_AI_API_KEY")
CSV_PATH = os.path.join(os.path.dirname(__file__), "../../frontend/sample_traffic_data.csv")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReportRequest(BaseModel):
    report_type: str
    format: str
    timestamp: str
    location: str
    is_prediction: Optional[bool] = False

@app.post("/generate_report")
def generate_report(req: ReportRequest):
    data = []
    with open(CSV_PATH, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if req.location.lower() == "all" or req.location.lower() in row["road_name"].lower():
                data.append(row)
    if not data:
        return {"error": "No data found for location"}
    payload = {
        "report_type": req.report_type,
        "format": req.format,
        "timestamp": req.timestamp,
        "location": req.location,
        "data": data,
        "is_prediction": req.is_prediction
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NOVITA_API_KEY}"
    }
    response = requests.post("https://api.novita.ai/v1/reports/generate", json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": response.text, "status": response.status_code}