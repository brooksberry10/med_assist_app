# Set Up

## Prerequisites
1. Clone the repo from github

2. Open Powershell and go to project root

3. Powershell: Start virtual environment
    '''bash
    python -m venv .venv 
    .\.venv\Scripts\activate 

4. Run: pip install -r requirements.txt 


## Set up Flask
### Create .env file
1. add .env file in local project directory (unique to each developer, ignored remotely)
2. Add this code to your env file (can personalize flask port)
- FLASK_APP=backend.main
- FLASK_RUN_PORT=5001
- DATABASE_URL=postgresql+psycopg2://ma_user:ma_user@localhost:5433/med_assist_db

### Test flask and API route 
3. Test flask
    '''bash
    flask run
should see: * Running on http://127.0.0.1:5001

4. Test api
    ''' bash
    Run: curl.exe http://127.0.0.1:5001/api/users/me
Or visit http://127.0.0.1:5001/api/users/me 


## Set up Docker

### Download Docker Desktop
1. Download Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/

2. Turn on the engine
    '''bash
    Start-Process "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
Or go into the app and turn it on
    
3. Verify engine is connected
    '''bash
    docker info

4. Onboard to app database
    '''bash
    docker pull postgres:16      
first-time only (needs internet once, then can local dev after)
    
5. Test running the db
    '''bash
    docker compose up -d
    docker compose ps
    docker compose logs -f db

---