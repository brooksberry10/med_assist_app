from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, EmailField, BooleanField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from .models import User

class RegistrationForm(FlaskForm):
    first_name = StringField('First Name', validators=[DataRequired(), Length(min=1, max=30)])
    last_name =  StringField('Last Name', validators=[Length(max=30)])
    email = EmailField('Email', validators=[DataRequired(),Email(), Length(max=150)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max= 64)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), Length(min=8,max=64), EqualTo('password')])

    def validate_email(self, email):
        user = User.query.filter_by(email = email.data).first()

        if user:
            raise ValidationError("Email already exist!")
    

class LoginForm(FlaskForm):
    email = EmailField('Email', validators=[DataRequired(),Email(), Length(max=150)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max= 64)])
    remember_me = BooleanField('Remember Me')