from flask import Blueprint, request, jsonify
from .models import User, DailySymptoms, FoodLog, Labs
from . import db

#api will be the base path for backend to prevent frontend collisions
bp = Blueprint('api', __name__, url_prefix='/api')

# GET - USERS
@bp.route('/user', methods = ['GET'])
def get_users():
    users = User.query.all()
    users_list = []
    for user in users:
        users_list.append({
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
            # 'age':user.age,
            # 'gender': user.gender,
            # 'weight_lbs': user.weight_lbs,
            # 'height_ft': user.height_ft,
            # 'current_diagnoses': user.current_diagnoses,
            # 'medical_history': user.medical_history,
        })

    return jsonify(users_list)

# POST - USERS
@bp.route('/user', methods = ['POST'])
def add_user():
    data = request.get_json()

    new_user = User(
        first_name = data['first_name'],
        last_name = data['last_name'],
        email = data['email'],
        password = data['password']
        # age = data.get('age'),
        # gender = data.get('gender'),
        # weight_lbs = data.get('weight_lbs'),
        # height_ft = data.get('height_ft'),
        # current_diagnoses = data.get('current_diagnoses'),
        # medical_history = data.get('medical_history')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


#GET - USER INFORMATION
@bp.route('/user)


#POST - USER INFORMATION

# GET - SYMPTOMS
@bp.route('/user/<int:user_id>/symptoms', methods = ['GET'])
def get_symptoms(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    symptoms_list = []
    for symptom in user.symptoms:
        symptoms_list.append({
            'symptoms_id': symptom.symptoms_id,
            "severity" : symptom.severity,
            "type_of_symptom": symptom.type_of_symptom,
            "weight_lbs" : symptom.weight_lbs,
            "notes": symptom.notes
        })
    return jsonify(symptoms_list)

# POST - SYMPTOMS
@bp.route('/user/<int:user_id>/symptoms', methods = ['POST'])
def add_symptoms(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error":"User not found"}), 404
        
        data = request.get_json()
        symptom = DailySymptoms(
            user_id = user_id,
            severity = data.get('severity'),
            type_of_symptom = data.get('type_of_symptom'),
            weight_lbs = data.get('weight_lbs'),
            notes = data.get('notes')
            )
        
        db.session.add(symptom)
        db.session.commit()
        return jsonify({"message": "Symptom added successfully"}), 201
    except Exception:
        return jsonify({"error": "Failed to log symptom"}), 500

# GET - FOOD LOGS
@bp.route('/user/<int:user_id>/food-logs', methods = ['GET'])
def get_foodlogs(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User does not exist"}),404

    foodlog_list = []
    for foodlog in user.food_logs:
        foodlog_list.append({
            'foodlog_id': foodlog.foodlog_id,
            'breakfast': foodlog.breakfast,
            'lunch': foodlog.lunch,
            'dinner': foodlog.dinner,
            'total_calories':foodlog.total_calories,
            'notes': foodlog.notes
        })

    return jsonify(foodlog_list)
    
# POST - FOOD LOGS
@bp.route('/user/<int:user_id>/food-logs', methods = ['POST'])
def add_foodlog(user_id):
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User does not exist'})
        
        data = request.get_json()
        foodlog = FoodLog(
            user_id = user_id,
            breakfast = data.get('breakfast'),
            lunch = data.get('lunch'),
            dinner = data.get('dinner'),
            total_calories = data.get('total_calories'),
            notes = data.get('notes')
        )

        db.session.add(foodlog)
        db.session.commit()
        return jsonify({"message": "Food logged successfully!"}),201
    except Exception:
        return jsonify({"error": "Failed to log food"}),500

    





@bp.get("/users/me")
def users_me():
    return "profile page", 200, {"Content-Type": "text/plain; charset=utf-8"}
    #test to make sure flask set up worked




#add more endpoints later
