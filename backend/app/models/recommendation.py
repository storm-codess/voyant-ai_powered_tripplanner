from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    destination = Column(String, nullable=False)
    reasoning = Column(Text, nullable=False)
    estimated_budget = Column(JSON, nullable=True)
    activities = Column(JSON, nullable=True)
    hotels = Column(JSON, nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    trip = relationship("Trip", back_populates="recommendations")