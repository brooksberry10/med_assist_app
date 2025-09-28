from flask import Blueprint, request, jsonify
from .models import Users, DailySymptoms, FoodLog, Labs, TokenBlockList, UserInfo, Treatments
from .forms import (RegistrationForm, LoginFormEmail,LoginFormUsername, ValidationError, UserSchema
                    ,DailySymptomsForm, FoodLogForm, LabsForm, UserInfoForm)
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt, current_user,
                                get_jwt_identity)


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

    users = Users(first_name = validate['first_name'], last_name = validate.get('last_name'), username = validate['username'], email = validate['email'])
    users.set_password(validate['password'])
    users.save()
    return jsonify({"message": "Users created successfulyy"}), 201



#LOGIN Users with EMAIL
@bp.route('/auth/login-email', methods = ['POST'])
def login_email():

    schema = LoginFormEmail()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        jsonify({"error": error.messages}), 400

    users = Users.query.filter_by(email = validate['email']).first()

    if users and users.check_password(password = validate['password']):
        access_token = create_access_token(identity=str(users.id))
        refresh_token = create_refresh_token(identity=str(users.id))

        return jsonify({"message": "Login Successful",
                        "tokens": {
                            "access": access_token,
                            "refresh": refresh_token
                            }
                            
                        }),200
    
    return jsonify({"error":"Invalid email or password"}),401

#Login user with USERNAME
@bp.route('/auth/login-username', methods = ['POST'])
def login_username():
    
    schema = LoginFormUsername()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        jsonify({"error": error.messages}), 400

    users = Users.query.filter_by(username = validate['username']).first()

    if users and users.check_password(password = validate['password']):
        access_token = create_access_token(identity=str(users.id))
        refresh_token = create_refresh_token(identity=str(users.id))

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


#CAN BE USED TO REGAIN ACCESS WITH REFRESH TOKEN
@bp.route('/refresh', methods = ['GET'])
@jwt_required(refresh=True) #only allows users to access this endpoint if refresh token is provided
def refresh_access():
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403
    
    identity = get_jwt_identity()

    new_access_token = create_access_token(identity=identity) 

    return jsonify({"access_token":new_access_token}),200


#-------------------------------------Users & Users INFO----------------------------------------#
# GET - A User (REQUIRED INFO ONLY)
@bp.route('/user-required-info/<int:id>', methods = ['GET'])
@jwt_required()
def get_user_required_info(id):

    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403

    return jsonify({'user':user.to_dict()}),200
    
        
   
   
#GET - A User REGULAR INFO
@bp.route('/user-info/<int:id>', methods = ['GET'])
@jwt_required()
def get_user_info(id):

        current_user_id = int(get_jwt_identity())
        user = Users.query.get(id)
        if not user:
            return jsonify({"error": "Users does not exist"}),404

        if current_user_id != user.id:
            return jsonify({"message":"Access Denied"}),403
            
        return jsonify({
            'user_info':user.user_info.to_dict() if user.user_info else None}), 200
  


#-------------------------------------SYMPTOMS---------------------------------------#

# GET - A CERTAIN SYMPTOM
@bp.route('/user/<int:id>/symptom/<int:symptom_id>', methods = ['GET'])
@jwt_required()
def get_symptom(id, symptom_id):

    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403
    
    symptom = DailySymptoms.query.filter_by(id = id, symptoms_id = symptom_id).first()

    if not symptom:
        return jsonify({"error": "Symptom not found"}), 404
    
    return jsonify({
        'symptom': symptom.to_dict()
    }),200
   
# GET - ALL SYMPTOMS OF FOR A USER
@bp.route('/user/<int:id>/my-symptoms')
@jwt_required()
def get_symptoms_all(id):

    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403
    
    page = request.args.get('page', default=1, type=int)
    per_page =  request.args.get('per_page', default=20, type=int)
    
    all_symptoms = DailySymptoms.query.filter_by(id = id)

    symptoms = all_symptoms.paginate(
        page=page,
        per_page=per_page
    )

    result = DailySymptomsForm().dump(symptoms, many=True)

    return jsonify({
        "symptoms": result,
        "total_num_of_symptoms": symptoms.total,
        "total_pages": symptoms.pages,
        "current_page": symptoms.page,
    }), 200


# POST - SYMPTOMS
@bp.route('/user/<int:id>/symptom/add', methods = ['POST'])
@jwt_required()
def add_symptoms(id):

    try:
        current_user_id = int(get_jwt_identity())
        user = Users.query.get(id)
        if not user:
            return jsonify({"error": "Users does not exist"}),404

        if current_user_id != user.id:
            return jsonify({"message":"Access Denied"}),403
    
        schema = DailySymptomsForm()

        try:
            validate = schema.load(request.get_json())
        except ValidationError as error:
            return jsonify({"error": error.messages}), 400

        symptom = DailySymptoms(
            id = id,
            severity = validate.get('severity'),
            type_of_symptom = validate.get('type_of_symptom'),
            weight_lbs = validate.get('weight_lbs'),
            notes = validate.get('notes')
            )
        
        symptom.save()
        return jsonify({"message": "Symptom added successfully"}), 201
    except Exception:
        return jsonify({"error": "Failed to log symptom"}), 500
    
#------------------------------------FOOD LOGS----------------------------------------#
# GET - A FOOD LOGS
@bp.route('/user/<int:id>/food-logs/<int:foodlog_id>', methods = ['GET'])
@jwt_required()
def get_foodlogs(id, foodlog_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403

    foodlog = FoodLog.query.filter_by(id = id, foodlog_id = foodlog_id).first()

    if not foodlog:
        return jsonify({"error": "Foodlog not found"}), 404
    
    return jsonify({
        'foodlog': foodlog.to_dict()
    }),200
    
    
    
# GET - ALL FOOD LOGS OF A USER
@bp.route('/user/<int:id>/food-logs', methods = ['POST'])
@jwt_required()
def add_foodlog(id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(id)
    if not user:
        return jsonify({"error": "Users does not exist"}),404

    if current_user_id != user.id:
        return jsonify({"message":"Access Denied"}),403
    
    page = request.args.get('page', default=1, type=int)
    per_page =  request.args.get('per_page', default=20, type=int)

    foodlogs = FoodLog.query.filter_by(id = id)

    foodlogs_all = foodlogs.paginate(
        page = page,
        per_page=per_page,
    )

    result = FoodLogForm.dump(foodlogs_all, many=True)

    return jsonify({
        "foodlogs": result,
        "total_num_of_foodlogs": foodlogs_all.total,
        "total_pages": foodlogs_all.pages,
        "current_page": foodlogs_all.page,
    }), 200




@bp.get("/users/me")
def users_me():
    return "profile page", 200, {"Content-Type": "text/plain; charset=utf-8"}
    #test to make sure flask set up worked




#add more endpoints later
