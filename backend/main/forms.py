from marshmallow import fields, Schema, validates, validates_schema, ValidationError, validate

from .models import User

class RegistrationForm(Schema):

    first_name = fields.String(data_key='first_name',required=True, validate=[validate.Length(min =1, max=30,error="Name must be between 1 and 30 characters")])
    last_name = fields.String(data_key='last_name', validate=[validate.Length(max=30)])
    email = fields.Email(data_key='email',required=True,validate=[validate.Length(max=150),validate.Email(error="Invalid email")])
    password = fields.String(required=True, validate=[validate.Length(min=8,max=64, error = "Password must be between 8 and 64 characters")])
    confirm_password = fields.String(required=True, validate=[validate.Length(min=8,max=64, error = "Password must be between 8 and 64 characters")])

    @validates('email')
    def validate_email(self, data, **kwargs):
        user = User.query.filter_by(email = data).first()
        
        if user:
            raise ValidationError("Email already exist")
        
    @validates_schema
    def validate_password(self,data,**kwargs):
        if data['password'] != data['confirm_password']:
            raise ValidationError("Passwords do not match", field_name= 'confirm_password')
        
        
class LoginForm(Schema):
    email = fields.Email(data_key='email',required=True,validate=[validate.Length(max=150),validate.Email(error="Invalid email")])
    password = fields.String(required=True, validate=[validate.Length(min=8, max=64, error = "Password must be between 8 and 64 characters")])


class UserSchema(Schema):
    id = fields.Int(data_key='id')
    first_name = fields.String(data_key='first_name',required=True, validate=[validate.Length(min =1, max=30)])
    last_name = fields.String(data_key='last_name', validate=[validate.Length(max=30)])
    email = fields.Email(data_key='email',required=True,validate=[validate.Length(max=150),validate.Email(error="Invalid email")])

    