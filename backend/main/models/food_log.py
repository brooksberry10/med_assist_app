from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, BigInteger, String, Float, Text, DateTime

from .. import db


class FoodLog(db.Model):
    foodlog_id = Column(BigInteger, primary_key=True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    breakfast = Column(String(100))
    lunch = Column(String(100))
    dinner = Column(String(100))
    notes = Column(Text())
    total_calories = Column(Float, default=0.0)
    recorded_on = Column(DateTime(), default=datetime.now(timezone.utc))

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            'foodlog_id': self.foodlog_id,
            'breakfast': self.breakfast,
            'lunch': self.lunch,
            'dinner': self.dinner,
            'notes': self.notes,
            'total_calories': self.total_calories,
            'recorded_on': self.recorded_on.isoformat() if self.recorded_on else None
        }

