# Onboarding Set Up
## System Prerequisites
1. Download Python 3.12
2. Download Node.js 20
3. Download Docker Desktop

## Dependencies
1. Clone the repo from github

2. Open Powershell and go to project root

3. Start virtual environment
    ```bash
    python -m venv .venv 
    .\.venv\Scripts\activate 

4. Download the project requirements
    ```bash
    pip install -r requirements.txt 

## Set up Docker

### Download Docker Desktop
1. Download Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/

2. Turn on the engine
    ```bash
    Start-Process "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
- Or go into the app and turn it on
    
3. Verify engine is connected
    ```bash
    docker info

4. Onboard to app database
    ```bash
    docker pull postgres:16      
- first-time only (needs internet once, then can local dev after)
    
5. Test connecting the db
    ```bash
    docker compose up -d
    docker compose ps
    docker compose logs -f db

### Apply Database Migrations
We use Flask-Migrate to handle schema changes.  

After starting the Postgres container, always run:
```bash
flask db upgrade
```


## Set up Flask
### Create .env file
1. add .env file in local project directory (unique to each developer, ignored remotely)
2. Add this code to your env file
    ```env
    FLASK_APP=backend.main
    FLASK_RUN_PORT=5001
    DATABASE_URL=postgresql+psycopg2://ma_user:ma_user@localhost:5433/med_assist_db

### Test flask and API route 
3. Test flask
    ```bash
    flask run
- should see: * Running on http://127.0.0.1:5001

4. Visit backend API
    ``` bash
    curl.exe http://127.0.0.1:5001
- Or visit http://127.0.0.1:5001
- a test route to try: http://127.0.0.1:5001/api/users/me


## Set up React App (Vite)
1. open a second terminal and navigate to frontend directory
2. install dependencies
    ```bash
    cd frontend
    npm install

3. Test starting the react app
    ```bash
    npm run dev
- opens on http://localhost:3000
- Vite provides fast hot module replacement (HMR)
- proxy configuration is in frontend/vite.config.ts

4. Build for production
    ```bash
    npm run build
    ```

5. Preview production build
    ```bash
    npm run preview
    ```
---



# Workflow

- recommend 2-3 terminals: 1 for flask, 1 for react, and 1 for commands/cl testing

### Beginning of dev session
- If dependencies added, reinstall requirements
    ```bash
    pip install -r requirements.txt

- go to rootproject directory and activate virtual environment
    ```bash
    .\.venv\Scripts\activate 

- run docker desktop engine from the app or use the following command
    ```bash
    Start-Process "$Env:ProgramFiles\Docker\Docker\Docker Desktop.exe"

- Connect to the db from root directory
    ```bash
    docker compose up -d
    docker info

- Apply any new migrations (required if added models)
    ```bash
    flask db upgrade

- run flask from root directory
    ```bash
    flask run

- run react from frontend directory
    ```bash
    cd frontend
    npm run dev

### Making Model Changes
If you add or edit models in `backend/models.py`, you must generate a new migration so teammates can update their database.

1. Generate a migration:
    ```bash
    flask db migrate -m "describe your change"
    ```

2. Apply it locally:
    ```bash
    flask db upgrade
    ```

3. Commit the new file inside the `migrations/versions/` folder.  
4. Push your changes so teammates can run `flask db upgrade` after pulling.


### For testing and changes
 - Restart docker connection only for changes to the docker-compose.yml. turn off when using git
 - Disconnect docker at end of session
    ```bash
    docker compose down

- Restart flask when changing python code, installing packages, or changing env. turn off when using git

- React auto-reloads on file saves with Vite's fast HMR. Only need to restart with changes to frontend/vite.config.ts proxy or envs, or when making package changes. turn off when using git

- backend package additions should be added to requirements.txt (backend) or frontend/package.json (frontend) for teamates to install.
    ```bash
    pip install -r requirements.txt

    ```bash
    cd frontend
    npm ci  #or npm install
