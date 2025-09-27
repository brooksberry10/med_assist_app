from flask import Blueprint, request, jsonify
from .models import Users, DailySymptoms, FoodLog, Labs, TokenBlockList
from .forms import RegistrationForm, LoginForm, ValidationError, UserSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt, current_user,
                                get_jwt_identity)
from . import db

#api will be the base path for backend to prevent frontend collisions
bp = Blueprint('api', __name__, url_prefix='/api')


#------------------------------------------AUTHENTICATION----------------------------------------------------#

#Users REGISTRATION 
@bp.route('/auth/register', methods = ['POST'])
def register():
    
    data = request.get_json()

    schema = RegistrationForm()

    try:
        validate = schema.load(data)
    except ValidationError as error:
        return jsonify({"errors": error.messages}), 400

    users = Users(first_name = validate['first_name'], last_name = validate['last_name'], 
                username = validate['username'], email = validate['email'])
    users.set_password(validate['password'])
    users.save()
    return jsonify({"message": "Users created successfulyy"}), 201



#LOGIN Users USING JWT TOKENS 
@bp.route('/auth/login', methods = ['POST'])
def login():

    data = request.get_json()
    
    schema = LoginForm()

    try:
        validate = schema.load(data)
    except ValidationError as error:
        jsonify({"error": error.messages}), 400

    users = Users.query.filter_by(email = validate['email']).first()

    if users and users.check_password(password = validate['password']):
        access_token = create_access_token(identity=users.email)
        refresh_token = create_refresh_token(identity=users.email)

        return jsonify({"message": "Login Successful",
                        "tokens": {
                            "access": access_token,
                            "refresh": refresh_token
                            }
                            
                        }),200
    
    return jsonify({"error":"Invalid email or password"}),401
    
        

#LOGOUT Users - VIA REVOKING ACCESS TOKENS AND REFRESH TOKEN
@bp.route('/logout', methods = ['GET'])
@jwt_required(verify_type=False) #allows both access and refresh tokens
def logout():
    jwt = get_jwt()

    jti = jwt['jti']
    token_type = jwt['type']


    token_block = TokenBlockList(jti = jti)
    token_block.save()

    return jsonify({"message":f"{token_type} token revoked successfully"}),200


#GETS JWT CLAIMS OF A Users WITH SPECIFICED JWT
@bp.route('/whoami', methods = ['GET'])
@jwt_required()
def whoami():
    return jsonify({"message": "message", "user_details": {"first_name": current_user.      first_name,
                                                           "last_name": current_user.last_name,
                                                            'username' :current_user.username,
                                                           "email": current_user.email}}),200

#CAN BE USED TO REGAIN ACCESS WITH REFRESH TOKEN
@bp.route('/refresh', methods = ['GET'])
@jwt_required(refresh=True) #only allows users to access this endpoint if refresh token is provided
def refresh_access():
    identity = get_jwt_identity()

    new_access_token = create_access_token(identity=identity) 

    return jsonify({"access_token":new_access_token}),200

#-------------------------------------Users & Users INFO----------------------------------------#
# GET - A Users (REQUIRED INFO ONLY)
@bp.route('/user_required_info/<int:id>', methods = ['GET'])
@jwt_required()
def get_user_required_info(id):
    user = Users.query.filter_by(id=id).first()

    if user:
        user_required_info = {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'email': user.email}

        return jsonify(user_required_info),200
    else:
        return jsonify({"error": "Users does not exist"}),404

# GET - A PAGE OF USERS(PAGINATED) NEED TO BE AUTHORIZED (LOGGED IN) TO VEIW 
@bp.route('/users_required_info/all',methods = ['GET'])
@jwt_required()
def get_all_users_required_info():
    
    claims = get_jwt()
    if claims.get('is_admin'):
        page = request.args.get('page', default=1, type=int)
        per_page =  request.args.get('per_page', default=20, type=int)

        users = Users.query.paginate(
            page=page,
            per_page=per_page
        )

        result = UserSchema().dump(users, many=True)

        return jsonify({
            "users": result
        }), 200
    return jsonify({"message":"You are not authorized to access this"}), 401


#GET - A Users WITH ALL INFO
@bp.route('/users/<int:id>', methods = ['GET'])
@jwt_required()
def get_user():
    users = Users.query.filter_by(id).first()

    if users:
        return jsonify(users),200
    else:
        return jsonify({"error": "Users does not exist"}),404


#GET - ALL USERS WITH ALL INFO
@bp.route('/users/<int:id>/all', methods = ['GET'])
@jwt_required()
def get_all_users():

    claims = get_jwt()
    if claims.get('is_admin'):
        page = request.args.get('page', default=1, type=int)
        per_page =  request.args.get('per_page', default=20, type=int)

        users = Users.query.paginate(
            page=page,
            per_page=per_page
        )

        return jsonify({
            "users": users
        }), 200
    return jsonify({"message":"You are not authorized to access this"}), 401


#-------------------------------------Users HEALTH RECORD---------------------------------------#
# GET - SYMPTOMS
@bp.route('/users/<int:id>/symptoms', methods = ['GET'])
@jwt_required()
def get_symptoms(id):

    # current_user_id = get_jwt_identity()

    # if current_user_id != id:
    #     return jsonify({"message":"Access Denied"}),403
    
    users = Users.query.get(id)
    if not users:
        return jsonify({"error": "Users not found"}), 404

    symptoms_list = []
    for symptom in users.symptoms:
        symptoms_list.append({
            'symptoms_id': symptom.symptoms_id,
            "severity" : symptom.severity,
            "type_of_symptom": symptom.type_of_symptom,
            "weight_lbs" : symptom.weight_lbs,
            'recorded_on': symptom.recorded_on,
            "notes": symptom.notes
        })
    return jsonify(symptoms_list),200

# POST - SYMPTOMS
@bp.route('/users/<int:id>/symptoms', methods = ['POST'])
@jwt_required()
def add_symptoms(id):
    try:
        users = Users.query.get(id)
        if not users:
            return jsonify({"error":"Users not found"}), 404
        
        data = request.get_json()
        symptom = DailySymptoms(
            id = id,
            severity = data.get('severity'),
            type_of_symptom = data.get('type_of_symptom'),
            weight_lbs = data.get('weight_lbs'),
            notes = data.get('notes')
            )
        
        symptom.save()
        return jsonify({"message": "Symptom added successfully"}), 201
    except Exception:
        return jsonify({"error": "Failed to log symptom"}), 500

# GET - FOOD LOGS
@bp.route('/users/<int:id>/food-logs', methods = ['GET'])
@jwt_required()
def get_foodlogs(id):
    users = Users.query.get(id)

    if not users:
        return jsonify({"error": "Users does not exist"}),404

    foodlog_list = []
    for foodlog in users.food_logs:
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
@bp.route('/users/<int:id>/food-logs', methods = ['POST'])
@jwt_required()
def add_foodlog(id):
    try:
        users = Users.query.get(id)

        if not users:
            return jsonify({'error': 'Users does not exist'})
        
        data = request.get_json()
        foodlog = FoodLog(
            id = id,
            breakfast = data.get('breakfast'),
            lunch = data.get('lunch'),
            dinner = data.get('dinner'),
            total_calories = data.get('total_calories'),
            notes = data.get('notes')
        )

        foodlog.save()
        return jsonify({"message": "Food logged successfully!"}),201
    except Exception:
        return jsonify({"error": "Failed to log food"}),500







@bp.get("/users/me")
def users_me():
    return "profile page", 200, {"Content-Type": "text/plain; charset=utf-8"}
    #test to make sure flask set up worked




#add more endpoints later
