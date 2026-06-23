from sqlalchemy.orm import Session

from app.database.models import Project


def export_project(
    project_id: str,
    db: Session
):

    project = db.query(
        Project
    ).filter(
        Project.project_id == project_id
    ).first()

    if not project:
        return None

    return {
        "project_id": project.project_id,
        "filename": project.filename,
        "routes": project.routes_json
    }