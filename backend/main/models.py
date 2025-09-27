from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone


class Users(db.Model):
    id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    first_name = db.Column(db.String(30), nullable = False)
    last_name = db.Column(db.String(30))
    username = db.Column(db.String(50), unique = True, nullable = False)
    email = db.Column(db.String(150), unique = True, nullable = False)
    password_hash = db.Column(db.String(255), nullable= False)


    #HASH PASSWORD
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    #SAVE Users TO DB
    def save(self):
        db.session.add(self)
        db.session.commit()
        
        
    user_info = db.relationship('UserInfo', backref = 'users', lazy = True)
    symptoms = db.relationship('DailySymptoms', backref='users', lazy=True)
    treatments = db.relationship('Treatments', backref = 'users', lazy=True)
    food_logs = db.relationship('FoodLog', backref = 'users', lazy = True)
    labs = db.relationship('Labs', backref = 'users', lazy = True)

class UserInfo(db.Model):
    user_info_id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable = False)
    age = db.Column(db.Integer, default = 0)
    gender = db.Column(db.String(10), default = 'Not specified')
    weight_lbs = db.Column(db.Float, default = 0.0)
    height_ft = db.Column(db.Integer, default = 0)
    height_inch = db.Column(db.Integer, default = 0)
    current_diagnoses = db.Column(db.Text(),default = 'Not provided')
    medical_history = db.Column(db.Text(), default = 'Not provided')
    insurance = db.Column(db.Text(), default = 'Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()
    
class DailySymptoms(db.Model):
    symptoms_id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable = False)
    severity = db.Column(db.Integer, default = 0)
    type_of_symptom = db.Column(db.String(100), default = 'Not specified')
    weight_lbs = db.Column(db.Float, default = 0.0)
    recorded_on = db.Column(db.DateTime(), default = datetime.now(timezone.utc))
    notes = db.Column(db.Text, default = 'Not provided')

    def save(self):
        db.session.add(self)
        db.session.commit()

class Treatments(db.Model):
    treatment_id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable = False)
    treatment_name = db.Column(db.String(100), default = 'Not provided')
    scheduled_on = db.Column(db.DateTime())
    notes = db.Column(db.Text(), default = 'Not provided')
    is_completed = db.Column(db.Boolean(), default = False)

    def save(self):
        db.session.add(self)
        db.session.commit()

class FoodLog(db.Model):
    foodlog_id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable = False)
    breakfast = db.Column(db.String(100))
    lunch = db.Column(db.String(100))
    dinner = db.Column(db.String(100))
    notes = db.Column(db.Text())
    total_calories = db.Column(db.Float, default = 0.0)
    recorded_on = db.Column(db.DateTime(), default = datetime.now(timezone.utc))

    def save(self):
        db.session.add(self)
        db.session.commit()

class Labs(db.Model):
    lab_id = db.Column(db.BigInteger, primary_key = True, autoincrement = True)
    id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable = False)
    #Both systolic and diastolic are needed to calculate blood pressure
    systolic_pressure = db.Column(db.Integer, default = 0)
    diastolic_pressure = db.Column(db.Integer, default = 0)
    rbc_count = db.Column(db.Float())

    def save(self):
        db.session.add(self)
        db.session.commit()

class TokenBlockList(db.Model):
    id = db.Column(db.BigInteger(), primary_key = True, autoincrement = True)
    jti = db.Column(db.String(64), nullable = False)
    create_at = db.Column(db.DateTime(), default = datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        