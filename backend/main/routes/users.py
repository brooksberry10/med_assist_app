from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity


from ..models import Users, UserInfo, Labs, FoodLog, DailySymptoms,Treatments


users_bp = Blueprint('users', __name__, url_prefix='/api')


def verify_user_access(user_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)
    
    if not user:
        return None, (jsonify({"error": "User does not exist"}), 404)
    
    if current_user_id != user.id:
        return None, (jsonify({"message": "Access Denied"}), 403)
    
    return user, None


@users_bp.route('/users/me', methods=['GET'])
@jwt_required()
def users_me():
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200


@users_bp.route('/user-required-info/<int:id>', methods=['GET'])
@jwt_required()
def get_user_required_info(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    return jsonify({'user': user.to_dict()}), 200


@users_bp.route('/user-info/<int:id>', methods=['GET'])
@jwt_required()
def get_user_info(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    return jsonify({
        'user_info': user.user_info.to_dict() if user.user_info else None
    }), 200

