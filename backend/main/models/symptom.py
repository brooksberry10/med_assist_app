from datetime import datetime, timezone
from sqlalchemy import Column, ForeignKey, BigInteger, String, Integer, Float, Text, DateTime

from .. import db


class DailySymptoms(db.Model):
    symptoms_id = Column(BigInteger, primary_key=True, autoincrement=True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    severity = Column(Integer, default=0)
    type_of_symptom = Column(String(100), default='Not specified')
    weight_lbs = Column(Float, default=0.0)
    recorded_on = Column(DateTime(), default=datetime.now(timezone.utc))
    notes = Column(Text, default='Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            'symptoms_id': self.symptoms_id,
            'severity': self.severity,
            'type_of_symptom': self.type_of_symptom,
            'weight_lbs': self.weight_lbs,
            'recorded_on': self.recorded_on,
            'notes': self.notes
        }

