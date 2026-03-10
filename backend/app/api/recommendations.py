from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.trip import Trip, TripMember
from app.models.preference import Preference
from app.models.recommendation import Recommendation
from app.firebase import get_current_user
from app.services.ai_service import (
    aggregate_preferences,
    get_relevant_destinations,
    generate_recommendations
)
import uuid

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/{trip_id}/generate")
async def generate_trip_recommendations(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # check trip exists
    trip_result = await db.execute(
        select(Trip).where(Trip.id == trip_id)
    )
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # check user is member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get all preferences
    prefs_result = await db.execute(
        select(Preference).where(Preference.trip_id == trip_id)
    )
    preferences = prefs_result.scalars().all()

    if not preferences:
        raise HTTPException(
            status_code=400,
            detail="No preferences submitted yet"
        )

    # get current version number
    version_result = await db.execute(
        select(func.max(Recommendation.version)).where(
            Recommendation.trip_id == trip_id
        )
    )
    current_version = version_result.scalar() or 0
    new_version = current_version + 1

    # aggregate preferences
    aggregated = aggregate_preferences(preferences)

    # get relevant destinations from mock data
    relevant_destinations = get_relevant_destinations(aggregated)

    # generate AI recommendations via gateway
    recommendations = await generate_recommendations(
        trip_name=trip.name,
        aggregated_preferences=aggregated,
        relevant_destinations=relevant_destinations
    )

    # save to database with version number
    saved = []
    for rec in recommendations:
        new_rec = Recommendation(
            id=str(uuid.uuid4()),
            trip_id=trip_id,
            destination=rec["destination"],
            reasoning=rec["reasoning"],
            estimated_budget=rec["estimated_budget"],
            activities=rec["best_activities"],
            version=new_version
        )
        db.add(new_rec)
        saved.append(rec)

    await db.commit()

    return {
        "message": f"Generation {new_version} complete",
        "version": new_version,
        "aggregated_preferences": aggregated,
        "recommendations": recommendations
    }

@router.get("/{trip_id}")
async def get_recommendations(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # check user is member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get all recommendations grouped by version
    result = await db.execute(
        select(Recommendation).where(
            Recommendation.trip_id == trip_id
        ).order_by(Recommendation.version, Recommendation.created_at)
    )
    recommendations = result.scalars().all()

    # group by version
    grouped = {}
    for rec in recommendations:
        version = rec.version
        if version not in grouped:
            grouped[version] = []
        grouped[version].append({
            "id": rec.id,
            "destination": rec.destination,
            "reasoning": rec.reasoning,
            "estimated_budget": rec.estimated_budget,
            "activities": rec.activities,
            "version": rec.version,
            "created_at": rec.created_at
        })

    return {
        "trip_id": trip_id,
        "total_recommendations": len(recommendations),
        "generations": len(grouped),
        "recommendations_by_version": grouped
    }

@router.get("/{trip_id}/{recommendation_id}")
async def get_single_recommendation(
    trip_id: str,
    recommendation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # check user is member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    result = await db.execute(
        select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.trip_id == trip_id
        )
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    return rec