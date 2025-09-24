from flask import Flask
from .config import Config
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)

    from .routes import bp as api_bp

    app.register_blueprint(api_bp)

    with app.app_context():
        db.drop_all() #temporary
        db.create_all()

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