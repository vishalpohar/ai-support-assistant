# Load environment variables
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client()

model = "gemini-2.5-flash"