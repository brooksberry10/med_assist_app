from . import db

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(30))
    last_name = db.Column(db.String(30))
    email = db.Column(db.String(50), unique = True, nullable = False)
    password = db.Column(db.String(255), nullable = False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    weight_lbs = db.Column(db.Float)
    height_ft = db.Column(db.Float)
    current_diagnoses = db.Column(db.String(1000))
    medical_history = db.Column(db.String(1000))

    symptoms = db.relationship('DailySymptoms', backref='user', lazy=True)
    food_logs = db.relationship('FoodLog', backref = 'user', lazy = True)
    labs = db.relationship('Labs', backref = 'user', lazy = True)

class DailySymptoms(db.Model):
    symptoms_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
    severity = db.Column(db.Integer)
    type_of_symptom = db.Column(db.String(20))
    weight_lbs = db.Column(db.Float)
    notes = db.Column(db.String(1000))

class FoodLog(db.Model):
    foodlog_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
    breakfast = db.Column(db.String(100))
    lunch = db.Column(db.String(100))
    dinner = db.Column(db.String(100))
    notes = db.Column(db.String(1000))
    total_calories = db.Column(db.Float)

class Labs(db.Model):
    lab_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
    bloodpressure = db.Column(db.String(100))

