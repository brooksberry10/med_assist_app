import os

class Config:
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = ENV == 'development'

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://ma_user:ma_user@localhost:5433/med_assist_db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
