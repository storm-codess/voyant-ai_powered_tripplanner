import json
from app.services.model_gateway import gateway

async def generate_recommendations(
    trip_name: str,
    form_data: dict
) -> list:
    """
    Use model gateway to generate AI recommendations from form responses
    """
    prompt = f"""
You are a professional travel planner for Indian destinations.

Trip Name: {trip_name}
Group Size: {form_data.get('group_size', 1)} people
Form Title: {form_data.get('form_title', 'Trip Planning')}

Group Responses Summary:
{json.dumps(form_data.get('answers', {}), indent=2)}

Based on the group responses above, recommend the TOP 3 Indian destinations.

Respond ONLY with a JSON array of exactly 3 objects. No extra text. Format:
[
  {{
    "destination": "destination name",
    "reasoning": "2-3 sentences explaining why this suits the group based on their responses",
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

    raw = await gateway.complete(prompt=prompt, temperature=0.7, max_tokens=1500)
    recommendations = gateway.parse_json(raw)
    return recommendations