# Backend API Documentation

## Source Breakdown Endpoint

### GET /api/source-breakdown

Fetches real-time source breakdown for Delhi Central by combining CPCB air quality data and NASA FIRMS fire hotspot data.

#### Response Format

```json
{
  "timestamp": null,
  "zone": "Delhi Central", 
  "sources": {
    "stubble": 18.0,
    "traffic": 40.0,
    "industrial": 20.0,
    "other": 22.0
  },
  "previous": {
    "stubble": 0,
    "traffic": 0,
    "industrial": 0,
    "other": 0
  }
}
```

#### Field Descriptions

- `timestamp`: ISO timestamp of data collection (currently null for mock data)
- `zone`: Geographic zone (currently "Delhi Central")
- `sources`: Current source breakdown percentages
  - `stubble`: Stubble burning contribution (0-50%, based on fire count)
  - `traffic`: Vehicle traffic contribution (30-40%, based on NO2 levels)
  - `industrial`: Industrial emissions (fixed at 20%)
  - `other`: Other sources (residual, normalized to 100%)
- `previous`: Previous day's breakdown for comparison (currently mock zeros)

#### Calculation Logic

1. **Stubble**: `min(50, 0.4 * fire_count)` where fire_count is from NASA FIRMS
2. **Traffic**: `30 + (10 if NO2 > 50 else 0)` based on CPCB NO2 levels
3. **Industrial**: Fixed at 20%
4. **Other**: `100 - (stubble + traffic + industrial)`, normalized

#### Example Usage

```bash
curl -X GET "http://localhost:8000/api/source-breakdown"
```

#### Development Notes

- Currently uses mock data for testing
- CPCB integration requires actual XML endpoint
- NASA FIRMS requires MAP_KEY in .env file
- All percentages sum to 100%
- Previous day comparison needs caching implementation

#### Frontend Integration

The frontend can replace the hardcoded JSON in `src/data/airQualityData.ts` with API calls to this endpoint. The response format matches the existing `SourceBreakdown` type structure.
