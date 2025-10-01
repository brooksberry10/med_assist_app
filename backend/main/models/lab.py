from sqlalchemy import Column, ForeignKey, BigInteger, Integer, Float

from .. import db


class Labs(db.Model):
    lab_id = Column(BigInteger, primary_key=True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    #Both systolic and diastolic are needed to calculate blood pressure
    systolic_pressure = Column(Integer, default=0)
    diastolic_pressure = Column(Integer, default=0)
    rbc_count = Column(Float())

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        return {
            'lab_id': self.lab_id,
            'systolic_pressure': self.systolic_pressure,
            'diastolic_pressure': self.diastolic_pressure,
            'rbc_count': self.rbc_count
        }

