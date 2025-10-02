from flask import Flask
from .config import Config
from .routes import bp as api_bp
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .models import * 

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)


    app.register_blueprint(api_bp)
 

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
#'flask run' will be enabled thru .env file