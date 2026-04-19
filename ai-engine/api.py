import os
import joblib
import uvicorn
import numpy as np
import pandas as pd  
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

# --- 1. SETTINGS & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

app = FastAPI(title="Agri-Insight Master AI")

@app.get("/")
async def root():
    return {"status": "online", "message": "Agri-Insight API is running on Port 8001"}

# CORS CONFIGURATION: Optimized for Local and Production
app.add_middleware(
    CORSMiddleware, 
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "https://agri-insight-final.vercel.app"
    ], 
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- 2. LOAD MODELS ---
try:
    crop_model = joblib.load(os.path.join(MODELS_DIR, "crop_model.pkl"))
    yield_model = joblib.load(os.path.join(MODELS_DIR, "yield_model.pkl"))
    yield_encoders = joblib.load(os.path.join(MODELS_DIR, "yield_encoders.pkl"))
    print("✅ All Engines Online: Local Models Loaded Successfully.")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load models. Ensure .pkl files are in /models folder. {e}")

# --- GEMINI CLIENT ---
# Uses 'gemini-1.5-flash-latest' to resolve v1beta 404 versioning errors
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDkijjKakSz8in8mBUBWTfY1d-vbNM6Mok")
client = genai.Client(api_key=GEMINI_KEY)

# --- 3. ENDPOINT: CROP RECOMMENDATION (With Inference Guard) ---
@app.get("/recommend")
async def recommend(
    n: float, p: float, k: float, ph: float,
    temp: float = Query(30.0),   # Synced with Mumbai/Kharghar averages
    humid: float = Query(85.0),  # Synced with Coastal Humidity
    rain: float = Query(180.0)   # Synced with Seasonal Rainfall
):
    try:
        # --- DATA INTEGRITY CHECK (INFERENCE GUARD) ---
        # This adds a validation layer before the ML model processes the data.
        warnings = []
        if k > 120:
            warnings.append("High Potassium (K) outlier detected. Potential data distribution mismatch.")
        if ph < 4.5 or ph > 8.5:
            warnings.append("pH level is outside standard arable ranges (4.5 - 8.5).")
        if n > 140:
            warnings.append("High Nitrogen detected. Resulting predictions may be skewed.")

        # FIXED: Explicit feature mapping using Pandas DataFrame
        feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        input_df = pd.DataFrame([[n, p, k, temp, humid, ph, rain]], columns=feature_names)
        
        print(f"DEBUG: Processing Inference -> N:{n}, P:{p}, K:{k}, pH:{ph} | Temp:{temp}")
        if warnings:
            print(f"⚠️ GUARD WARNINGS: {warnings}")

        # Execute Prediction
        probs = crop_model.predict_proba(input_df)[0]
        classes = crop_model.classes_
        
        # Sort by confidence descending
        results = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
        
        return {
            "status": "success",
            "integrity_notes": warnings if warnings else "Data within valid distribution",
            "recommendations": [
                {"name": str(c).capitalize(), "confidence": f"{round(pr*100, 1)}%"} 
                for c, pr in results[:3]
            ]
        }
    except Exception as e:
        print(f"ERROR: {e}")
        return {"status": "error", "message": f"Inference Error: {str(e)}"}

# --- 4. ENDPOINT: YIELD PREDICTION ---
@app.get("/predict_yield")
async def predict_yield(state: str, district: str, crop: str, season: str, area: float):
    try:
        s, d, c, se = state.strip().title(), district.strip().upper(), crop.strip().title(), season.strip().title()
        
        s_idx = yield_encoders['State'].transform([s])[0]
        d_idx = yield_encoders['District'].transform([d])[0]
        c_idx = yield_encoders['Crop'].transform([c])[0]
        se_idx = yield_encoders['Season'].transform([se])[0]
        
        # Applying model prediction
        prediction = yield_model.predict([[s_idx, d_idx, c_idx, se_idx, area]])
        
        return {
            "status": "success",
            "yield": round(float(prediction[0]), 3),
            "unit": "Tonnes/Hectare",
            "location": f"{d}, {s}"
        }
    except Exception as e:
        return {"status": "error", "message": f"Label Mismatch: {str(e)}"}

# --- 5. ENDPOINT: DISEASE SCANNER ---
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        img_content = await file.read()
        
        # Gemini Vision Inference
        response = client.models.generate_content(
            model="gemini-1.5-flash-latest",
            contents=[
                "Act as an Indian agronomist. Identify the plant disease from this image. "
                "Output: 1. Disease Name, 2. Symptoms, 3. Organic Cure, 4. Chemical Cure. "
                "Keep response clear and professional for a report.",
                types.Part.from_bytes(data=img_content, mime_type="image/jpeg")
            ]
        )
        return {"status": "success", "analysis": response.text}
    except Exception as e:
        return {"status": "error", "message": f"Vision Error: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)