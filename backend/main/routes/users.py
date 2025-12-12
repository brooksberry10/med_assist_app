from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models import Users, UserInfo, FoodLog, Labs, DailySymptoms, Treatments
from ..forms import UserInfoForm
from .. import db

from io import BytesIO
from reportlab.pdfgen import canvas


users_bp = Blueprint('users', __name__, url_prefix='/api')

def generate_pdf_file(user_data):
    buffer = BytesIO()
    new_canvas = canvas.Canvas(buffer)

    new_canvas.setFont('Helvetica-Bold', 26)
    new_canvas.drawString(100,750, "Medical Data")

    y = 700

    categories = ['food_logs', 'symptoms','treatments']

    if user_data:
        for key, value in user_data.items():
            new_canvas.setFont('Helvetica-Bold', 16)
            new_canvas.drawString(100, y, f"{key.capitalize()}")
            y-=25
            if y < 50:
                new_canvas.showPage()
                y = 700
            if value:
                if key in categories:
                    for list_item in value:
                        y -=5
                        for data_name,data in list_item.items():
                            if 'id' not in data_name:
                                new_canvas.setFont('Helvetica', 14)
                                new_canvas.drawString(100, y, f"{data_name}: {data}")
                                y -=15

                if key not in categories:
                    for data_name, data in value.items():
                        if 'id' not in data_name:
                            new_canvas.setFont('Helvetica', 14)
                            new_canvas.drawString(100, y, f"{data_name}: {data}")
                            y -=15
            y -= 20
   
    
    new_canvas.showPage()
    new_canvas.save()

    buffer.seek(0)
    return buffer


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
        error_msg = str(e)
        if hasattr(e, 'messages'):
            error_msg = str(e.messages)
        return jsonify({"error": f"Validation error: {error_msg}"}), 400
    
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


@users_bp.route('/user/export-data', methods = ['GET'])
@jwt_required()
def export_data():
    user, error = verify_user_access(get_jwt_identity())
    if error:
        return error
    try:
        user_info = UserInfo.query.filter_by(id=user.id).first()
        labs = Labs.query.filter_by(id = user.id).first()
        food_logs = FoodLog.query.filter_by(id = user.id).all()
        symptoms = DailySymptoms.query.filter_by(id =user.id).all()
        treatments = Treatments.query.filter_by(id = user.id).all()

        all_user_data = {
                    'person': {'first_name': user.first_name, 'last_name': user.last_name},
                    'info': user_info.to_dict() if user_info else None,
                    'labs': labs.to_dict() if labs else None,
                    'food_logs': [log.to_dict() for log in food_logs if food_logs],
                    'symptoms': [symptom.to_dict() for symptom in symptoms if symptoms],
                    'treatments': [treatment.to_dict() for treatment in treatments if treatments]
                    }
        
        print(all_user_data)
        pdf_file = generate_pdf_file(all_user_data)

        
        return send_file(pdf_file, as_attachment=False, download_name='Medical Data.pdf'), 200
    except Exception:
        return jsonify({'error': 'Error creating PDF file'}), 400