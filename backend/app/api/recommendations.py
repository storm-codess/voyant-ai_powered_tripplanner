from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.trip import Trip, TripMember
from app.models.form import Form, FormResponse, Answer, FormQuestion
from app.models.recommendation import Recommendation
from app.firebase import get_current_user
from app.services.ai_service import generate_recommendations
import uuid

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

async def get_form_answers_for_ai(trip_id: str, db: AsyncSession) -> dict:
    """
    Read all form responses for a trip and structure them for AI
    """
    # get published form for this trip
    form_result = await db.execute(
        select(Form).where(
            Form.trip_id == trip_id,
            Form.status == "published"
        )
    )
    form = form_result.scalar_one_or_none()
    if not form:
        return {}

    # get all completed responses
    responses_result = await db.execute(
        select(FormResponse).where(
            FormResponse.form_id == form.id,
            FormResponse.is_complete == True
        )
    )
    responses = responses_result.scalars().all()
    if not responses:
        return {}

    # get all questions for this form
    questions_result = await db.execute(
        select(FormQuestion).where(
            FormQuestion.form_id == form.id
        ).order_by(FormQuestion.order)
    )
    questions = questions_result.scalars().all()
    question_map = {q.id: q.question_text for q in questions}

    # aggregate all answers per question
    aggregated = {}
    for response in responses:
        answers_result = await db.execute(
            select(Answer).where(Answer.response_id == response.id)
        )
        answers = answers_result.scalars().all()

        for answer in answers:
            question_text = question_map.get(answer.question_id, "Unknown")
            if question_text not in aggregated:
                aggregated[question_text] = []

            if answer.answer_text:
                aggregated[question_text].append(answer.answer_text)
            if answer.answer_options:
                aggregated[question_text].extend(answer.answer_options)

    return {
        "form_title": form.title,
        "total_responses": len(responses),
        "group_size": len(responses),
        "answers": aggregated
    }

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

    # get form answers
    form_data = await get_form_answers_for_ai(trip_id, db)
    if not form_data:
        raise HTTPException(
            status_code=400,
            detail="No form responses found. Make sure form is published and members have responded."
        )

    # get current version number
    version_result = await db.execute(
        select(func.max(Recommendation.version)).where(
            Recommendation.trip_id == trip_id
        )
    )
    current_version = version_result.scalar() or 0
    new_version = current_version + 1

    # generate AI recommendations via gateway
    recommendations = await generate_recommendations(
        trip_name=trip.name,
        form_data=form_data
    )

    # save to database with version number
    for rec in recommendations:
        new_rec = Recommendation(
            id=str(uuid.uuid4()),
            trip_id=trip_id,
            destination=rec["destination"],
            reasoning=rec["reasoning"],
            estimated_budget=rec.get("estimated_budget", {}),
            activities=rec.get("best_activities", []),
            version=new_version
        )
        db.add(new_rec)

    await db.commit()

    return {
        "message": f"Generation {new_version} complete",
        "version": new_version,
        "form_data": form_data,
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