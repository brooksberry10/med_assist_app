from flask import Flask, jsonify    
from .config import Config

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    jwt.init_app(app)
    
    from .models import User, TokenBlockList
    from .routes import bp as api_bp

    app.register_blueprint(api_bp)

    with app.app_context():
        # db.drop_all() #temporary
        db.create_all()

    #LOAD CURRENT USER WITH SPECIFIC JWT
    @jwt.user_lookup_loader
    def user_lookup_callback(jwt_header, jwt_data):

        identity = jwt_data['sub']

        return User.query.filter_by(email = identity).one_or_none()

    #ALLOW CHANGE TO CLAIMS - uses sub. Can give admin privledges and be used for access control
    @jwt.additional_claims_loader
    def make_additional_claims(identity):
        if identity == "daivionbrooks11@gmail.com":
            return({"is_admin": True})
        return ({"is_admin": False})

    #JWT ERROR HANDLERS
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"error" : "token_expired",
                        "message": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error" : "invalid_token",
                        "message": "Signature verification failed"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error" : "authorization_required",
                        "message": "Request does not contain a valid token"}), 401
        
    #CHECKS IF JWT IS REVOKED (assist with logging out)
    @jwt.token_in_blocklist_loader
    def token_in_blocklist_callback(jwt_header, jwt_data):
        jti = jwt_data['jti']

        token = db.session.query(TokenBlockList).filter(TokenBlockList.jti == jti).scalar()

        return token is not None #WILL THROW AN ERROR AND TELL US IF TOKEN IN DB WAS REVOKED

        

    @app.get("/")
    def root():
        return (
            "Med Assist backend is running. Run React app via npm start, or append url with /api/<insert_route> to view backend API endpoints.", 
            200, 
            {"Content-Type": "text/plain; charset=utf-8"}
        )
    
    return app


app = create_app()

#expose app so 'flask --app backend.main run' works
#'flask run' will be enabled thru .env fil