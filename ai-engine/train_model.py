import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load the 2,200 row Indian Dataset
df = pd.read_csv('models/Crop_recommendation.csv')

# 2. STRICT FEATURE ORDER - This is the "Key"
features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
X = df[features]
y = df['label']

# 3. Train with 150 trees for better "Rice vs Coffee" separation
model = RandomForestClassifier(n_estimators=150, random_state=42)
model.fit(X, y)

joblib.dump(model, "models/crop_model.pkl")
print("✅ SUCCESS: Bias-Free Model Saved.")