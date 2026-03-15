from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from app.database import get_db
from app.models.template import Template, TemplateQuestion
from app.models.form import Form, FormQuestion, FormResponse, Answer
from app.models.trip import Trip, TripMember
from app.firebase import get_current_user
import uuid

router = APIRouter(prefix="/forms", tags=["forms"])

# ─── Pydantic Schemas ───────────────────────────────────────────

class QuestionEdit(BaseModel):
    id: Optional[str] = None        # None means new question
    question_text: str
    question_type: str              # single_choice, multiple_choice, text, scale, range
    options: Optional[list] = None
    is_required: bool = True
    order: int
    placeholder: Optional[str] = None

class CreateFormRequest(BaseModel):
    template_id: str
    title: str
    description: Optional[str] = None

class EditFormRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[list[QuestionEdit]] = None

class SubmitResponseRequest(BaseModel):
    answers: list[dict]  # [{question_id, answer_text, answer_options}]

# ─── Templates ──────────────────────────────────────────────────

@router.get("/templates")
async def get_templates(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all available templates"""
    result = await db.execute(select(Template))
    templates = result.scalars().all()

    response = []
    for template in templates:
        questions_result = await db.execute(
            select(TemplateQuestion)
            .where(TemplateQuestion.template_id == template.id)
            .order_by(TemplateQuestion.order)
        )
        questions = questions_result.scalars().all()

        response.append({
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "icon": template.icon,
            "is_custom": template.is_custom,
            "question_count": len(questions),
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "options": q.options,
                    "is_required": q.is_required,
                    "order": q.order,
                    "placeholder": q.placeholder
                }
                for q in questions
            ]
        })

    return response

# ─── Forms ──────────────────────────────────────────────────────

@router.post("/{trip_id}/create")
async def create_form(
    trip_id: str,
    request: CreateFormRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Creator picks a template and creates a form for the trip"""

    # check trip exists and user is creator
    trip_result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only trip creator can create forms")

    # check no form already exists for this trip
    existing = await db.execute(
        select(Form).where(Form.trip_id == trip_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Form already exists for this trip")

    # get template
    template_result = await db.execute(
        select(Template).where(Template.id == request.template_id)
    )
    template = template_result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # create form
    form = Form(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        template_id=request.template_id,
        title=request.title,
        description=request.description,
        status="draft",
        created_by=current_user["uid"]
    )
    db.add(form)
    await db.flush()

    # copy questions from template
    questions_result = await db.execute(
        select(TemplateQuestion)
        .where(TemplateQuestion.template_id == request.template_id)
        .order_by(TemplateQuestion.order)
    )
    template_questions = questions_result.scalars().all()

    for tq in template_questions:
        form_question = FormQuestion(
            id=str(uuid.uuid4()),
            form_id=form.id,
            question_text=tq.question_text,
            question_type=tq.question_type,
            options=tq.options,
            is_required=tq.is_required,
            order=tq.order,
            placeholder=tq.placeholder
        )
        db.add(form_question)

    await db.commit()

    return {
        "message": "Form created successfully",
        "form_id": form.id,
        "template": template.name,
        "question_count": len(template_questions),
        "status": "draft",
        "next_step": "Edit questions if needed, then publish"
    }

@router.put("/{trip_id}/edit")
async def edit_form(
    trip_id: str,
    request: EditFormRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Creator edits form title, description, or questions"""

    # check trip and creator
    trip_result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only trip creator can edit forms")

    # get form
    form_result = await db.execute(select(Form).where(Form.trip_id == trip_id))
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status == "published":
        raise HTTPException(status_code=400, detail="Cannot edit a published form")

    # update title and description
    if request.title:
        form.title = request.title
    if request.description:
        form.description = request.description

    # update questions if provided
    if request.questions:
        # delete existing questions
        existing_questions = await db.execute(
            select(FormQuestion).where(FormQuestion.form_id == form.id)
        )
        for q in existing_questions.scalars().all():
            await db.delete(q)

        # add new questions
        for q in request.questions:
            form_question = FormQuestion(
                id=str(uuid.uuid4()),
                form_id=form.id,
                question_text=q.question_text,
                question_type=q.question_type,
                options=q.options,
                is_required=q.is_required,
                order=q.order,
                placeholder=q.placeholder
            )
            db.add(form_question)

    await db.commit()

    return {"message": "Form updated successfully"}

@router.post("/{trip_id}/publish")
async def publish_form(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Creator publishes form — members can now fill it"""

    # check trip and creator
    trip_result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = trip_result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user["uid"]:
        raise HTTPException(status_code=403, detail="Only trip creator can publish forms")

    # get form
    form_result = await db.execute(select(Form).where(Form.trip_id == trip_id))
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status == "published":
        raise HTTPException(status_code=400, detail="Form is already published")

    form.status = "published"
    form.published_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "message": "Form published! Members can now fill it.",
        "form_id": form.id
    }

@router.get("/{trip_id}/form")
async def get_form(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get form with all questions for a trip"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get form
    form_result = await db.execute(select(Form).where(Form.trip_id == trip_id))
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # get questions
    questions_result = await db.execute(
        select(FormQuestion)
        .where(FormQuestion.form_id == form.id)
        .order_by(FormQuestion.order)
    )
    questions = questions_result.scalars().all()

    # check if current user already submitted
    response_result = await db.execute(
        select(FormResponse).where(
            FormResponse.form_id == form.id,
            FormResponse.user_id == current_user["uid"]
        )
    )
    existing_response = response_result.scalar_one_or_none()

    return {
        "form_id": form.id,
        "title": form.title,
        "description": form.description,
        "status": form.status,
        "already_submitted": existing_response.is_complete if existing_response else False,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "options": q.options,
                "is_required": q.is_required,
                "order": q.order,
                "placeholder": q.placeholder
            }
            for q in questions
        ]
    }

@router.post("/{trip_id}/submit")
async def submit_form_response(
    trip_id: str,
    request: SubmitResponseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Member submits their form response"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get published form
    form_result = await db.execute(
        select(Form).where(
            Form.trip_id == trip_id,
            Form.status == "published"
        )
    )
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="No published form found")

    # check if already submitted — if yes, update
    response_result = await db.execute(
        select(FormResponse).where(
            FormResponse.form_id == form.id,
            FormResponse.user_id == current_user["uid"]
        )
    )
    existing_response = response_result.scalar_one_or_none()

    if existing_response:
        # delete old answers
        old_answers = await db.execute(
            select(Answer).where(Answer.response_id == existing_response.id)
        )
        for answer in old_answers.scalars().all():
            await db.delete(answer)
        form_response = existing_response
    else:
        # create new response
        form_response = FormResponse(
            id=str(uuid.uuid4()),
            form_id=form.id,
            user_id=current_user["uid"],
            is_complete=False
        )
        db.add(form_response)
        await db.flush()

    # save answers
    for answer_data in request.answers:
        answer = Answer(
            id=str(uuid.uuid4()),
            response_id=form_response.id,
            question_id=answer_data["question_id"],
            answer_text=answer_data.get("answer_text"),
            answer_options=answer_data.get("answer_options")
        )
        db.add(answer)

    form_response.is_complete = True
    form_response.submitted_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Form submitted successfully"}

@router.get("/{trip_id}/status")
async def get_form_status(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get who has submitted and who hasn't"""

    # check member
    member_result = await db.execute(
        select(TripMember).where(
            TripMember.trip_id == trip_id,
            TripMember.user_id == current_user["uid"]
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a trip member")

    # get all members
    all_members = await db.execute(
        select(TripMember).where(TripMember.trip_id == trip_id)
    )
    members = all_members.scalars().all()

    # get form
    form_result = await db.execute(select(Form).where(Form.trip_id == trip_id))
    form = form_result.scalar_one_or_none()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    # get all responses
    responses_result = await db.execute(
        select(FormResponse).where(
            FormResponse.form_id == form.id,
            FormResponse.is_complete == True
        )
    )
    submitted_user_ids = {r.user_id for r in responses_result.scalars().all()}

    submitted = [m.user_id for m in members if m.user_id in submitted_user_ids]
    pending = [m.user_id for m in members if m.user_id not in submitted_user_ids]

    return {
        "form_id": form.id,
        "form_status": form.status,
        "total_members": len(members),
        "submitted_count": len(submitted),
        "pending_count": len(pending),
        "submitted": submitted,
        "pending": pending,
        "all_submitted": len(pending) == 0
    }