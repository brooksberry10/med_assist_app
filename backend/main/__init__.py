from flask import Flask
from .config import Config
from .routes import bp as api_bp
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    app.register_blueprint(api_bp)
    return app


app = create_app()
#expose app so 'flask --app backend.main run' works
#'flask run' will be enabled thru .env file