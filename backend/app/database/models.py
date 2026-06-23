from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Text

from app.database.database import Base


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(
        String,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    routes_json = Column(
        Text,
        nullable=False
    )


class EndpointConfig(Base):
    __tablename__ = "endpoint_configs"

    project_id = Column(
        String,
        primary_key=True,
        index=True
    )

    config_json = Column(
        Text,
        nullable=False
    )


class ResponseOverride(Base):
    __tablename__ = "response_overrides"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        String,
        nullable=False,
        index=True
    )

    route_key = Column(
        String,
        nullable=False
    )

    response_json = Column(
        Text,
        nullable=False
    )


class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    project_id = Column(
        String,
        nullable=False,
        index=True
    )

    log_json = Column(
        Text,
        nullable=False
    )