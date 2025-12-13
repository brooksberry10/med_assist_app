from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.main import db
from ..models import Users, FoodLog
from ..forms import FoodLogForm, ValidationError


food_logs_bp = Blueprint('food_logs', __name__, url_prefix='/api/user/<int:id>')


def verify_user_access(user_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)
    
    if not user:
        return None, (jsonify({"error": "User does not exist"}), 404)
    
    if current_user_id != user.id:
        return None, (jsonify({"error": "Access Denied"}), 403)
    
    return user, None


@food_logs_bp.route('/food-logs/<int:foodlog_id>', methods=['GET'])
@jwt_required()
def get_foodlog(id, foodlog_id):
    user, error = verify_user_access(id)
    if error:
        return error

    foodlog = FoodLog.query.filter_by(id=id, foodlog_id=foodlog_id).first()

    if not foodlog:
        return jsonify({"error": "Foodlog not found"}), 404
    
    return jsonify({'foodlog': foodlog.to_dict()}), 200


@food_logs_bp.route('/food-logs', methods=['GET'])
@jwt_required()
def get_all_foodlogs(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=20, type=int)

    foodlogs = FoodLog.query.filter_by(id=id)

    foodlogs_all = foodlogs.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    result = FoodLogForm().dump(foodlogs_all.items, many=True)

    return jsonify({
        "foodlogs": result,
        "total_num_of_foodlogs": foodlogs_all.total,
        "total_pages": foodlogs_all.pages,
        "current_page": foodlogs_all.page,
    }), 200


@food_logs_bp.route('/food-logs', methods=['POST'])
@jwt_required()
def add_foodlog(id):
    try:
        user, error = verify_user_access(id)
        if error:
            return error
        
        schema = FoodLogForm()
        
        try:
            validate = schema.load(request.get_json())
        except ValidationError as error:
            return jsonify({"error": error.messages}), 400

        
        foodlog = FoodLog(
            id=id,
            breakfast=validate.get('breakfast'),
            lunch=validate.get('lunch'),
            dinner=validate.get('dinner'),
            notes=validate.get('notes'),
            total_calories=validate.get('total_calories', 0.0),
            recorded_on=validate.get('recorded_on'),
        )
        
        foodlog.save()
        return jsonify({"message": "Food log added successfully"}), 201
        
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to add food log"}), 500
    

@food_logs_bp.route('/food-logs/<int:foodlog_id>/edit', methods = ['PATCH'])
@jwt_required()
def edit_foodlog(id, foodlog_id):
    user, error = verify_user_access(id)
    if error:
        return error

    foodlog = FoodLog.query.filter_by(id=id, foodlog_id=foodlog_id).first()
    if foodlog is None:
        return jsonify({'error': 'Foodlog does not exist'}), 404
    
    data = request.get_json() or {}

    schema = FoodLogForm(partial=True)
    try:
        validated = schema.load(data)
    except ValidationError as error:
        return jsonify({"error": error.messages}), 400
    
    try:
        for field in ('breakfast','lunch','dinner','notes','total_calories','recorded_on'):
            if field in validated:
                setattr(foodlog, field, validated[field])

        db.session.commit()
        return jsonify({'message': 'Food Log updated successfully'}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to update food log"}), 500


@food_logs_bp.route('/food-logs/<int:foodlog_id>/delete', methods = ['DELETE'])
@jwt_required()
def delete_foodlog(id, foodlog_id):
    user, error = verify_user_access(id)
    if error:
        return error

    foodlog = FoodLog.query.filter_by(id=id, foodlog_id=foodlog_id).first()
    if foodlog is None:
        return jsonify({'error': 'Food Log does not exist'}), 404
    
    try:
        db.session.delete(foodlog)
        db.session.commit()
        return jsonify({'message':'Food Log deleted successfully'}), 200
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete Food Log'}), 500
    

