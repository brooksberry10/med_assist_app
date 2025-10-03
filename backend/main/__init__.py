from flask import Flask, jsonify
from .config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Import models so SQLAlchemy/Alembic can see them
    from .models import Users, TokenBlockList

    # Import and register blueprints
    from .routes import auth_bp, users_bp, symptoms_bp, food_logs_bp ,treatments_bp
    app.register_blueprint(treatments_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(symptoms_bp)
    app.register_blueprint(food_logs_bp)

  
   

    # Create tables if they don't exist (dev convenience; migrations are preferred)
    with app.app_context():
        db.create_all()

    # ----------------------------------------- JWT HANDLERS ---------------------------------------- #
    @jwt.user_lookup_loader
    def user_lookup_callback(jwt_header, jwt_data):
        identity = jwt_data['sub']
        return Users.query.filter_by(id=int(identity)).one_or_none()

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            "error": "token_expired",
            "message": "Token has expired"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            "error": "invalid_token",
            "message": "Signature verification failed"
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            "error": "authorization_required",
            "message": "Request does not contain a valid token"
        }), 401

    # CHECKS IF JWT IS REVOKED (assist with logging out)
    @jwt.token_in_blocklist_loader
    def token_in_blocklist_callback(jwt_header, jwt_data):
        jti = jwt_data['jti']
        token = db.session.query(TokenBlockList).filter(TokenBlockList.jti == jti).scalar()
        return token is not None  # True => revoked

    # ----------------------------------------------------------------------------------------------- #

    @app.get("/")
    def root():
        return (
            "Med Assist backend is running. Run React app via npm start, or append url with /api/<insert_route> to view backend API endpoints.",
            200,
            {"Content-Type": "text/plain; charset=utf-8"}
        )

    return app

app = create_app()
# expose app so 'flask --app backend.main run' works
# 'flask run' will be enabled thru .env file
