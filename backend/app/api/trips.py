from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.trip import Trip, TripMember
from app.models.user import User
from app.firebase import get_current_user
import uuid

router = APIRouter(prefix="/trips", tags=["trips"])

class TripCreate(BaseModel):
    name: str
    description: Optional[str] = None

@router.post("/create")
async def create_trip(
    trip_data: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # check user exists
    result = await db.execute(
        select(User).where(User.id == current_user["uid"])
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Register first")

    # create trip
    trip_id = str(uuid.uuid4())
    new_trip = Trip(
        id=trip_id,
        name=trip_data.name,
        description=trip_data.description,
        creator_id=current_user["uid"]
    )
    db.add(new_trip)

    # add creator as first member
    member = TripMember(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        user_id=current_user["uid"],
        is_admin=True
    )
    db.add(member)
    await db.commit()
    await db.refresh(new_trip)

    return {"message": "Trip created successfully", "trip_id": new_trip.id}

@router.get("/my-trips")
async def get_my_trips(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Trip).where(Trip.creator_id == current_user["uid"])
    )
    trips = result.scalars().all()
    return trips

@router.get("/{trip_id}")
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("/{trip_id}/invite")
async def invite_member(
    trip_id: str,
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # check trip exists
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # check if requester is admin
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a trip member")

    # find user by email
    user_result = await db.execute(
        select(User).where(User.email == email)
    )
    invited_user = user_result.scalar_one_or_none()
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found")

    # check already member
    existing = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == invited_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a member")

    # add member
    new_member = TripMember(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        user_id=invited_user.id,
        is_admin=False
    )
    db.add(new_member)
    await db.commit()

    return {"message": f"{email} added to trip successfully"}