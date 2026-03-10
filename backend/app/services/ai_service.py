import json
from app.services.model_gateway import gateway

# load mock destination data
with open("voyant_mock_data.json", "r") as f:
    MOCK_DATA = json.load(f)

def aggregate_preferences(preferences: list) -> dict:
    """
    Aggregate preferences from all group members into one summary
    """
    if not preferences:
        return {}

    # average budget across group
    budget_mins = [p.budget_min for p in preferences]
    budget_maxs = [p.budget_max for p in preferences]
    avg_budget_min = sum(budget_mins) // len(budget_mins)
    avg_budget_max = sum(budget_maxs) // len(budget_maxs)

    # find most popular vibes
    all_vibes = []
    for p in preferences:
        if p.vibes:
            all_vibes.extend(p.vibes)
    vibe_counts = {}
    for vibe in all_vibes:
        vibe_counts[vibe] = vibe_counts.get(vibe, 0) + 1
    top_vibes = sorted(vibe_counts, key=vibe_counts.get, reverse=True)[:3]

    # collect visited and avoided places
    all_visited = []
    all_avoided = []
    for p in preferences:
        if p.visited_places:
            all_visited.extend(p.visited_places)
        if p.avoided_places:
            all_avoided.extend(p.avoided_places)

    # collect travel dates
    all_dates = []
    for p in preferences:
        if p.travel_dates:
            all_dates.extend(p.travel_dates)

    return {
        "budget_min": avg_budget_min,
        "budget_max": avg_budget_max,
        "top_vibes": top_vibes,
        "visited_places": list(set(all_visited)),
        "avoided_places": list(set(all_avoided)),
        "travel_dates": list(set(all_dates)),
        "group_size": len(preferences)
    }

def get_relevant_destinations(aggregated: dict) -> list:
    """
    Filter mock destinations based on group preferences
    """
    budget_max = aggregated.get("budget_max", 10000)
    top_vibes = aggregated.get("top_vibes", [])
    visited = aggregated.get("visited_places", [])
    avoided = aggregated.get("avoided_places", [])

    relevant = []
    for dest in MOCK_DATA["destinations"]:
        # skip visited places
        if dest["name"].lower() in [v.lower() for v in visited]:
            continue
        # skip avoided places
        if dest["name"].lower() in [a.lower() for a in avoided]:
            continue
        # check vibe match
        vibe_match = any(v in dest["vibe"] for v in top_vibes)
        # check budget match
        budget_match = dest["pricing"]["hotels"]["budget"]["max"] <= budget_max
        if vibe_match or budget_match:
            relevant.append(dest)

    return relevant[:8] if relevant else MOCK_DATA["destinations"][:8]

async def generate_recommendations(
    trip_name: str,
    aggregated_preferences: dict,
    relevant_destinations: list
) -> list:
    """
    Use model gateway to generate AI recommendations
    """
    prompt = f"""
You are a professional travel planner for Indian destinations.

Trip Name: {trip_name}
Group Size: {aggregated_preferences.get('group_size', 1)} people
Budget Range: ₹{aggregated_preferences.get('budget_min', 0)} - ₹{aggregated_preferences.get('budget_max', 10000)} per person per night
Preferred Vibes: {', '.join(aggregated_preferences.get('top_vibes', []))}
Already Visited: {', '.join(aggregated_preferences.get('visited_places', [])) or 'None'}
Places to Avoid: {', '.join(aggregated_preferences.get('avoided_places', [])) or 'None'}
Travel Dates: {', '.join(aggregated_preferences.get('travel_dates', [])) or 'Flexible'}

Available Destinations with pricing:
{json.dumps(relevant_destinations, indent=2)}

Based on the group preferences above, recommend the TOP 3 destinations from the available list.

Respond ONLY with a JSON array of exactly 3 objects. No extra text. Format:
[
  {{
    "destination": "destination name",
    "reasoning": "2-3 sentences explaining why this suits the group",
    "best_activities": ["activity1", "activity2", "activity3"],
    "estimated_budget": {{
      "hotel_per_night": "₹X - ₹Y",
      "transport_from_major_city": "₹X - ₹Y"
    }},
    "best_time_to_visit": "month range",
    "match_score": 85
  }}
]
"""

    # gateway handles model selection and fallbacks
    raw = await gateway.complete(prompt=prompt, temperature=0.7, max_tokens=1500)
    recommendations = gateway.parse_json(raw)
    return recommendations