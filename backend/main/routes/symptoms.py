from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import Users, DailySymptoms
from ..forms import DailySymptomsForm, ValidationError

symptoms_bp = Blueprint('symptoms', __name__, url_prefix='/api/user/<int:id>')

def verify_user_access(user_id):
    current_user_id = int(get_jwt_identity())
    user = Users.query.get(user_id)
    
    if not user:
        return None, (jsonify({"error": "User does not exist"}), 404)
    
    if current_user_id != user.id:
        return None, (jsonify({"message": "Access Denied"}), 403)
    
    return user, None


@symptoms_bp.route('/symptom/<int:symptom_id>', methods=['GET'])
@jwt_required()
def get_symptom(id, symptom_id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    symptom = DailySymptoms.query.filter_by(id=id, symptoms_id=symptom_id).first()

    if not symptom:
        return jsonify({"error": "Symptom not found"}), 404
    
    return jsonify({'symptom': symptom.to_dict()}), 200


@symptoms_bp.route('/my-symptoms', methods=['GET'])
@jwt_required()
def get_symptoms_all(id):
    user, error = verify_user_access(id)
    if error:
        return error
    
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=20, type=int)
    
    all_symptoms = DailySymptoms.query.filter_by(id=id)

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


@symptoms_bp.route('/symptom/add', methods=['POST'])
@jwt_required()
def add_symptoms(id):
    try:
        user, error = verify_user_access(id)
        if error:
            return error
    
        schema = DailySymptomsForm()

        try:
            validate = schema.load(request.get_json())
        except ValidationError as error:
            return jsonify({"error": error.messages}), 400

        symptom = DailySymptoms(
            id=id,
            severity=validate.get('severity'),
            type_of_symptom=validate.get('type_of_symptom'),
            weight_lbs=validate.get('weight_lbs'),
            notes=validate.get('notes')
        )
        
        symptom.save()
        return jsonify({"message": "Symptom added successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": "Failed to log symptom"}), 500

