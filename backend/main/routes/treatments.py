from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.main import db
from backend.main.forms import TreatmentsForm
from backend.main.models.user import Users
from backend.main.models.treatment import Treatments

treatments_bp = Blueprint("treatments", __name__, url_prefix="/api/user/<int:id>")

# Access-control helper copied to match existing pattern in symptoms/food_logs
def verify_user_access(user_id):
    try:
        current_user_id = int(get_jwt_identity())
    except Exception:
        return None, ({"error": "Invalid token"}, 401)

    user = Users.query.get(user_id)
    if not user:
        return None, ({"error": "User does not exist"}, 404)
    if user.id != current_user_id:
        return None, ({"message": "Access Denied"}, 403)
    return user, None


@treatments_bp.get("/treatments/<int:treatment_id>")
@jwt_required()
def get_treatment(id, treatment_id):
    _, err = verify_user_access(id)
    if err:
        return err

    treatment = Treatments.query.filter_by(id=id, treatment_id=treatment_id).first()
    if not treatment:
        return {"error": "Treatment not found"}, 404

    data = TreatmentsForm().dump(treatment)
    return {"treatment": data}, 200


@treatments_bp.get("/treatments")
@jwt_required()
def list_treatments(id):
    _, err = verify_user_access(id)
    if err:
        return err

    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
    except ValueError:
        return {"error": "Invalid pagination params"}, 400

    pagination = (
        Treatments.query.filter_by(id=id)
        .order_by(Treatments.scheduled_on.desc().nullslast())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    items = TreatmentsForm().dump(pagination.items, many=True)

    return {
        "treatments": items,
        "total_num_of_treatments": pagination.total,
        "total_pages": pagination.pages or 0,
        "current_page": pagination.page,
    }, 200


@treatments_bp.post("/treatments")
@jwt_required()
def create_treatment(id):
    _, err = verify_user_access(id)
    if err:
        return err

    json_data = request.get_json() or {}
    form = TreatmentsForm()
    try:
        data = form.load(json_data)  # expects dates like "Oct 12, 2025"
    except Exception as e:
        # Marshmallow ValidationError produces .messages; avoid leaking internals
        msg = getattr(e, "messages", str(e))
        return {"error": msg}, 400

    try:
        treatment = Treatments(
            id=id,
            treatment_name=data.get("treatment_name"),
            scheduled_on=data.get("scheduled_on"),
            notes=data.get("notes"),
            is_completed=data.get("is_completed", False),
        )
        treatment.save()
        return {"message": "Treatment added successfully"}, 201
    except Exception:
        db.session.rollback()
        return {"error": "Failed to add treatment"}, 500


@treatments_bp.patch("/treatments/<int:treatment_id>")
@jwt_required()
def update_treatment(id, treatment_id):
    _, err = verify_user_access(id)
    if err:
        return err

    treatment = Treatments.query.filter_by(id=id, treatment_id=treatment_id).first()
    if not treatment:
        return {"error": "Treatment not found"}, 404

    json_data = request.get_json() or {}
    form = TreatmentsForm(partial=True)
    try:
        data = form.load(json_data)
    except Exception as e:
        msg = getattr(e, "messages", str(e))
        return {"error": msg}, 400

    try:
        for field in ("treatment_name", "scheduled_on", "notes", "is_completed"):
            if field in data:
                setattr(treatment, field, data[field])
        db.session.commit()
        return {"message": "Treatment updated successfully"}, 200
    except Exception:
        db.session.rollback()
        return {"error": "Failed to update treatment"}, 500


@treatments_bp.delete("/treatments/<int:treatment_id>")
@jwt_required()
def delete_treatment(id, treatment_id):
    _, err = verify_user_access(id)
    if err:
        return err

    treatment = Treatments.query.filter_by(id=id, treatment_id=treatment_id).first()
    if not treatment:
        return {"error": "Treatment not found"}, 404

    try:
        db.session.delete(treatment)
        db.session.commit()
        return {"message": "Treatment deleted successfully"}, 200
    except Exception:
        db.session.rollback()
        return {"error": "Failed to delete treatment"}, 500
