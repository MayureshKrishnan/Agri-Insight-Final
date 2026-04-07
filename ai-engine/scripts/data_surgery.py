import os
import shutil

# ==========================================
# 🛑 PATH CONFIGURATION
# ==========================================
# This script assumes it is inside ai-engine/scripts/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pointing exactly to the 'color' folder where the images live
EXTRACT_DIR = os.path.join(BASE_DIR, "data", "raw", "plantvillage dataset", "color")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

# The exact folder names found in the PlantVillage 'color' directory
TARGET_CLASSES = [
    'Tomato___healthy', 
    'Tomato___Late_blight', 
    'Potato___healthy', 
    'Potato___Early_blight', 
    'Pepper,_bell___healthy', 
    'Pepper,_bell___Bacterial_spot',
    'Corn_(maize)___healthy', 
    'Corn_(maize)___Common_rust_', 
    'Rice___Healthy', 
    'Rice___Leaf_blast'
]

def run_surgery():
    # Verify the source exists
    if not os.path.exists(EXTRACT_DIR):
        print(f"❌ ERROR: Source directory not found: {EXTRACT_DIR}")
        print("Please ensure your zip was extracted correctly to 'data/raw'.")
        return

    # Create processed directory
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    print(f"✂️ Starting surgery: Extracting {len(TARGET_CLASSES)} specific classes...")
    
    found_count = 0
    for category in TARGET_CLASSES:
        src_path = os.path.join(EXTRACT_DIR, category)
        dest_path = os.path.join(PROCESSED_DIR, category)
        
        if os.path.exists(src_path):
            os.makedirs(dest_path, exist_ok=True)
            
            # Filter only image files
            images = [f for f in os.listdir(src_path) 
                     if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            
            # Take only 800 images to stay within your 4GB RTX 3050 VRAM limits
            subset = images[:800]
            
            for img in subset:
                shutil.copy2(os.path.join(src_path, img), os.path.join(dest_path, img))
            
            print(f"   ✅ Done: {category} ({len(subset)} images copied)")
            found_count += 1
        else:
            # Check for slight naming variations if exact match fails
            print(f"   ⚠️ Warning: Folder '{category}' not found at {src_path}")

    print("-" * 30)
    print(f"🎉 Surgery Complete! {found_count}/{len(TARGET_CLASSES)} classes ready.")
    print(f"📍 Training Data is now at: {PROCESSED_DIR}")
    print("-" * 30)

if __name__ == "__main__":
    run_surgery()