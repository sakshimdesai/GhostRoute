import { useEffect, useState } from "react";
import {
  getProject,
  getLogs,
  getConfig,
  updateConfig,
  exportProject,
  saveResponseOverride,
} from "../services/api";

function DashboardPage({ projectId }) {
  console.log("PROJECT ID:", projectId);

  const [project, setProject] = useState(null);

  const [logs, setLogs] = useState([]);

  const [config, setConfig] = useState({
    latency_ms: 0,
    error_rate: 0,
    status_code: 200,
  });

  const [selectedRoute, setSelectedRoute] =
    useState("");

  const [overrideResponse, setOverrideResponse] =
    useState(`{
  "id": 999,
  "name": "CUSTOM_RESPONSE"
}`);

  useEffect(() => {
    loadProject();
    loadConfig();
    loadLogs();

    const interval = setInterval(() => {
      loadLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadProject = async () => {
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await getLogs(projectId);
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConfig = async () => {
    try {
      const data = await getConfig(projectId);
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveConfig = async () => {
    try {
      await updateConfig(projectId, config);
      alert("Configuration saved");
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportProject(
        projectId
      );

      alert(
        JSON.stringify(
          data,
          null,
          2
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const saveOverride = async () => {
    try {
      if (!selectedRoute) {
        alert("Select a route first");
        return;
      }

      const route = project.routes.find(
        (r) =>
          `${r.method} ${r.path}` ===
          selectedRoute
      );

      await saveResponseOverride(
        projectId,
        {
          path: route.path,
          method: route.method,
          response: JSON.parse(
            overrideResponse
          ),
        }
      );

      alert("Override saved");
    } catch (err) {
      console.error(err);
      alert("Invalid JSON");
    }
  };

  if (!project) {
    return <h2>Loading...</h2>;
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>{project.filename}</h1>

      <h2>Project Configuration</h2>

      <div>
        <label>Latency (ms)</label>

        <br />

        <input
          type="number"
          value={config.latency_ms}
          onChange={(e) =>
            setConfig({
              ...config,
              latency_ms: Number(
                e.target.value
              ),
            })
          }
        />
      </div>

      <br />

      <div>
        <label>Error Rate (%)</label>

        <br />

        <input
          type="number"
          value={config.error_rate}
          onChange={(e) =>
            setConfig({
              ...config,
              error_rate: Number(
                e.target.value
              ),
            })
          }
        />
      </div>

      <br />

      <div>
        <label>Status Code</label>

        <br />

        <input
          type="number"
          value={config.status_code}
          onChange={(e) =>
            setConfig({
              ...config,
              status_code: Number(
                e.target.value
              ),
            })
          }
        />
      </div>

      <br />

      <button onClick={saveConfig}>
        Save Configuration
      </button>

      <button
        onClick={handleExport}
        style={{
          marginLeft: "10px",
        }}
      >
        Export Project
      </button>

      <hr />

      <h2>Available Routes</h2>

      <ul>
        {project.routes.map(
          (route, index) => (
            <li key={index}>
              <strong>
                {route.method}
              </strong>{" "}
              {route.path}
            </li>
          )
        )}
      </ul>

      <hr />

      <h2>Response Overrides</h2>

      <select
        value={selectedRoute}
        onChange={(e) =>
          setSelectedRoute(
            e.target.value
          )
        }
      >
        <option value="">
          Select Route
        </option>

        {project.routes.map(
          (route, index) => (
            <option
              key={index}
              value={`${route.method} ${route.path}`}
            >
              {route.method} {route.path}
            </option>
          )
        )}
      </select>

      <br />
      <br />

      <textarea
        rows={10}
        cols={60}
        value={overrideResponse}
        onChange={(e) =>
          setOverrideResponse(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button onClick={saveOverride}>
        Save Override
      </button>

      <hr />

      <h2>Request Logs</h2>

      {logs.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <pre>
          {JSON.stringify(
            logs,
            null,
            2
          )}
        </pre>
      )}
    </div>
  );
}

export default DashboardPage;