import requests
import pandas as pd
from datetime import datetime, timedelta
import os

DATA_DIR = "data"

def fetch_past_weather(lat: float, lon: float, start_date: str, end_date: str):
    url = "https://archive-api.open-meteo.com/v1/archive"

    # Asigură-te că end_date nu depășește ieri
    today = datetime.today().date()
    max_end_date = today - timedelta(days=1)
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
    if end_date_obj > max_end_date:
        end_date = max_end_date.isoformat()

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "temperature_2m_min,temperature_2m_max,precipitation_sum,relative_humidity_2m_min,relative_humidity_2m_max",
        "timezone": "Europe/Bucharest"
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return pd.DataFrame({
        "date": data["daily"]["time"],
        "temp_min": data["daily"]["temperature_2m_min"],
        "temp_max": data["daily"]["temperature_2m_max"],
        "precipitation": data["daily"]["precipitation_sum"],
        "humidity_min": data["daily"]["relative_humidity_2m_min"],
        "humidity_max": data["daily"]["relative_humidity_2m_max"]
    })

def fetch_forecast(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_min,temperature_2m_max,precipitation_sum,relative_humidity_2m_min,relative_humidity_2m_max",
        "forecast_days": 7,
        "timezone": "Europe/Bucharest"
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    return pd.DataFrame({
        "date": data["daily"]["time"],
        "temp_min": data["daily"]["temperature_2m_min"],
        "temp_max": data["daily"]["temperature_2m_max"],
        "precipitation": data["daily"]["precipitation_sum"],
        "humidity_min": data["daily"]["relative_humidity_2m_min"],
        "humidity_max": data["daily"]["relative_humidity_2m_max"]
    })

def fetch_weather_combined(city: str, lat: float, lon: float):
    os.makedirs(DATA_DIR, exist_ok=True)
    csv_path = os.path.join(DATA_DIR, f"{city.lower()}.csv")

    today = datetime.today().date()
    past_days = 30
    future_days = 7

    df_existing = pd.DataFrame()
    if os.path.exists(csv_path):
        df_existing = pd.read_csv(csv_path)
        df_existing["date"] = pd.to_datetime(df_existing["date"]).dt.date

    # 1. Completăm date lipsă din trecut
    past_start = today - timedelta(days=past_days)
    past_end = today - timedelta(days=1)

    if not df_existing.empty:
        last_existing_date = max(df_existing["date"])
        if last_existing_date >= today:
            past_end = last_existing_date
        existing_dates = set(df_existing["date"])
    else:
        existing_dates = set()

    df_past = fetch_past_weather(lat, lon, past_start.isoformat(), past_end.isoformat())
    df_past["date"] = pd.to_datetime(df_past["date"]).dt.date
    df_past = df_past[~df_past["date"].isin(existing_dates)]

    # 2a. Completăm prognoza lipsă (mâine → +7 zile)
    forecast_start = today + timedelta(days=1)
    future_dates = set([forecast_start + timedelta(days=i) for i in range(future_days)])

    df_forecast = fetch_forecast(lat, lon)
    df_forecast["date"] = pd.to_datetime(df_forecast["date"]).dt.date
    df_forecast = df_forecast[df_forecast["date"].isin(future_dates - existing_dates)]

    # 2b. Includem și ziua de azi dacă lipsește
    if today not in existing_dates:
        df_today = fetch_forecast(lat, lon)
        df_today["date"] = pd.to_datetime(df_today["date"]).dt.date
        df_today = df_today[df_today["date"] == today]
    else:
        df_today = pd.DataFrame()

    # 3. Combinăm totul
    df_final = pd.concat(
        [df_existing, df_past, df_today, df_forecast],
        ignore_index=True
    )
    df_final = df_final.drop_duplicates(subset=["date"])
    df_final = df_final.dropna(subset=[
        "temp_min", "temp_max",
        "precipitation",
        "humidity_min", "humidity_max"
    ])
    df_final = df_final.sort_values(by="date")
    df_final.to_csv(csv_path, index=False)

    return {
        "city": city,
        "data": df_final.to_dict(orient="records")
    }
