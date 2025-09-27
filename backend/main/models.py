from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone


class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(30), nullable = False)
    last_name = db.Column(db.String(30))
    email = db.Column(db.String(150), unique = True, nullable = False)
    password_hash = db.Column(db.String(255), nullable= False)

    #HASH PASSWORD
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    user_info = db.relationship('UserInfo', backref = 'user', lazy = True)
    symptoms = db.relationship('DailySymptoms', backref='user', lazy=True)
    food_logs = db.relationship('FoodLog', backref = 'user', lazy = True)
    labs = db.relationship('Labs', backref = 'user', lazy = True)

class UserInfo(db.Model):
    user_info_id = db.Column(db.Integer, primary_key = True)
    id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    weight_lbs = db.Column(db.Float)
    height_ft = db.Column(db.Float)
    current_diagnoses = db.Column(db.String(1000))
    medical_history = db.Column(db.String(1000))
    
class DailySymptoms(db.Model):
    symptoms_id = db.Column(db.Integer, primary_key = True)
    id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    severity = db.Column(db.Integer)
    type_of_symptom = db.Column(db.String(20))
    weight_lbs = db.Column(db.Float)
    notes = db.Column(db.String(1000))

class FoodLog(db.Model):
    foodlog_id = db.Column(db.Integer, primary_key = True)
    id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    breakfast = db.Column(db.String(100))
    lunch = db.Column(db.String(100))
    dinner = db.Column(db.String(100))
    notes = db.Column(db.String(1000))
    total_calories = db.Column(db.Float)

class Labs(db.Model):
    lab_id = db.Column(db.Integer, primary_key = True)
    id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    bloodpressure = db.Column(db.String(100))

class TokenBlockList(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    jti = db.Column(db.String(64), nullable = False)
    create_at = db.Column(db.DateTime(), default = datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        