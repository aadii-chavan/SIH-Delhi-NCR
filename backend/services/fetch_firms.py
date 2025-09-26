import aiohttp
import os
from dotenv import load_dotenv

load_dotenv()

# Mock FIRMS data for testing - replace with actual API call when MAP_KEY is available
async def fetch_firms_fire_count():
    """
    Fetch NASA FIRMS fire hotspot count for Punjab/Haryana with confidence >70%.
    Returns: int (fire count)
    """
    # For now, return mock data simulating low stubble season fires
    # In production, this would call the actual NASA FIRMS API
    return 45  # Simulating ~50 hotspots in Punjab/Haryana during low stubble season
