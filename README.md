# Set Up

## Clone the repo from github
---
## Open Powershell and go to project root
---
## Start virtual environment from terminal
'''
    Run: python -m venv .venv 
    Run: .\.venv\Scripts\activate 
'''
---
## Downoload requirements
'''bash
    pip install -r requirements.txt 
'''
## Set up Flask
### Create .env file locally in main project directory 
(each dev needs their own. ignored in remote repo)
Add the following code to your env file (can personalize the flask port)
'''env
        FLASK_APP=backend.main
        FLASK_RUN_PORT=5001
        DATABASE_URL=postgresql+psycopg2://ma_user:ma_user@localhost:5433/med_assist_db
'''
### Test if flask can run 
'''
        Run: flask run
        '''
You should see lines like: * Running on http://127.0.0.1:5001

### Test if you can reach API route
''' powershell
        Run: curl.exe http://127.0.0.1:5001/api/users/me
'''
        Or visit http://127.0.0.1:5001/api/users/me 
            
Set up Docker
    Download Docker Desktop 
    Turn on the engine
        Run: Start-Process "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
        OR
        Go into the app and turn it on
    Verify engine is connected
        Run: docker info
    Onboard to app database
        Run: docker pull postgres:16      # first-time only (needs internet once, then can local dev after)
    Test running the db
        Run: docker compose up -d
        Run: docker compose ps
        Run: docker compose logs -f db

