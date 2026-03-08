from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

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

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database connected successfully!")

@app.get("/")
async def root():
    return {"message": "Welcome to Voyant API 🚀"}

@app.get("/health")
async def health():
    return {"status": "healthy"}