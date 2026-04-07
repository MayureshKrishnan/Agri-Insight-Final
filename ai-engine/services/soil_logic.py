def get_crop_recommendation(n, p, k, ph):
    """Matches soil nutrients to the best crop."""
    if n > 70 and p > 40 and k > 30:
        return "Rice"
    elif n > 50 and p > 50 and k < 50:
        return "Banana"
    elif n < 40 and ph > 6.0:
        return "Wheat"
    elif 40 <= n <= 60 and p < 40:
        return "Maize"
    else:
        return "Potato"

def get_crop_requirements(crop_name):
    """Metadata for the crop cards."""
    data = {
        "Rice": {"success": "92%", "water": "High", "temp": "25-35°C"},
        "Banana": {"success": "88%", "water": "High", "temp": "20-30°C"},
        "Wheat": {"success": "94%", "water": "Low", "temp": "15-25°C"},
        "Maize": {"success": "85%", "water": "Medium", "temp": "18-27°C"},
        "Potato": {"success": "89%", "water": "Medium", "temp": "12-20°C"}
    }
    return data.get(crop_name, {"success": "80%", "water": "Medium", "temp": "22°C"})