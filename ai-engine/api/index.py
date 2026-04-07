import os
import joblib
import uvicorn
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

# --- 1. VERCEL PATH CONFIGURATION ---
# Vercel runs from the 'api' folder, so we need to go up one level to find 'models'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

app = FastAPI(title="Agri-Insight Vercel Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. LOAD MODELS ---
try:
    crop_model = joblib.load(os.path.join(MODELS_DIR, "crop_model.pkl"))
    yield_model = joblib.load(os.path.join(MODELS_DIR, "yield_model.pkl"))
    yield_encoders = joblib.load(os.path.join(MODELS_DIR, "yield_encoders.pkl"))
    print("✅ Models loaded successfully in Vercel environment.")
except Exception as e:
    print(f"❌ Model Load Error: {e}")

# Gemini Vision Setup
GEMINI_KEY = "AIzaSyDkijjKakSz8in8mBUBWTfY1d-vbNM6Mok" 
client = genai.Client(api_key=GEMINI_KEY)

# --- 3. ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "Agri-Insight API is Live on Vercel"}

@app.get("/recommend")
async def recommend(
    n: float, p: float, k: float, ph: float,
    temp: float = Query(28.0), 
    humid: float = Query(85.0), 
    rain: float = Query(220.0) # Bias Fix: Defaults to Monsoon for Rice/Wheat
):
    try:
        # Features: N, P, K, temperature, humidity, ph, rainfall
        features = [[n, p, k, temp, humid, ph, rain]]
        probs = crop_model.predict_proba(features)[0]
        results = sorted(zip(crop_model.classes_, probs), key=lambda x: x[1], reverse=True)
        
        return {
            "status": "success",
            "recommendations": [
                {"name": str(c).capitalize(), "confidence": f"{round(pr*100, 1)}%"} 
                for c, pr in results[:3]
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/predict_yield")
async def predict_yield(state: str, district: str, crop: str, season: str, area: float):
    try:
        s, d, c, se = state.strip().title(), district.strip().upper(), crop.strip().title(), season.strip().title()
        
        # Encoding using the loaded encoders
        s_idx = yield_encoders['State'].transform([s])[0]
        d_idx = yield_encoders['District'].transform([d])[0]
        c_idx = yield_encoders['Crop'].transform([c])[0]
        se_idx = yield_encoders['Season'].transform([se])[0]
        
        prediction = yield_model.predict([[s_idx, d_idx, c_idx, se_idx, area]])
        return {"status": "success", "yield": round(float(prediction[0]), 3)}
    except Exception as e:
        return {"status": "error", "message": f"Mapping error: {str(e)}"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        img_content = await file.read()
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                "Act as an Indian agronomist. Identify the plant disease. "
                "Provide: 1. Disease Name, 2. Organic Treatment, 3. Chemical Treatment.",
                types.Part.from_bytes(data=img_content, mime_type="image/jpeg")
            ]
        )
        return {"status": "success", "analysis": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    # Add this endpoint to your existing api/index.py

@app.get("/chat")
async def web_assistant(message: str):
    try:
        # We use the text-only model for the assistant
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                "You are the Agri-Insight Web Assistant, an expert in Indian agriculture. "
                "Help farmers with crop choices, soil health, and weather advice. "
                "Keep answers concise and professional.",
                message
            ]
        )
        return {"status": "success", "reply": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# For local testing only; Vercel ignores this __main__ block
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)