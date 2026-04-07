from google import genai
from google.genai import types

# Initialize the new Client
client = genai.Client(api_key="AIzaSyDkijjKakSz8in8mBUBWTfY1d-vbNM6Mok")

SYSTEM_INSTRUCTION = """
You are a Research Agronomist for Agri-Insight AI. 
When a crop disease is detected, your job is to:
1. Explain the scientific cause of the disease.
2. Provide 3 organic or sustainable solutions for the farmer.
3. Reference IEEE GRSS remote sensing standards if applicable.
Keep the tone professional yet accessible for farmers.
"""

def get_expert_advice(disease, location, weather):
    """
    Sends detected disease and context to Gemini using the new stable SDK.
    """
    try:
        prompt = f"{SYSTEM_INSTRUCTION}\n\nThe system detected '{disease}' at coordinates {location}. Local weather: {weather}. Provide research-backed guidance."
        
        # New SDK syntax for generation
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Agronomist AI is currently offline. Error: {str(e)}"