from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt, 
    get_jwt_identity
)

from ..models import Users, TokenBlockList
from ..forms import RegistrationForm, LoginFormEmail, LoginFormUsername, ValidationError


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    schema = RegistrationForm()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        return jsonify({"errors": error.messages}), 400

    user = Users(
        first_name=validate['first_name'],
        last_name=validate.get('last_name'),
        username=validate['username'],
        email=validate['email']
    )
    user.set_password(validate['password'])
    user.save()
    
    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route('/login-email', methods=['POST'])
def login_email():
    schema = LoginFormEmail()

    try:
        validate = schema.load(request.get_json())
    except ValidationError as error:
        return jsonify({"error": error.messages}), 400

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
        return jsonify({"error": error.messages}), 400

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

