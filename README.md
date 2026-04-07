# Agri-Insight AI 🌾
A precision agriculture dashboard for Indian farmers, featuring Crop Recommendation, Yield Prediction, and AI Disease Detection.

## 🚀 Features
- **Crop Recommendation:** Multi-class classification using Random Forest (99% Accuracy).
- **Yield Prediction:** Deep Forest Regressor trained on Indian production data.
- **Disease Analysis:** Gemini-1.5-Flash Vision API for real-time plant pathology.
- **Web Assistant:** Integrated LLM chatbot for agricultural queries.

## 🛠️ Tech Stack
- **Backend:** FastAPI (Python), Scikit-Learn, Joblib
- **AI/Vision:** Google Gemini API
- **Deployment:** Vercel (Serverless Functions)

## 📡 API Endpoints
- `GET /recommend`: Returns top 3 crops based on NPK, pH, and Climate.
- `GET /predict_yield`: Predicts crop yield (Tonnes/Hectare) based on district/state.
- `POST /analyze`: Image-to-text disease diagnosis.
- `GET /chat`: Interactive agricultural web-assistant.

## 📂 Project Structure
- `/api`: FastAPI backend for Vercel.
- `/models`: Pre-trained PKL files and encoders.
- `/notebooks`: Data analysis and training scripts.