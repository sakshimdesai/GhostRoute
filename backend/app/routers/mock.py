from datetime import datetime
import asyncio
import random
import json

from fastapi import (
    APIRouter,
    HTTPException,
    Depends
)

from fastapi.responses import JSONResponse

from sqlalchemy.orm import Session

from app.database.models import (
    Project,
    EndpointConfig,
    ResponseOverride,
    RequestLog
)
from app.database.dependencies import get_db

from app.services.mock_store import (
    project_logs
)

from app.services.mock_generator import (
    generate_mock_response
)

from app.services.route_matcher import match_route

router = APIRouter(
    prefix="/mock",
    tags=["Mock APIs"]
)


@router.get("/{project_id}")
def get_mock_routes(
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

    routes = json.loads(
        project.routes_json
    )

    return {
        "project_id": project_id,
        "available_routes": routes
    }


async def process_mock_request(
    project_id: str,
    full_path: str,
    method: str,
    db: Session
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

    routes = json.loads(
        project.routes_json
    )

    incoming_path = "/" + full_path

    db_config = db.query(
        EndpointConfig
    ).filter(
        EndpointConfig.project_id == project_id
    ).first()

    if db_config:
        config = json.loads(
            db_config.config_json
        )
    else:
        config = {}

    latency_ms = config.get(
        "latency_ms",
        0
    )

    error_rate = config.get(
        "error_rate",
        0
    )

    status_code = config.get(
        "status_code",
        200
    )

    if latency_ms > 0:
        await asyncio.sleep(
            latency_ms / 1000
        )

    print("\n========== DEBUG ==========")
    print("REQUEST METHOD:", method)
    print("REQUEST PATH:", incoming_path)
    print("LATENCY:", latency_ms)
    print("ERROR RATE:", error_rate)
    print("STATUS CODE:", status_code)
    print("===========================\n")

    matched_route = match_route(
        routes,
        incoming_path,
        method
    )

    if matched_route:

        route = matched_route

        print("MATCH FOUND")

        random_number = random.randint(
            1,
            100
        )

        print(
            "RANDOM NUMBER:",
            random_number
        )

        if random_number <= error_rate:

            print(
                "SIMULATED ERROR TRIGGERED"
            )

            raise HTTPException(
                status_code=500,
                detail="Simulated API failure"
            )

        override_key = (
            f"{method}:{route['path']}"
        )

        override = db.query(
            ResponseOverride
        ).filter(
            ResponseOverride.project_id == project_id,
            ResponseOverride.route_key == override_key
        ).first()

        if override:

            response = json.loads(
                override.response_json
            )

        else:

            schema = route.get(
                "response_schema",
                {}
            )

            response = generate_mock_response(
                schema
            )

        if project_id not in project_logs:
            project_logs[project_id] = []

        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "method": method,
            "path": incoming_path,
            "response": response
        }

        db.add(
            RequestLog(
                project_id=project_id,
                log_json=json.dumps(
                    log_entry
                )
            )
        )

        db.commit()

        return JSONResponse(
            status_code=status_code,
            content=response
        )

    print("NO MATCH FOUND")

    raise HTTPException(
        status_code=404,
        detail="Route not found"
    )


@router.get("/{project_id}/{full_path:path}")
async def mock_get(
    project_id: str,
    full_path: str,
    db: Session = Depends(get_db)
):
    return await process_mock_request(
        project_id,
        full_path,
        "GET",
        db
    )


@router.post("/{project_id}/{full_path:path}")
async def mock_post(
    project_id: str,
    full_path: str,
    db: Session = Depends(get_db)
):
    return await process_mock_request(
        project_id,
        full_path,
        "POST",
        db
    )


@router.put("/{project_id}/{full_path:path}")
async def mock_put(
    project_id: str,
    full_path: str,
    db: Session = Depends(get_db)
):
    return await process_mock_request(
        project_id,
        full_path,
        "PUT",
        db
    )


@router.patch("/{project_id}/{full_path:path}")
async def mock_patch(
    project_id: str,
    full_path: str,
    db: Session = Depends(get_db)
):
    return await process_mock_request(
        project_id,
        full_path,
        "PATCH",
        db
    )


@router.delete("/{project_id}/{full_path:path}")
async def mock_delete(
    project_id: str,
    full_path: str,
    db: Session = Depends(get_db)
):
    return await process_mock_request(
        project_id,
        full_path,
        "DELETE",
        db
    )