from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.database import get_db
from app.models.vote import Vote, VoteSession, VoteOption
from app.models.trip import Trip, TripMember
from app.firebase import get_current_user
from app.services.voting_service import (
    count_votes,
    determine_winner,
    pick_random_winner,
    is_deadline_passed
)
import uuid

router = APIRouter(prefix="/votes", tags=["votes"])

# ─── Pydantic Schemas ────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    title: str
    description: Optional[str] = None
    options: list[str]          # list of option texts
    deadline_hours: float

class CastVoteRequest(BaseModel):
    option_id: str

class RevoteRequest(BaseModel):
    deadline_hours: float

# ─── Routes ──────────────────────────────────────────────────────

@router.post("/{trip_id}/create-session")
async def create_vote_session(
    trip_id: str,
    request: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Creator creates a vote session with custom options"""

    # only creator can create sessions
    trip_result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only trip creator can create vote sessions")

    if len(request.options) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 options to vote on")

    # create session
    deadline = datetime.now(timezone.utc) + timedelta(hours=request.deadline_hours)
    session = VoteSession(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        title=request.title,
        description=request.description,
        status="open",
        deadline=deadline,
        created_by=current_user["uid"]
    )
    db.add(session)
    await db.flush()

    # create options
    created_options = []
    for option_text in request.options:
        option = VoteOption(
            id=str(uuid.uuid4()),
            session_id=session.id,
            option_text=option_text
        )
        db.add(option)
        created_options.append({"id": option.id, "text": option_text})

    await db.commit()

    return {
        "message": "Vote session created",
        "session_id": session.id,
        "title": request.title,
        "options": created_options,
        "deadline": deadline,
        "deadline_hours": request.deadline_hours
    }

@router.post("/{trip_id}/cast")
async def cast_vote(
    trip_id: str,
    request: CastVoteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Member casts or updates their vote"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get option and its session
    option_result = await db.execute(
        select(VoteOption).where(VoteOption.id == request.option_id)
    )
    option = option_result.scalar_one_or_none()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    # get session
    session_result = await db.execute(
        select(VoteSession).where(VoteSession.id == option.session_id)
    )
    session = session_result.scalar_one_or_none()

    if session.status == "closed":
        raise HTTPException(status_code=400, detail="Voting is closed")

    if is_deadline_passed(session.deadline):
        raise HTTPException(status_code=400, detail="Voting deadline has passed")

    # check if already voted in this session
    existing_vote = await db.execute(
        select(Vote).where(
            Vote.session_id == session.id,
            Vote.user_id == current_user["uid"]
        )
    )
    existing = existing_vote.scalar_one_or_none()

    if existing:
        # update existing vote
        existing.option_id = request.option_id
        existing.updated_at = datetime.now(timezone.utc)
        await db.commit()
        return {"message": "Vote updated successfully"}

    # cast new vote
    new_vote = Vote(
        id=str(uuid.uuid4()),
        session_id=session.id,
        user_id=current_user["uid"],
        option_id=request.option_id
    )
    db.add(new_vote)
    await db.commit()

    return {"message": "Vote cast successfully"}

@router.post("/{trip_id}/close/{session_id}")
async def close_voting(
    trip_id: str,
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Creator closes voting and determines winner"""

    # only creator can close
    trip_result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only creator can close voting")

    # get session
    session_result = await db.execute(
        select(VoteSession).where(VoteSession.id == session_id)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="Session already closed")

    # count votes
    vote_counts = await count_votes(session_id, db)
    winner_id, is_tie, tied_ids = await determine_winner(vote_counts)

    if is_tie:
        if session.status == "revote":
            # still tied after revote — pick random
            winner_id = pick_random_winner(tied_ids)
            session.winner_option_id = winner_id
            session.status = "closed"
            session.is_random_winner = True
            await db.commit()
            return {
                "message": "Tie broken randomly",
                "winner_option_id": winner_id,
                "is_random": True,
                "vote_counts": vote_counts
            }
        else:
            # start revote
            session.status = "revote"
            await db.commit()
            return {
                "message": "Tie detected — revote started. Call close again after revote deadline.",
                "tied_options": tied_ids,
                "vote_counts": vote_counts
            }
    else:
        # clear winner
        session.winner_option_id = winner_id
        session.status = "closed"
        session.is_random_winner = False
        await db.commit()
        return {
            "message": "Voting closed — winner decided",
            "winner_option_id": winner_id,
            "is_random": False,
            "vote_counts": vote_counts
        }

@router.get("/{trip_id}/sessions")
async def get_vote_sessions(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all vote sessions for a trip"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    sessions_result = await db.execute(
        select(VoteSession).where(VoteSession.trip_id == trip_id)
    )
    sessions = sessions_result.scalars().all()

    result = []
    for session in sessions:
        # get options
        options_result = await db.execute(
            select(VoteOption).where(VoteOption.session_id == session.id)
        )
        options = options_result.scalars().all()

        # get vote counts
        vote_counts = await count_votes(session.id, db)

        # check if current user voted
        user_vote = await db.execute(
            select(Vote).where(
                Vote.session_id == session.id,
                Vote.user_id == current_user["uid"]
            )
        )
        user_voted = user_vote.scalar_one_or_none()

        result.append({
            "session_id": session.id,
            "title": session.title,
            "description": session.description,
            "status": session.status,
            "deadline": session.deadline,
            "winner_option_id": session.winner_option_id,
            "is_random_winner": session.is_random_winner,
            "total_votes": sum(vote_counts.values()),
            "vote_counts": vote_counts,
            "user_voted": user_voted.option_id if user_voted else None,
            "options": [
                {
                    "id": o.id,
                    "text": o.option_text,
                    "votes": vote_counts.get(o.id, 0)
                }
                for o in options
            ]
        })

    return {"trip_id": trip_id, "sessions": result}

@router.get("/{trip_id}/results")
async def get_final_results(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all closed session results — the final plan"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    sessions_result = await db.execute(
        select(VoteSession).where(
            VoteSession.trip_id == trip_id,
            VoteSession.status == "closed"
        )
    )
    sessions = sessions_result.scalars().all()

    final_plan = []
    for session in sessions:
        winner_text = None
        if session.winner_option_id:
            option_result = await db.execute(
                select(VoteOption).where(VoteOption.id == session.winner_option_id)
            )
            winner_option = option_result.scalar_one_or_none()
            if winner_option:
                winner_text = winner_option.option_text

        final_plan.append({
            "title": session.title,
            "winner": winner_text,
            "is_random_winner": session.is_random_winner
        })

    return {
        "trip_id": trip_id,
        "final_plan": final_plan,
        "total_decisions": len(final_plan)
    }