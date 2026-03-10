from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, AsyncSessionLocal
from app.firebase import get_current_user
from app.api.users import router as users_router
from app.api.trips import router as trips_router
from app.api.recommendations import router as recommendations_router
from app.services.template_seeder import seed_templates
import app.models

app = FastAPI(
    title="Voyant API",
    description="AI powered group travel planning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(trips_router)
app.include_router(recommendations_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected and tables created!")

    # seed templates
    async with AsyncSessionLocal() as db:
        await seed_templates(db)

@app.get("/")
async def root():
    return {"message": "Welcome to Voyant API 🚀"}

@app.get("/health")
async def health():
    return {"status": "healthy"}