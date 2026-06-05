import os
import subprocess
from fastapi import FastAPI, Depends, HTTPException, status, Request, Form, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from src.utils.config import Config
from src.core.sheets import GoogleSheetsAPI
from src.utils.logger import get_logger

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

logger = get_logger(__name__)
app = FastAPI(title="Line Sticker Dashboard")

ALLOWED_HOSTS = ["192.168.74.182", "0.0.0.0", "127.0.0.1", "zsticker.zeaz.dev", "localhost"]

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://" + h for h in ALLOWED_HOSTS] + ["https://" + h for h in ALLOWED_HOSTS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBasic()
config = Config()

templates = Jinja2Templates(directory="src/dashboard_templates")

def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_password = config.dashboard_password
    if credentials.username != "admin" or credentials.password != correct_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/", response_class=HTMLResponse)
def index(request: Request, username: str = Depends(get_current_username)):
    try:
        sheets_api = GoogleSheetsAPI(config)
        pending = sheets_api.get_pending_rows()
        pending_count = len(pending)
    except Exception as e:
        logger.error(f"Failed to get pending rows: {e}")
        pending_count = "Error"

    last_runs = []
    if os.path.exists("logs/app.log"):
        with open("logs/app.log", "r", encoding="utf-8") as f:
            lines = f.readlines()
            last_runs = [line.strip() for line in lines[-10:]]

    return templates.TemplateResponse("index.html", {
        "request": request, 
        "pending_count": pending_count,
        "last_runs": last_runs
    })

@app.post("/trigger")
def trigger_run(username: str = Depends(get_current_username)):
    logger.info("Manual run triggered from dashboard")
    env = os.environ.copy()
    env["PYTHONPATH"] = "."
    subprocess.Popen(["python", "src/cli/run.py"], env=env)
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/logs")
def get_logs(username: str = Depends(get_current_username)):
    log_content = "No logs found."
    if os.path.exists("logs/app.log"):
        with open("logs/app.log", "r", encoding="utf-8") as f:
            log_content = f.read()
    return HTMLResponse(content=f"<pre style='background:#2d2d2d;color:#ccc;padding:15px;'>{log_content}</pre>")

@app.post("/upload-template")
async def upload_template(template_file: UploadFile = File(...), username: str = Depends(get_current_username)):
    if not template_file.filename.endswith(".png"):
        raise HTTPException(status_code=400, detail="Only PNG files are allowed")
        
    os.makedirs("templates", exist_ok=True)
    file_path = os.path.join("templates", template_file.filename)
    
    with open(file_path, "wb") as f:
        f.write(await template_file.read())
        
    logger.info(f"New template uploaded via dashboard: {template_file.filename}")
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
