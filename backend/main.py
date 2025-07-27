from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

app = FastAPI()

# Configure CORS to allow requests from your frontend (React app)
# In development, we allow all origins for simplicity.
# In production, you would restrict this to your frontend's domain.
origins = [
    "http://localhost",
    "http://localhost:3000", # Default React app port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data on startup
esg_data = pd.DataFrame() # Initialize as empty DataFrame
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), 'esg_data.csv')

@app.on_event("startup")
async def load_data():
    global esg_data
    try:
        esg_data = pd.read_csv(CSV_FILE_PATH)
        print("ESG data loaded successfully!")
    except FileNotFoundError:
        print(f"Error: {CSV_FILE_PATH} not found. Make sure esg_data.csv is in the backend directory.")
        # Optionally, create a dummy DataFrame if file not found to prevent crashes
        esg_data = pd.DataFrame(columns=["Year", "Division", "CarbonEmissions_Tons", "WaterUsage_KL", "EmployeeDiversity_Percentage"])
    except Exception as e:
        print(f"An error occurred while loading ESG data: {e}")
        esg_data = pd.DataFrame(columns=["Year", "Division", "CarbonEmissions_Tons", "WaterUsage_KL", "EmployeeDiversity_Percentage"])


@app.get("/")
async def read_root():
    return {"message": "Welcome to Tata Quick Insights ESG API!"}

@app.get("/api/esg-data")
async def get_esg_data():
    # Convert DataFrame to a list of dictionaries (JSON friendly)
    return esg_data.to_dict(orient="records")

@app.get("/api/esg-data/{division_name}")
async def get_esg_data_by_division(division_name: str):
    filtered_data = esg_data[esg_data['Division'].str.lower() == division_name.lower()]
    if filtered_data.empty:
        return {"message": f"No data found for division: {division_name}"}
    return filtered_data.to_dict(orient="records")

# To run this API:
# 1. Make sure your Python virtual environment is activated.
# 2. Run: uvicorn main:app --reload
# This will run the API on http://127.0.0.1:8000