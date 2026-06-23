import json
import uuid

from fastapi import (
    APIRouter,
    File,
    UploadFile,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.database.models import (
    Project,
    EndpointConfig,
    ResponseOverride,
    RequestLog
)

from app.services.spec_validator import validate_openapi_spec
from app.services.spec_parser import extract_routes

from app.services.project_store import projects
from app.services.endpoint_configs import endpoint_configs
from app.services.response_overrides import response_overrides

from app.services.mock_store import (
    mock_projects,
    project_logs
)

from app.services.export_service import (
    export_project
)

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/")
async def create_project(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    content = await file.read()

    try:
        spec_dict = json.loads(
            content.decode("utf-8")
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not valid JSON"
        )

    is_valid, errors = validate_openapi_spec(
        spec_dict
    )

    if not is_valid:
        raise HTTPException(
            status_code=422,
            detail=errors
        )

    routes = extract_routes(spec_dict)

    project_id = str(
        uuid.uuid4()
    )
    print("\nROUTES:")
    print(routes)

    db_routes = []

    for route in routes:

        route_copy = route.copy()

        route_copy.pop(
            "path_regex",
            None
        )

        db_routes.append(
            route_copy
        )

    db_project = Project(
    project_id=project_id,
    filename=file.filename,
    routes_json=json.dumps(
        db_routes
    )
)
    

    db.add(db_project)
    db.commit()

    projects[project_id] = {
        "filename": file.filename,
        "routes": routes
    }

    mock_projects[project_id] = routes

    project_logs[project_id] = []

    response_overrides[project_id] = {}

    return {
        "project_id": project_id,
        "filename": file.filename,
        "routes": routes
    }


@router.get("/{project_id}")
def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):

    db_project = db.query(
        Project
    ).filter(
        Project.project_id == project_id
    ).first()

    if not db_project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return {
        "project_id": db_project.project_id,
        "filename": db_project.filename,
        "routes": json.loads(
            db_project.routes_json
        )
    }


@router.get("/")
def list_projects(
    db: Session = Depends(get_db)
):

    db_projects = db.query(
        Project
    ).all()

    results = []

    for project in db_projects:

        results.append({
            "project_id": project.project_id,
            "filename": project.filename
        })

    return {
        "projects": results
    }
@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db)
):

    project = db.query(
        Project
    ).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.query(
        EndpointConfig
    ).filter(
        EndpointConfig.project_id == project_id
    ).delete()

    db.query(
        ResponseOverride
    ).filter(
        ResponseOverride.project_id == project_id
    ).delete()

    db.query(
        RequestLog
    ).filter(
        RequestLog.project_id == project_id
    ).delete()

    db.delete(project)

    db.commit()

    return {
        "message": "Project deleted successfully",
        "project_id": project_id
    }
@router.put("/{project_id}/config")
def update_endpoint_config(
    project_id: str,
    config: dict,
    db: Session = Depends(get_db)
):

    project = db.query(
        Project
    ).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db_config = db.query(
        EndpointConfig
    ).filter(
        EndpointConfig.project_id == project_id
    ).first()

    if db_config:

        existing = json.loads(
            db_config.config_json
        )

        existing.update(config)

        db_config.config_json = json.dumps(
            existing
        )

    else:

        db_config = EndpointConfig(
            project_id=project_id,
            config_json=json.dumps(config)
        )

        db.add(db_config)

    db.commit()

    return {
        "message": "Configuration saved",
        "config": config
    }
@router.get("/{project_id}/config")
def get_endpoint_config(
    project_id: str,
    db: Session = Depends(get_db)
):

    db_config = db.query(
        EndpointConfig
    ).filter(
        EndpointConfig.project_id == project_id
    ).first()

    if not db_config:

        return {
            "latency_ms": 0,
            "error_rate": 0,
            "status_code": 200
        }

    return json.loads(
        db_config.config_json
    )
@router.put("/{project_id}/response")
def save_response_override(
    project_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):

    path = payload.get("path")

    method = payload.get(
        "method",
        ""
    ).upper()

    response = payload.get(
        "response"
    )

    if not path or response is None:
        raise HTTPException(
            status_code=400,
            detail="path and response required"
        )

    key = f"{method}:{path}"

    existing = db.query(
        ResponseOverride
    ).filter(
        ResponseOverride.project_id == project_id,
        ResponseOverride.route_key == key
    ).first()

    if existing:

        existing.response_json = json.dumps(
            response
        )

    else:

        db.add(
            ResponseOverride(
                project_id=project_id,
                route_key=key,
                response_json=json.dumps(
                    response
                )
            )
        )

    db.commit()

    return {
        "message": "Response override saved",
        "key": key,
        "response": response
    }
@router.get("/{project_id}/response")
def get_response_overrides(
    project_id: str,
    db: Session = Depends(get_db)
):

    overrides = db.query(
        ResponseOverride
    ).filter(
        ResponseOverride.project_id == project_id
    ).all()

    result = {}

    for item in overrides:

        result[item.route_key] = json.loads(
            item.response_json
        )

    return result
@router.get("/{project_id}/logs")
def get_project_logs(
    project_id: str,
    db: Session = Depends(get_db)
):

    project = db.query(
        Project
    ).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    logs = db.query(
        RequestLog
    ).filter(
        RequestLog.project_id == project_id
    ).all()

    return {
        "project_id": project_id,
        "logs": [
            json.loads(log.log_json)
            for log in logs
        ]
    }
@router.get("/{project_id}/export")
def export_project_data(
    project_id: str,
    db: Session = Depends(get_db)
):

    data = export_project(
        project_id,
        db
    )

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return data