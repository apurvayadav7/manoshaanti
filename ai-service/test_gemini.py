import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing with API Key: {api_key[:10]}...")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash-8b")

try:
    response = model.generate_content("Hello! Can you hear me?")
    print("SUCCESS: Gemini responded!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"FAILED: {str(e)}")
