from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import Users, UserInfo
from ..forms import UserInfoForm
from .. import db


users_bp = Blueprint('users', __name__, url_prefix='/api')


def verify_user_access(user_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)
    
    if not user:
        return None, (jsonify({"error": "User does not exist"}), 404)
    
    if current_user_id != user.id:
        return None, (jsonify({"error": "Access Denied"}), 403)
    
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


@users_bp.route('/user-info/<int:id>', methods=['PATCH'])
@jwt_required()
def update_user_info(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    json_data = request.get_json() or {}
    form = UserInfoForm(partial=True)
    
    try:
        validated_data = form.load(json_data)
    except Exception as e:
        if hasattr(e, 'messages'):
            error_messages = []
            for field, messages in e.messages.items():
                if isinstance(messages, list):
                    error_messages.extend(messages)
                else:
                    error_messages.append(str(messages))
            return jsonify({"error": "\n".join(error_messages)}), 400
        return jsonify({"error": str(e)}), 400
    
    try:
        if not user.user_info:
            user_info = UserInfo(id=id)
            db.session.add(user_info)
        else:
            user_info = user.user_info
        
        for field in ['age', 'gender', 'weight_lbs', 'height_ft', 'height_in', 
                      'current_diagnoses', 'medical_history', 'insurance']:
            if field in validated_data:
                setattr(user_info, field, validated_data[field])
        
        db.session.commit()
        return jsonify({
            "message": "User info updated successfully",
            "user_info": user_info.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

