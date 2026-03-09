from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database import Base

class VoteCategory(enum.Enum):
    destination = "destination"
    hotel = "hotel"
    activity = "activity"

class Vote(Base):
    __tablename__ = "votes"

    id = Column(String, primary_key=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=False)
    category = Column(Enum(VoteCategory), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    trip = relationship("Trip", back_populates="votes")
    recommendation = relationship("Recommendation", back_populates="votes")