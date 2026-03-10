from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.models.preference import Preference
from app.models.trip import Trip, TripMember
from app.firebase import get_current_user
import uuid

router = APIRouter(prefix="/preferences", tags=["preferences"])

class PreferenceCreate(BaseModel):
    budget_min: int
    budget_max: int
    travel_dates: Optional[List[str]] = None
    vibes: Optional[List[str]] = None
    visited_places: Optional[List[str]] = None
    avoided_places: Optional[List[str]] = None
    special_requirements: Optional[str] = None

@router.post("/{trip_id}/submit")
async def submit_preference(
    trip_id: str,
    preference_data: PreferenceCreate,
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

    # check user is member of trip
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a trip member")

    # check if preference already submitted
    existing = await db.execute(
        select(Preference).where(
            Preference.trip_id == trip_id,
            Preference.user_id == current_user["uid"]
        )
    )
    existing_pref = existing.scalar_one_or_none()

    if existing_pref:
        # update existing preference
        existing_pref.budget_min = preference_data.budget_min
        existing_pref.budget_max = preference_data.budget_max
        existing_pref.travel_dates = preference_data.travel_dates
        existing_pref.vibes = preference_data.vibes
        existing_pref.visited_places = preference_data.visited_places
        existing_pref.avoided_places = preference_data.avoided_places
        existing_pref.special_requirements = preference_data.special_requirements
        await db.commit()
        return {"message": "Preference updated successfully"}

    # create new preference
    new_preference = Preference(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        user_id=current_user["uid"],
        budget_min=preference_data.budget_min,
        budget_max=preference_data.budget_max,
        travel_dates=preference_data.travel_dates,
        vibes=preference_data.vibes,
        visited_places=preference_data.visited_places,
        avoided_places=preference_data.avoided_places,
        special_requirements=preference_data.special_requirements
    )
    db.add(new_preference)
    await db.commit()
    await db.refresh(new_preference)

    return {"message": "Preference submitted successfully"}

@router.get("/{trip_id}/all")
async def get_trip_preferences(
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

    # get all preferences for trip
    result = await db.execute(
        select(Preference).where(Preference.trip_id == trip_id)
    )
    preferences = result.scalars().all()

    return {
        "trip_id": trip_id,
        "total_submitted": len(preferences),
        "preferences": preferences
    }

@router.get("/{trip_id}/status")
async def get_preference_status(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # get total members
    members_result = await db.execute(
        select(TripMember).where(TripMember.trip_id == trip_id)
    )
    total_members = len(members_result.scalars().all())

    # get submitted preferences
    prefs_result = await db.execute(
        select(Preference).where(Preference.trip_id == trip_id)
    )
    submitted = len(prefs_result.scalars().all())

    # check if current user submitted
    my_pref = await db.execute(
        select(Preference).where(
            Preference.trip_id == trip_id,
            Preference.user_id == current_user["uid"]
        )
    )
    i_submitted = my_pref.scalar_one_or_none() is not None

    return {
        "total_members": total_members,
        "submitted": submitted,
        "pending": total_members - submitted,
        "i_submitted": i_submitted,
        "all_submitted": submitted == total_members
    }