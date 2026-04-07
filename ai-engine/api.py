import os
import joblib
import uvicorn
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

# --- 1. SETTINGS & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

app = FastAPI(title="Agri-Insight Master AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- 2. LOAD MODELS ---
try:
    crop_model = joblib.load(os.path.join(MODELS_DIR, "crop_model.pkl"))
    yield_model = joblib.load(os.path.join(MODELS_DIR, "yield_model.pkl"))
    yield_encoders = joblib.load(os.path.join(MODELS_DIR, "yield_encoders.pkl"))
    print("✅ All Engines Online: Local Models Loaded Successfully.")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load models. Did you run the trainers? {e}")

# Gemini Vision Config
client = genai.Client(api_key="AIzaSyDkijjKakSz8in8mBUBWTfY1d-vbNM6Mok")

# --- 3. ENDPOINT: CROP RECOMMENDATION (The Sync Fix) ---
@app.get("/recommend")
async def recommend(
    n: float, p: float, k: float, ph: float,
    temp: float = Query(25.0), 
    humid: float = Query(80.0), 
    rain: float = Query(200.0)
):
    try:
        # DATA SENSE-CHECK: 
        # If Potassium (k) > 100, the model thinks it's Grapes/Apple.
        # If Rain < 150, the model thinks it's Coffee/Maize.
        
        # STRICT FEATURE ORDER: [N, P, K, temp, humid, ph, rain]
        input_data = [[n, p, k, temp, humid, ph, rain]]
        
        probs = crop_model.predict_proba(input_data)[0]
        classes = crop_model.classes_
        
        # Sort DESCENDING (Highest probability first)
        results = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
        
        return {
            "status": "success",
            "recommendations": [
                {"name": str(c).capitalize(), "confidence": f"{round(pr*100, 1)}%"} 
                for c, pr in results[:3]
            ]
        }
    except Exception as e:
        return {"status": "error", "message": f"Logic Error: {str(e)}"}

# --- 4. ENDPOINT: YIELD PREDICTION (The Location Fix) ---
@app.get("/predict_yield")
async def predict_yield(state: str, district: str, crop: str, season: str, area: float):
    try:
        # Standardize strings to match 'India Agriculture Crop Production.csv'
        s, d, c, se = state.strip().title(), district.strip().upper(), crop.strip().title(), season.strip().title()
        
        # Encode inputs
        s_idx = yield_encoders['State'].transform([s])[0]
        d_idx = yield_encoders['District'].transform([d])[0]
        c_idx = yield_encoders['Crop'].transform([c])[0]
        se_idx = yield_encoders['Season'].transform([se])[0]
        
        # Predict using Deep Forest
        prediction = yield_model.predict([[s_idx, d_idx, c_idx, se_idx, area]])
        
        return {
            "status": "success",
            "yield": round(float(prediction[0]), 3),
            "unit": "Tonnes/Hectare",
            "location": f"{d}, {s}"
        }
    except Exception as e:
        return {"status": "error", "message": f"Label Mismatch: {str(e)}. Tip: Use 'MUMBAI' and 'Maharashtra'."}

# --- 5. ENDPOINT: DISEASE SCANNER ---
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        img_content = await file.read()
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                "Act as an Indian agronomist. Identify the plant disease. "
                "Output: 1. Disease Name, 2. Symptoms, 3. Organic Cure, 4. Chemical Cure.",
                types.Part.from_bytes(data=img_content, mime_type="image/jpeg")
            ]
        )
        return {"status": "success", "analysis": response.text}
    except Exception as e:
        return {"status": "error", "message": f"Vision Error: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)