# Delhi-NCR Air Quality Backend

FastAPI backend for real-time air quality source breakdown analysis.

## Setup with Conda

### 1. Create Conda Environment
```bash
conda create -n air python=3.12
conda activate air
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Server

#### Option A: Using the startup script
```bash
cd backend
./start.sh
```

#### Option B: Manual commands
```bash
cd backend
conda activate air
python main.py
```

## API Endpoints


- **Source Breakdown**: `GET /api/source-breakdown`
- **API Documentation**: `http://localhost:8000/docs`

## Environment Variables

Create a `.env` file in the backend directory:
```
MAP_KEY=your_nasa_firms_api_key_here
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── services/
│   ├── fetch_cpcb.py      # CPCB air quality data fetcher
│   ├── fetch_firms.py     # NASA FIRMS fire hotspot fetcher
│   └── source_processor.py # Source breakdown calculator
├── requirements.txt       # Python dependencies
├── start.sh              # Startup script
└── README.md             # This file
```

## Development

The server runs with auto-reload enabled, so changes to the code will automatically restart the server.

## Testing

Test the API endpoint:
```bash
curl -X GET "http://localhost:8000/api/source-breakdown"
```
