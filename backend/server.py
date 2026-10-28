from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

from kp_engine import build_chart, sky_positions, SOURCE, CONTRACT_VERSION
from cities import search_cities

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI(title="KP Insight API")
api_router = APIRouter(prefix="/api")


class ChartRequest(BaseModel):
    name: str = Field(default="Untitled", max_length=80)
    date: str
    time: str
    latitude: float = Field(ge=-66.5, le=66.5)
    longitude: float = Field(ge=-180, le=180)
    tz: Optional[str] = None
    utc_offset: Optional[float] = Field(default=None, ge=-14, le=14)


def _local_to_utc(date: str, time: str, tz: Optional[str], offset: Optional[float]) -> datetime:
    try:
        naive = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(400, "Date must be YYYY-MM-DD and time HH:MM")
    if tz:
        try:
            return naive.replace(tzinfo=ZoneInfo(tz)).astimezone(timezone.utc)
        except Exception:
            raise HTTPException(400, f"Unknown time zone: {tz}")
    if offset is None:
        raise HTTPException(400, "Provide a time zone or a UTC offset")
    return (naive - timedelta(hours=offset)).replace(tzinfo=timezone.utc)


@api_router.get("/")
async def root():
    return {"service": "KP Insight", "contract": CONTRACT_VERSION, "source": SOURCE}


@api_router.get("/cities")
async def cities(q: str = "", limit: int = Query(12, le=50)):
    return {"results": search_cities(q, limit)}


@api_router.post("/chart")
async def chart(req: ChartRequest):
    dt = _local_to_utc(req.date, req.time, req.tz, req.utc_offset)
    data = build_chart(dt, req.latitude, req.longitude)
    data["input"] = req.model_dump()
    return data


@api_router.get("/sky")
async def sky(utc: Optional[str] = None):
    if utc:
        try:
            dt = datetime.fromisoformat(utc.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(400, "utc must be ISO 8601")
        dt = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
    else:
        dt = datetime.now(timezone.utc)
    if not (1800 <= dt.year <= 2399):
        raise HTTPException(400, "Supported range is 1800–2399")
    return sky_positions(dt)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
