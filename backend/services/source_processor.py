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

    # Compute residual 'other' and clamp at 0 to avoid negatives
    other_raw = 100 - (stubble + traffic + industrial)
    other = max(0.0, other_raw)

    # If we had to clamp 'other', renormalize stubble/traffic/industrial proportionally
    total = stubble + traffic + industrial + other
    if total != 100:
        # Only scale down if total > 100 due to clamping other to 0
        if total > 100 and (stubble + traffic + industrial) > 0:
            scale = 100 / (stubble + traffic + industrial)
            stubble *= scale
            traffic *= scale
            industrial *= scale
            other = 100 - (stubble + traffic + industrial)
        else:
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
