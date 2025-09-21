from flask import Blueprint

#api will be the base path for backend to prevent frontend collisions
bp = Blueprint('api', __name__, url_prefix='/api')





@bp.get("/users/me")
def users_me():
    return "profile page", 200, {"Content-Type": "text/plain; charset=utf-8"}
    #test to make sure flask set up worked




#add more endpoints later
