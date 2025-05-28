import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3"

def get_ai_weather_advice(city: str, today_data: dict) -> str:
    prompt = f"""
Am prognoza meteo pentru orașul {city}, pentru ziua de azi.
Datele sunt:
- temperatură minimă: {today_data.get("temp_min")}°C
- temperatură maximă: {today_data.get("temp_max")}°C
- precipitații: {today_data.get("precipitation")} mm
- umiditate minimă: {today_data.get("humidity_min")}% 
- umiditate maximă: {today_data.get("humidity_max")}% 

Pe baza acestor date:
- Scrie o simplă propozitie scurtă (doar text, fără liste, fără markup și fără linii noi), oferă 2-3 recomandări practice: cum să te îmbraci, ce activități să alegi, ce să eviți.
- Scrie în limba română.

Răspuns:
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json().get("response", "Nu s-a primit un răspuns valid de la model.")
    except Exception as e:
        return f"Eroare la generarea recomandării: {str(e)}"
