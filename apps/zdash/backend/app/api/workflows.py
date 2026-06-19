import subprocess
from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter(prefix="/workflows", tags=["workflows"])
ZAICTL_PATH = "/home/zeazdev/zeaz-platform/scripts/zaictl.sh"

@router.get("/", response_model=Dict[str, List[str]])
def list_workflows():
    try:
        result = subprocess.run([ZAICTL_PATH, "workflow", "list"], capture_output=True, text=True, check=True)
        workflows = [line.strip() for line in result.stdout.split("\n") if line.strip()]
        return {"workflows": workflows}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {e.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{name}", response_model=Dict[str, str])
def show_workflow(name: str):
    try:
        result = subprocess.run([ZAICTL_PATH, "workflow", "show", name], capture_output=True, text=True)
        if "not found" in result.stdout or result.returncode != 0:
            raise HTTPException(status_code=404, detail=f"Workflow '{name}' not found")
        return {"name": name, "content": result.stdout}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{name}/run")
def run_workflow(name: str):
    try:
        result = subprocess.run([ZAICTL_PATH, "workflow", "run", name], capture_output=True, text=True)
        if "not found" in result.stdout or result.returncode != 0:
            raise HTTPException(status_code=404, detail=f"Workflow '{name}' not found")
        return {"status": "success", "message": f"Workflow {name} started", "output": result.stdout}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
