from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import (Column, ForeignKey, Integer, String, BigInteger, DateTime, Float, Text, Boolean)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


class Users(db.Model):
    id = Column(BigInteger, primary_key = True)
    first_name = Column(String(30), nullable = False)
    last_name = Column(String(30))
    username = Column(String(50), unique = True, nullable = False)
    email = Column(String(150), unique = True, nullable = False)
    password_hash = Column(String(255), nullable= False)

    #HASH PASSWORD
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    #TO DICT METHOD
    def to_dict(self):
        data = {
            'id': self.id,
            'first_name' : self.first_name,
            'last_name': self.last_name,
            'username': self.username,
            'email': self.email
        }
        return data
        
    #SAVE TO DB 
    def save(self):
        db.session.add(self)
        db.session.commit()
        
        
    user_info = relationship('UserInfo', backref = 'users', lazy = 'joined', uselist=False)
    symptoms = relationship('DailySymptoms', backref='users', lazy='selectin')
    treatments = relationship('Treatments', backref = 'users', lazy='selectin')
    food_logs = relationship('FoodLog', backref = 'users', lazy = 'selectin')
    labs = relationship('Labs', backref = 'users', lazy = 'selectin')

class UserInfo(db.Model):
    user_info_id = Column(BigInteger, primary_key = True, autoincrement = True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable = False)
    age = Column(Integer, default = 0)
    gender = Column(String(10), default = 'Not specified')
    weight_lbs = Column(Float, default = 0.0)
    height_ft = Column(Integer, default = 0)
    height_in = Column(Integer, default = 0)
    current_diagnoses = Column(Text(),default = 'Not provided')
    medical_history = Column(Text(), default = 'Not provided')
    insurance = Column(Text(), default = 'Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    #TO DICT METHOD
    def to_dict(self):
        data = {
            'user_info_id': self.user_info_id,
            'age' : self.age,
            'gender': self.gender,
            'weight_lbs': self.weight_lbs,
            'height_ft': self.height_ft,
            'height_in': self.height_in,
            'current_diagnoses': self.current_diagnoses,
            'medical_history': self.medical_history,
            'insurance': self.insurance
        }
        return data
class DailySymptoms(db.Model):
    symptoms_id = Column(BigInteger, primary_key = True, autoincrement = True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable = False)
    severity = Column(Integer, default = 0)
    type_of_symptom = Column(String(100), default = 'Not specified')
    weight_lbs = Column(Float, default = 0.0)
    recorded_on = Column(DateTime(), default = datetime.now(timezone.utc))
    notes = Column(Text, default = 'Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()


     #TO DICT METHOD
    def to_dict(self):
        data = {
            'symptoms_id': self.symptoms_id,
            'severity' : self.severity,
            'type_of_symptom': self.type_of_symptom,
            'weight_lbs': self.weight_lbs,
            'recorded_on': self.recorded_on,
            'notes': self.notes
        }
        return data

class Treatments(db.Model):
    treatment_id = Column(BigInteger, primary_key = True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable = False)
    treatment_name = Column(String(100), default = 'Not provided')
    scheduled_on = Column(DateTime())
    notes = Column(Text(), default = 'Not provided')
    is_completed = Column(Boolean(), default = False)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        data = {
            'treatment_id': self.treatment_id,
            'treatment_name' : self.treatment_id,
            'scheduled_on': self.scheduled_on,
            'notes': self.notes,
            'is_completed': self.is_completed,
        }
        return data


class FoodLog(db.Model):
    foodlog_id = Column(BigInteger, primary_key = True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable = False)
    breakfast = Column(String(100))
    lunch = Column(String(100))
    dinner = Column(String(100))
    notes = Column(Text())
    total_calories = Column(Float, default = 0.0)
    recorded_on = Column(DateTime(), default = datetime.now(timezone.utc))

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        data = {
            'foodlog_id': self.foodlog_id,
            'breakfast' : self.breakfast,
            'lunch': self.lunch,
            'dinner': self.dinner,
            'notes': self.notes,
            'total_calories': self.total_calories,
            'recorded_on': self.recorded_on
        }
        return data


class Labs(db.Model):
    lab_id = Column(BigInteger, primary_key = True)
    id = Column(BigInteger, ForeignKey('users.id'), nullable = False)
    #Both systolic and diastolic are needed to calculate blood pressure
    systolic_pressure = Column(Integer, default = 0)
    diastolic_pressure = Column(Integer, default = 0)
    rbc_count = Column(Float())

    def save(self):
        db.session.add(self)
        db.session.commit()

    def to_dict(self):
        data = {
            'lab_id': self.lab_id,
            'systolic_pressure' : self.systolic_pressure,
            'diastolic_pressure': self.diastolic_pressure,
            'rbc_count': self.rbc_count
        }
        return data


class TokenBlockList(db.Model):
    id = Column(BigInteger(), primary_key = True)
    jti = Column(String(64), nullable = False)
    create_at = Column(DateTime(), default = datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        