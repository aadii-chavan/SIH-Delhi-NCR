from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import uvicorn
from services.fetch_cpcb import fetch_cpcb_data
from services.fetch_firms import fetch_firms_fire_count
from services.source_processor import compute_source_breakdown

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/source-breakdown")
async def get_source_breakdown():
    # Fetch data concurrently
    cpcb_task = asyncio.create_task(fetch_cpcb_data())
    firms_task = asyncio.create_task(fetch_firms_fire_count())
    pollutants = await cpcb_task
    fire_count = await firms_task
    breakdown = compute_source_breakdown(pollutants, fire_count)
    # Simulate previous day's breakdown for comparison
    prev_breakdown = {
        "stubble": max(0, breakdown["stubble"] - 5),  # 5% decrease
        "traffic": max(0, breakdown["traffic"] - 5),  # 5% decrease  
        "industrial": breakdown["industrial"],        # No change
        "other": 100 - max(0, breakdown["stubble"] - 5) - max(0, breakdown["traffic"] - 5) - breakdown["industrial"]
    }
    return {
        "timestamp": None,
        "zone": "Delhi Central",
        "sources": breakdown,
        "previous": prev_breakdown
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
