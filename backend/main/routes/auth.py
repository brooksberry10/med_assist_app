from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt, 
    get_jwt_identity
)

from ..models import Users, TokenBlockList, UserInfo
from ..forms import RegistrationForm, LoginFormEmail, LoginFormUsername, UserInfoForm, ValidationError
from .. import db


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    user_schema = RegistrationForm()

    try:
        user_validate = user_schema.load(json_data)
    except ValidationError as error:
        error_messages = []
        for field, messages in error.messages.items():
            if isinstance(messages, list):
                error_messages.extend(messages)
            else:
                error_messages.append(str(messages))
        return jsonify({"error": "\n".join(error_messages)}), 400

    try:
        user = Users(
            first_name=user_validate['first_name'],
            last_name=user_validate.get('last_name'),
            username=user_validate['username'],
            email=user_validate['email']
        )
        user.set_password(user_validate['password'])
        db.session.add(user)
        db.session.flush()

        user_info_fields = ['age', 'gender', 'weight_lbs', 'height_ft', 'height_in', 
                           'current_diagnoses', 'medical_history', 'insurance']
        user_info_data = {k: v for k, v in json_data.items() if k in user_info_fields and v is not None}
        
        if user_info_data:
            user_info_schema = UserInfoForm(partial=True)
            try:
                user_info_validate = user_info_schema.load(user_info_data)
                user_info = UserInfo(
                    id=user.id,
                    age=user_info_validate.get('age', 0),
                    gender=user_info_validate.get('gender', 'Other'),
                    weight_lbs=user_info_validate.get('weight_lbs', 0.0),
                    height_ft=user_info_validate.get('height_ft', 0),
                    height_in=user_info_validate.get('height_in', 0),
                    current_diagnoses=user_info_validate.get('current_diagnoses', ''),
                    medical_history=user_info_validate.get('medical_history', ''),
                    insurance=user_info_validate.get('insurance', '')
                )
                db.session.add(user_info)
            except ValidationError:
                pass

        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500


@auth_bp.route('/login-email', methods=['POST'])
def login_email():
    schema = LoginFormEmail()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        error_messages = []
        for field, messages in error.messages.items():
            if isinstance(messages, list):
                error_messages.extend(messages)
            else:
                error_messages.append(str(messages))
        return jsonify({"error": " ".join(error_messages)}), 400

    user = Users.query.filter_by(email=validate['email']).first()

    if user and user.check_password(password=validate['password']):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            "message": "Login Successful",
            "tokens": {
                "access": access_token,
                "refresh": refresh_token
            }
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401


@auth_bp.route('/login-username', methods=['POST'])
def login_username():
    schema = LoginFormUsername()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        error_messages = []
        for field, messages in error.messages.items():
            if isinstance(messages, list):
                error_messages.extend(messages)
            else:
                error_messages.append(str(messages))
        return jsonify({"error": " ".join(error_messages)}), 400

    user = Users.query.filter_by(username=validate['username']).first()

    if user and user.check_password(password=validate['password']):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            "message": "Login Successful",
            "tokens": {
                "access": access_token,
                "refresh": refresh_token
            }
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401


@auth_bp.route('/logout', methods=['GET'])
@jwt_required(verify_type=False)  # allows both access and refresh tokens
def logout():
    jwt = get_jwt()
    jti = jwt['jti']
    token_type = jwt['type']

    token_block = TokenBlockList(jti=jti)
    token_block.save()

    return jsonify({"message": f"{token_type} token revoked successfully"}), 200


@auth_bp.route('/refresh', methods=['GET'])
@jwt_required(refresh=True)  # only allows refresh tokens
def refresh_access():
    identity = get_jwt_identity()
    current_user_id = int(identity)
    
    user = Users.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User does not exist"}), 404

    new_access_token = create_access_token(identity=identity)
    return jsonify({"access_token": new_access_token}), 200

