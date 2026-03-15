import random
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.vote import Vote, VoteSession

async def count_votes(session_id: str, db: AsyncSession) -> dict:
    """Count votes per option for a session"""
    result = await db.execute(
        select(Vote).where(Vote.session_id == session_id)
    )
    votes = result.scalars().all()

    vote_counts = {}
    for vote in votes:
        option_id = vote.option_id
        vote_counts[option_id] = vote_counts.get(option_id, 0) + 1

    return vote_counts

async def determine_winner(vote_counts: dict) -> tuple:
    """
    Returns (winner_id, is_tie, tied_ids)
    """
    if not vote_counts:
        return None, False, []

    max_votes = max(vote_counts.values())
    winners = [k for k, v in vote_counts.items() if v == max_votes]

    if len(winners) == 1:
        return winners[0], False, []
    else:
        return None, True, winners

def pick_random_winner(tied_ids: list) -> str:
    """Randomly pick from tied options"""
    return random.choice(tied_ids)

def is_deadline_passed(deadline: datetime) -> bool:
    """Check if deadline has passed"""
    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    return now > deadline