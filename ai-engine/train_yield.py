import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

MODELS_DIR = "models"
DATA_PATH = os.path.join(MODELS_DIR, "India Agriculture Crop Production.csv")

print("📊 Processing Yield Data...")
df = pd.read_csv(DATA_PATH).dropna()

# Standardize casing to prevent "Unseen Label" errors
df['State'] = df['State'].str.strip().str.title()
df['District'] = df['District'].str.strip().str.upper()
df['Crop'] = df['Crop'].str.strip().str.title()
df['Season'] = df['Season'].str.strip().str.title()

encoders = {}
for col in ['State', 'District', 'Crop', 'Season']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

X = df[['State', 'District', 'Crop', 'Season', 'Area']]
y = df['Yield']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🧠 Training Deep Yield Regressor...")
regressor = RandomForestRegressor(n_estimators=150, n_jobs=-1, random_state=42)
regressor.fit(X_train, y_train)

joblib.dump(regressor, os.path.join(MODELS_DIR, "yield_model.pkl"))
joblib.dump(encoders, os.path.join(MODELS_DIR, "yield_encoders.pkl"))
print(f"✅ SUCCESS: Yield Model Saved. R2 Score: {regressor.score(X_test, y_test):.4f}")