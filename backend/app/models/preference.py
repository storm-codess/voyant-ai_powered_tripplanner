from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(String, primary_key=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    budget_min = Column(Integer, nullable=False)
    budget_max = Column(Integer, nullable=False)
    travel_dates = Column(JSON, nullable=True)  # list of available dates
    vibes = Column(JSON, nullable=True)          # list of vibes
    visited_places = Column(JSON, nullable=True) # places already visited
    avoided_places = Column(JSON, nullable=True) # places to avoid
    special_requirements = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    trip = relationship("Trip", back_populates="preferences")