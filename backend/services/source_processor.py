from typing import Dict

def compute_source_breakdown(pollutants: Dict[str, float], fire_count: int) -> Dict[str, float]:
    """
    Rule-based breakdown:
    - stubble = min(50, 0.4 * fire_count)
    - traffic = 30 + (10 if pollutants.get('no2', 0) > 50 else 0)
    - industrial = 20
    - other = 100 - sum(others)
    Returns: dict with stubble, traffic, industrial, other (all float, sum to 100)
    """
    stubble = min(50, 0.4 * fire_count)
    traffic = 30 + (10 if pollutants.get('no2', 0) > 50 else 0)
    industrial = 20
    other = 100 - (stubble + traffic + industrial)
    # Normalize if needed
    total = stubble + traffic + industrial + other
    if total != 100:
        scale = 100 / total
        stubble *= scale
        traffic *= scale
        industrial *= scale
        other *= scale
    return {
        "stubble": round(stubble, 2),
        "traffic": round(traffic, 2),
        "industrial": round(industrial, 2),
        "other": round(other, 2),
    }
