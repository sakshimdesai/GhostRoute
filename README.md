# GhostRoute

> **Your API, before it exists.**

GhostRoute is a full-stack platform that transforms OpenAPI specifications into live mock APIs instantly.

Upload an OpenAPI specification, generate working endpoints automatically, simulate real-world API behavior with configurable latency and error rates, override responses, and trace requests through an interactive dashboard.

---

## Why GhostRoute?

Frontend, mobile, QA, and integration teams often need APIs before backend development is complete.

Traditional approaches require developers to manually create mock endpoints, maintain static JSON files, or build temporary backend services.

GhostRoute eliminates that overhead by generating a functioning mock server directly from an uploaded OpenAPI specification.

Users can:

* Upload an OpenAPI specification
* Instantly generate mock endpoints
* Simulate production-like API behavior
* Override responses dynamically
* Trace requests through a monitoring dashboard

without writing any backend code.

---

## What Makes It Different?

Most mock API tools rely on predefined routes that must exist when the application starts.

GhostRoute takes a different approach.

Since uploaded API specifications can define completely new routes at runtime, GhostRoute uses a dynamic route resolution architecture that allows endpoints to be generated and served after deployment.

This means:

* No server restart required
* No code generation step
* No manual route registration
* New APIs become available immediately after upload

The platform dynamically resolves incoming requests and serves mock responses based on stored route definitions.

---

## Screenshots

### Upload Page

<img width="1823" height="879" alt="image" src="https://github.com/user-attachments/assets/6ee965fe-fea1-41c3-a3bc-5c472f7e6f0c" />


---

### Dashboard

<img width="1838" height="877" alt="image" src="https://github.com/user-attachments/assets/ab36cddf-f182-41ca-91f0-354141344107" />


---

## Features

### OpenAPI Specification Management

* Upload OpenAPI 3.x specifications
* Validate specifications before processing
* Extract routes automatically

### Dynamic Mock API Generation

* Generate mock endpoints instantly
* Support runtime route creation
* Dynamic route matching
* Path parameter handling

### Mock Configuration

* Configure response latency
* Configure error simulation rate
* Configure custom HTTP status codes

### Response Overrides

* Override generated responses
* Configure route-specific mock payloads
* Test frontend edge cases without backend changes

### Request Tracing

* Capture incoming requests
* Monitor endpoint activity
* View request history through Signal Trace

### Export Support

* Export project configuration
* Preserve route definitions and settings

### Persistence

* SQLite-based project storage
* Configuration persistence across sessions

### Infrastructure

* Dockerized backend
* Dockerized frontend
* Docker Compose support

---

## Architecture

```text
                 ┌────────────────────┐
                 │ OpenAPI Upload     │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Specification      │
                 │ Validation         │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Route Extraction   │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Project Storage    │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Dynamic Route      │
                 │ Resolver           │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Mock Response      │
                 │ Generator          │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Request Logging    │
                 │ & Signal Trace     │
                 └────────────────────┘
```

---

## Technical Challenges Solved

### Dynamic Route Generation

FastAPI typically expects routes to be registered during application startup.

GhostRoute needed to support routes that do not exist until a user uploads a specification.

To solve this problem, a runtime route resolution mechanism was implemented that:

* Intercepts incoming requests
* Matches requests against stored route definitions
* Resolves path parameters dynamically
* Dispatches requests to the mock response engine
* Returns generated or overridden responses

This architecture enables entirely new APIs to become available without restarting the server.

---

### Runtime Response Customization

Generated responses alone are often insufficient for frontend testing.

GhostRoute introduces a response override system that allows developers to replace generated payloads with custom responses for specific routes.

This enables:

* Edge-case testing
* Error-state testing
* Frontend validation workflows
* Demo environments

without modifying backend code.

---

### API Behavior Simulation

Real APIs are rarely instantaneous and error-free.

GhostRoute supports configurable:

* Response latency
* Error rate simulation
* HTTP status code overrides

allowing developers to test application behavior under realistic conditions.

---

## Tech Stack

### Frontend

* React
* Axios
* CSS

### Backend

* FastAPI
* SQLAlchemy
* SQLite

### Infrastructure

* Docker
* Docker Compose

---

## Project Structure

```text
GhostRoute
│
├── backend
│   ├── app
│   │   ├── database
│   │   ├── routers
│   │   ├── services
│   │   └── main.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── services
│   └── package.json
│
└── docker-compose.yml
```

---

## Running Locally

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Docker Setup

Build containers:

```bash
docker compose build
```

Run application:

```bash
docker compose up
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

---

## Key Engineering Takeaway

The most challenging aspect of GhostRoute was supporting API routes that do not exist when the server starts.

Instead of relying on static route registration, the application uses runtime route matching and dynamic request dispatching to resolve requests against user-uploaded API specifications.

This allows entirely new APIs to be generated and served without redeployment or server restarts.

---

## Future Enhancements

* Multi-project workspace
* Team collaboration support
* Authentication simulation
* Response templating
* Environment management
* API analytics dashboard
* Cloud deployment support
* Mock scenario collections

---

## Author

**Sakshi M. Desai**

Built to explore dynamic API generation, runtime routing architectures, full-stack application design, and containerized deployment workflows.
