from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.firebase import get_current_user
from app.api.users import router as users_router
from app.api.trips import router as trips_router
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

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected and tables created!")

@app.get("/")
async def root():
    return {"message": "Welcome to Voyant API 🚀"}

@app.get("/health")
async def health():
    return {"status": "healthy"}