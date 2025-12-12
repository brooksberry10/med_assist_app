from sqlalchemy import Column, ForeignKey, BigInteger, String, Boolean, Text, DateTime

from .. import db


class Treatments(db.Model):
    treatment_id = Column(BigInteger, primary_key=True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    treatment_name = Column(String(100), default='Not provided')
    scheduled_on = Column(DateTime())
    notes = Column(Text(), default='Not provided')
    is_completed = Column(Boolean(), default=False)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            'treatment_id': self.treatment_id,
            'treatment_name': self.treatment_name,
            'scheduled_on': self.scheduled_on.isoformat() if self.scheduled_on else None,
            'notes': self.notes,
            'is_completed': self.is_completed,
        }

