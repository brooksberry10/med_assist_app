from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import Users, Labs
from ..forms import LabsForm, ValidationError

labs_bp = Blueprint('labs', __name__, url_prefix='/api/user/<int:id>')

def verify_user_access(user_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)
    
    if not user:
        return None, (jsonify({"error": "User does not exist"}), 404)
    
    if current_user_id != user.id:
        return None, (jsonify({"message": "Access Denied"}), 403)
    
    return user, None


@labs_bp.route('/labs/<int:lab_id>', methods=['GET'])
@jwt_required()
def get_lab(id, lab_id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    lab = Labs.query.filter_by(id=id, lab_id=lab_id).first()

    if not lab:
        return jsonify({"error": "Lab entry not found"}), 404
    
    return jsonify({'lab': lab.to_dict()}), 200


@labs_bp.route('/labs', methods=['GET'])
@jwt_required()
def get_labs_all(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=20, type=int)
    
    all_labs = Labs.query.filter_by(id=id)

    labs = all_labs.paginate(
        page=page,
        per_page=per_page
    )

    result = LabsForm().dump(labs.items, many=True)

    return jsonify({
        "labs": result,
        "total_num_of_labs": labs.total,
        "total_pages": labs.pages,
        "current_page": labs.page,
    }), 200


@labs_bp.route('/labs', methods=['POST'])
@jwt_required()
def add_lab(id):
    try:
        user, error = verify_user_access(id)
        if error:
            return error
    
        schema = LabsForm()

        try:
            validate = schema.load(request.get_json())
        except ValidationError as error:
            return jsonify({"error": error.messages}), 400

        lab = Labs(
            id=id,
            systolic_pressure=validate.get('systolic_pressure'),
            diastolic_pressure=validate.get('diastolic_pressure'),
            rbc_count=validate.get('rbc_count')
        )
        
        lab.save()
        return jsonify({"message": "Lab entry added successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": "Failed to log lab entry"}), 500
