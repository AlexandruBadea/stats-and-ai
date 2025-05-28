from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from weather_fetcher import fetch_weather_combined, fetch_past_weather, fetch_forecast, DATA_DIR
from ai_recommendation import get_ai_weather_advice
from datetime import datetime
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cities = {
    "bucuresti": (44.43, 26.10),
    "cluj": (46.77, 23.59),
    "iasi": (47.16, 27.58),
    "constanta": (44.18, 28.63),
    "timisoara": (45.75, 21.23)
}

@app.get("/weather")
def get_weather(city: str = Query(...)):
    city_lower = city.lower()
    if city_lower not in cities:
        return {"error": "Oraș necunoscut"}
    lat, lon = cities[city_lower]
    return fetch_weather_combined(city.capitalize(), lat, lon)

@app.get("/forecast")
def get_forecast(city: str = Query(...)):
    city_lower = city.lower()
    if city_lower not in cities:
        return {"error": "Oraș necunoscut"}
    lat, lon = cities[city_lower]
    return fetch_forecast(city.capitalize(), lat, lon)

@app.get("/weather/ai-advice")
def ai_weather_advice(city: str = Query(...)):
    city_lower = city.lower()
    if city_lower not in cities:
        return {"error": "Oraș necunoscut"}

    lat, lon = cities[city_lower]

    forecast_df = fetch_forecast(lat, lon)
    forecast_df["date"] = pd.to_datetime(forecast_df["date"]).dt.date
    today = datetime.today().date()

    today_row = forecast_df[forecast_df["date"] == today]
    if today_row.empty:
        return {"error": "Nu există date de prognoză pentru azi."}

    today_data = today_row.iloc[0].to_dict()

    advice = get_ai_weather_advice(city.capitalize(), today_data)

    return {
        "city": city.capitalize(),
        "date": today.isoformat(),
        "advice": advice
    }


