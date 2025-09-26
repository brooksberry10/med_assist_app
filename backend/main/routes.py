from flask import Blueprint, request, jsonify
from flask_login import current_user, login_user, logout_user
from .models import User, DailySymptoms, FoodLog, Labs
from .forms import RegistrationForm, LoginForm
from flask_jwt_extended import create_access_token, create_refresh_token,jwt_required
from . import db

#api will be the base path for backend to prevent frontend collisions
bp = Blueprint('api', __name__, url_prefix='/api')



#USER REGISTRATION
@bp.route('auth/register', methods = ['POST'])
def register():
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}),400
    
    if not data.get('email') or not data.get('password') or not data.get('first_name'):
        return jsonify({"error": "First Name, Email, & Password are required"}), 400

    form = RegistrationForm.from_json(data = data)

    if form.validate_on_submit():
        if User.query.filter_by(email = form.email.data).first():
            return jsonify({"error":"Email is already registered"}), 409

        user = User(first_name = form.first_name.data, last_name = form.last_name.data, email = form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created successfulyy"}), 201
    else:
        return jsonify({"error": form.errors}), 400


#LOGIN USER USING JWT TOKENS
@bp.route('auth/login', methods = ['POST'])
def login():

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}),400

    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required!"}), 400
    
    form = LoginForm.from_json(data = data)

    if form.validate_on_submit():
        user = User.query.filter_by(email = form.email.data).first()

        if user and user.check_password(password = form.password.data):
            access_token = create_access_token(identity=user.email)
            refresh_token = create_refresh_token(identity=user.email)

            return jsonify({"message": "Login Successful",
                            "tokens": {
                                "access": access_token,
                                "refresh": refresh_token
                                }
                                
                            }),200
        
        return jsonify({"error":"Invalid email or password"}),401
    else:
        return jsonify({"error": form.errors}), 400
        

#LOGOUT USER - Flask_login handles this (GOING TO BE REWORKED)
@bp.route('/logout/<int:id>')
def logout(id):
    logout_user(id)
    return jsonify({"message": "Logged Out Successfully",}),200



# GET - A USER
@bp.route('/user/<int:id>', methods = ['GET'])
def get_user(id):
    user = User.query.filter_by(id=id).first()

    if user:
        user_required_info = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email}

        return jsonify(user_required_info),200
    else:
        return jsonify({"error": "User does not exist"}),404

# GET - A PAGE OF USERS(PAGINATED) NEED TO BE AUTHORIZED (LOGGED IN) TO VEIW
@bp.route('/users/all',methods = ['GET'])
@jwt_required()
def get_all_users():
    
    page = request.args.get('page', default=1, type=int)
    per_page =  request.args.get('per_page', default=20, type=int)

    user_list = []
    query = User.query.order_by(User.id)
    users = db.paginate(query, page=page, per_page=per_page, error_out=False).items

    for user in users:
        user_list.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name":user.last_name,
            "email": user.email
        })

    return jsonify({
        "users": user_list
    }), 200


# GET - SYMPTOMS
@bp.route('/user/<int:id>/symptoms', methods = ['GET'])
def get_symptoms(id):
    user = User.query.get(id)
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
    return jsonify(symptoms_list),200

# POST - SYMPTOMS
@bp.route('/user/<int:id>/symptoms', methods = ['POST'])
def add_symptoms(id):
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"error":"User not found"}), 404
        
        data = request.get_json()
        symptom = DailySymptoms(
            id = id,
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
@bp.route('/user/<int:id>/food-logs', methods = ['GET'])
def get_foodlogs(id):
    user = User.query.get(id)

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
@bp.route('/user/<int:id>/food-logs', methods = ['POST'])
def add_foodlog(id):
    try:
        user = User.query.get(id)

        if not user:
            return jsonify({'error': 'User does not exist'})
        
        data = request.get_json()
        foodlog = FoodLog(
            id = id,
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
