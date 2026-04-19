import os
import joblib
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv

# --- 1. SECURE ENVIRONMENT CONFIGURATION ---
# This looks for the .env file in the same folder as this index.py script
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# --- 2. PATH CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

app = FastAPI(title="Agri-Insight AI Engine")

# --- 3. CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 4. LOAD ML MODELS ---
crop_model = None
yield_model = None
yield_encoders = None

try:
    crop_model = joblib.load(os.path.join(MODELS_DIR, "crop_model.pkl"))
    yield_model = joblib.load(os.path.join(MODELS_DIR, "yield_model.pkl"))
    yield_encoders = joblib.load(os.path.join(MODELS_DIR, "yield_encoders.pkl"))
    print("✅ ML Models loaded successfully.")
except Exception as e:
    print(f"⚠️ Model Load Warning: {e}")

# --- 5. GEMINI SECURE SETUP ---
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    print(f"❌ ERROR: GEMINI_API_KEY not found in .env file at {env_path}!")
else:
    print(f"✅ API Key successfully loaded from: {env_path}")

# Explicitly setting api_version to 'v1' for the Gemini 2.5 stable series
client = genai.Client(
    api_key=GEMINI_KEY,
    http_options={'api_version': 'v1'}
)

# --- 6. ENDPOINTS ---

@app.get("/")
async def root():
    return {"message": "Agri-Insight API is Live"}

@app.get("/recommend")
async def recommend(
    n: float, p: float, k: float, ph: float,
    temp: float = Query(25.8), 
    humid: float = Query(82.0), 
    rain: float = Query(205.0) 
):
    try:
        if crop_model is None:
            return {"status": "error", "message": "ML Model not initialized."}
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

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        img_content = await file.read()
        
        # Using Gemini 2.5 Flash for high-fidelity disease detection
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=[
                "Act as an Indian agronomist. Identify the plant disease from this image. "
                "Provide: 1. Disease Name, 2. Organic Treatment, 3. Chemical Treatment. "
                "Keep it professional and concise.",
                types.Part.from_bytes(data=img_content, mime_type="image/jpeg")
            ]
        )
        return {"status": "success", "analysis": response.text}
    except Exception as e:
        return {"status": "error", "message": f"Vision Error: {str(e)}"}

@app.get("/chat")
async def web_assistant(message: str):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                "You are the Agri-Insight Web Assistant, an expert in Indian agriculture. "
                "Keep answers concise and professional.",
                message
            ]
        )
        return {"status": "success", "reply": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001) 