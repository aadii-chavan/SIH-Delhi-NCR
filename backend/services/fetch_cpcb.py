import aiohttp
import json

# Mock CPCB data for testing - replace with actual XML parsing when real endpoint is available
async def fetch_cpcb_data():
    """
    Fetch AQI and pollutant data for Delhi Central from CPCB.
    Returns: dict with pm25, pm10, no2, so2 (float values)
    """
    # For now, return mock data that simulates typical Delhi pollution levels
    # In production, this would parse actual CPCB XML data
    return {
        "pm25": 120.5,  # Typical Delhi PM2.5 level
        "pm10": 180.2,  # Typical Delhi PM10 level  
        "no2": 65.8,    # High NO2 indicating traffic/industrial
        "so2": 25.3,    # Moderate SO2
    }
