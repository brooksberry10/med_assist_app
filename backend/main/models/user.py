from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, ForeignKey, BigInteger, String, Integer, Float, Text
from sqlalchemy.orm import relationship

from .. import db


class Users(db.Model):
    id = Column(BigInteger, primary_key=True)
    first_name = Column(String(30), nullable=False)
    last_name = Column(String(30))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    user_info = relationship('UserInfo', backref='users', lazy='joined', uselist=False)
    symptoms = relationship('DailySymptoms', backref='users', lazy='selectin')
    treatments = relationship('Treatments', backref='users', lazy='selectin')
    food_logs = relationship('FoodLog', backref='users', lazy='selectin')
    labs = relationship('Labs', backref='users', lazy='selectin')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'username': self.username,
            'email': self.email
        }
        
    def save(self):
        db.session.add(self)
        db.session.commit()


class UserInfo(db.Model):
    user_info_id = Column(BigInteger, primary_key=True, autoincrement=True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    age = Column(Integer, default=0)
    gender = Column(String(10), default='Not specified')
    weight_lbs = Column(Float, default=0.0)
    height_ft = Column(Integer, default=0)
    height_in = Column(Integer, default=0)
    current_diagnoses = Column(Text(), default='Not provided')
    medical_history = Column(Text(), default='Not provided')
    insurance = Column(Text(), default='Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self):
        return {
            'user_info_id': self.user_info_id,
            'age': self.age,
            'gender': self.gender,
            'weight_lbs': self.weight_lbs,
            'height_ft': self.height_ft,
            'height_in': self.height_in,
            'current_diagnoses': self.current_diagnoses,
            'medical_history': self.medical_history,
            'insurance': self.insurance
        }

