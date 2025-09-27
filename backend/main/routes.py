from flask import Blueprint, request, jsonify
from .models import User, DailySymptoms, FoodLog, Labs
from .forms import RegistrationForm, LoginForm, ValidationError, UserSchema
from flask_jwt_extended import create_access_token, create_refresh_token,jwt_required
from . import db

#api will be the base path for backend to prevent frontend collisions
bp = Blueprint('api', __name__, url_prefix='/api')


#------------------------------------------AUTHENTICATION----------------------------------------------------#

#USER REGISTRATION #*DONE
@bp.route('/auth/register', methods = ['POST'])
def register():
    
    data = request.get_json()
    print("User data:", data)

    schema = RegistrationForm()

    try:
        validate = schema.load(data)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), 400

    user = User(first_name = validate['first_name'], last_name = validate['last_name'], email = validate['email'])
    user.set_password(validate['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfulyy"}), 201



#LOGIN USER USING JWT TOKENS #*DONE
@bp.route('/auth/login', methods = ['POST'])
def login():

    data = request.get_json()
    
    schema = LoginForm()

    try:
        validate = schema.load(data)
    except ValidationError as error:
        jsonify({"error": error.messages}), 400

    user = User.query.filter_by(email = validate['email']).first()

    if user and user.check_password(password = validate['password']):
        access_token = create_access_token(identity=user.email)
        refresh_token = create_refresh_token(identity=user.email)

        return jsonify({"message": "Login Successful",
                        "tokens": {
                            "access": access_token,
                            "refresh": refresh_token
                            }
                            
                        }),200
    
    return jsonify({"error":"Invalid email or password"}),401
    
        

#LOGOUT USER -(GOING TO BE REWORKED) 
@bp.route('/logout/<int:id>')
def logout(id):
    pass


#-------------------------------------USER & USER INFO----------------------------------------#
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

# GET - A PAGE OF USERS(PAGINATED) NEED TO BE AUTHORIZED (LOGGED IN) TO VEIW #* DONE
@bp.route('/users/all',methods = ['GET'])
@jwt_required()
def get_all_users():
    
    page = request.args.get('page', default=1, type=int)
    per_page =  request.args.get('per_page', default=20, type=int)

    users = User.query.paginate(
        page=page,
        per_page=per_page
    )

    result = UserSchema().dump(users, many=True)

    return jsonify({
        "users": result
    }), 200



#-------------------------------------USER HEALTH RECORD---------------------------------------#
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
