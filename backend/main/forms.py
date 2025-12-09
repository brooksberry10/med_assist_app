from marshmallow import (fields, Schema, validates, 
                         validates_schema, ValidationError, validate)
from .models import Users



#NAME
min_name_length = 1
max_name_length = 30

#USER NAME
min_username_length = 1
max_username_length = 50

#EMAIL
min_email_length = 5
max_email_length = 150

#PASSWORD
min_password_length = 8
max_password_length = 64


#Form for registration
class RegistrationForm(Schema):

    first_name = fields.String(data_key='first_name',required=True, validate=[validate.Length(min =min_name_length, max=max_name_length,error=f"First name must be between {min_name_length} and {max_name_length} characters")])
    last_name = fields.String(data_key='last_name', validate=[validate.Length(max=max_name_length, error=f'Last name must be less than {max_name_length}')])

    username = fields.String(data_key='username', required=True, validate=[validate.Length(min=min_username_length, max=max_username_length, error= f"Username must be between {min_username_length} and {max_username_length} characters")])

    email = fields.Email(data_key='email',required=True,validate=[validate.Length(min=min_email_length,max=max_email_length, error= f'Email must be between {min_email_length} and {max_email_length} characters')])

    password = fields.String(required=True, validate=[validate.Length(min=min_password_length,max=max_password_length, error = f"Password must be between {min_password_length} and {max_password_length} characters")], load_only=True)
    confirm_password = fields.String(required=True, validate=[validate.Length(min=min_password_length,max=max_password_length, error = f"Password must be between {min_password_length} and {max_password_length} characters")], load_only=True)

    @validates('email')
    def validate_email(self, data, **kwargs):
        user = Users.query.filter_by(email = data).first()
        
        if user:
            raise ValidationError("Email already exists")
        
    @validates('username')
    def validate_username(self, data, **kwargs):
        user = Users.query.filter_by(username = data).first()
        
        if user:
            raise ValidationError('Username already exists')
        
    @validates_schema
    def validate_password(self,data,**kwargs):
        if data['password'] != data['confirm_password']:
            raise ValidationError("Passwords do not match", field_name= 'confirm_password')
        

#login form 
class LoginFormEmail(Schema):
    email = fields.Email(data_key='email',required=True,validate=[validate.Length(min = min_email_length,max=max_email_length,error= f'Email must be between {min_email_length} and {max_email_length} characters')])
    password = fields.String(required=True, validate=[validate.Length(min=min_password_length, max=max_password_length, error = f"Password must be between {min_password_length} and {max_password_length} characters")], load_only=True)


class LoginFormUsername(Schema):
    username = fields.String(data_key='username', required=True, validate=[validate.Length(min=min_username_length, max=max_username_length, error= f"Username must be between {min_username_length} and {max_username_length} characters")])
    password = fields.String(required=True, validate=[validate.Length(min=min_password_length, max=max_password_length, error = f"Password must be between {min_password_length} and {max_password_length} characters")], load_only=True)


#form template to get a user
class UserSchema(Schema):
    id = fields.Integer(data_key='id')

    first_name = fields.String(data_key='first_name',required=True, validate=[validate.Length(min = min_name_length, max=max_name_length,error=f"First name must be between {min_name_length} and {max_name_length} characters")])
    last_name = fields.String(data_key='last_name', validate=[validate.Length(max=max_name_length, error=f'Last name must be less than {max_name_length} characters')])

    username = fields.String(data_key='username', required=True, validate=[validate.Length(min=min_username_length, max=max_username_length, error= f"Username must be between {min_username_length} and {max_username_length} characters")])

    email = fields.Email(data_key='email',required=True,validate=[validate.Length(min=min_email_length,max=max_email_length,error= f'Email must be between {min_email_length} and {max_email_length} characters')])


class UserInfoForm(Schema):
    #AGE
    min_age_range = 0
    max_age_range = 300

    #GENDER
    max_gender_length = 10

    #WEIGHT
    max_weight_range = 2000.0

    #HEIGHT FEET
    max_height_feet_range = 20

    #HEIGHT INCHES
    max_height_inch_range = 11

    user_info_id = fields.Integer(data_key= 'user_info_id')

    age = fields.Integer(data_key='age',validate=[validate.Range(min_age_range, max_age_range, error=f'Age must be between {min_age_range} and {max_age_range}')])

    gender = fields.String(data_key='gender',validate= validate.Length(max=max_age_range,error = f"Gender must be less than {max_gender_length}"))

    weight_lbs = fields.Float(data_key='weight_lbs',validate=validate.Range(min=0.0,max=max_weight_range, error=f'Weight must be between 0.0lb and {max_weight_range}lb'))

    height_ft = fields.Integer(data_key='height_ft', validate=validate.Range(min=0, max=max_height_feet_range, error=f'Height must be between 0ft and {max_height_feet_range}ft'))
    height_in = fields.Integer(data_key='height_in', validate=validate.Range(min = 0, max=max_height_inch_range, error=f'Height must be between 0in and {max_height_inch_range}in'))

    current_diagnoses = fields.String(data_key='current_diagnoses')
    medical_history = fields.String(data_key='medical_history')
    insurance = fields.String(data_key='insurance')


class DailySymptomsForm(Schema):

    #SEVERITY
    max_severity_range = 10

    #TYPE OF SYMPTOM
    max_type_length = 100

    #WEIGHT
    max_weight_range = 1400.0


    symptoms_id = fields.Integer(data_key='symptoms_id')

    severity = fields.Integer(data_key='severity',validate=validate.Range(min=0,max=max_severity_range, error=f'Severity must be between 0 and {max_severity_range}'))

    type_of_symptom = fields.String(data_key='type_of_symptom', validate=validate.Length(max=max_type_length, error=f'Type of Symptom must be less than {max_type_length} characters'))

    weight_lbs = fields.Float(data_key='weight_lbs',validate=validate.Range(min=0.0,max=max_weight_range, error=f'Weight must be between 0.0lb and {max_weight_range}lb'))

    recorded_on = fields.DateTime(data_key='recorded_on', format='%b %d, %Y')

    notes = fields.String(data_key='notes')


class TreatmentsForm(Schema):

    #TREATMENT NAME
    max_length_treatment = 100

    treatment_id = fields.Integer(data_key='treatment_id')
    treatment_name = fields.String(data_key='treatment_name', validate=validate.Length(max = max_length_treatment))

    scheduled_on = fields.DateTime(data_key='scheduled_on',format='%b %d, %Y')

    notes = fields.String(data_key='notes')

    is_completed = fields.Boolean(data_key='is_completed')

class FoodLogForm(Schema):
    foodlog_id = fields.Integer(data_key='foodlog_id')
    notes = fields.String(data_key='notes')
    breakfast = fields.String(data_key='breakfast')
    lunch = fields.String(data_key='lunch')
    dinner = fields.String(data_key='dinner')
    total_calories = fields.Float(data_key='total_calories', validate=validate.Range(min = 0))
    recorded_on = fields.DateTime(data_key='recorded_on', format='%b %d, %Y')


class LabsForm(Schema):
    max_systolic_range = 500
    max_diastolic_range = 300

    lab_id = fields.Integer(data_key='lab_id')

    systolic_pressure = fields.Integer(data_key='systolic_pressure', validate=validate.Range(min = 0, max=max_systolic_range, error=f'Systolic pressure must be between 0 and {max_systolic_range}'))
    diastolic_pressure = fields.Integer(data_key='diastolic_pressure', validate=validate.Range(min = 0, max=max_diastolic_range, error=f'Diastolic pressure must be between 0 and {max_diastolic_range}'))

    rbc_count = fields.Float(data_key='rbc_count')



