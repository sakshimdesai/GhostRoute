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
  const [selectedRoute, setSelectedRoute] = useState("");
  const [overrideResponse, setOverrideResponse] = useState(`{
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
      const data = await exportProject(projectId);
      alert(JSON.stringify(data, null, 2));
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
        (r) => `${r.method} ${r.path}` === selectedRoute
      );
      await saveResponseOverride(projectId, {
        path: route.path,
        method: route.method,
        response: JSON.parse(overrideResponse),
      });
      alert("Override saved");
    } catch (err) {
      console.error(err);
      alert("Invalid JSON");
    }
  };

  if (!project) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4a24c", fontFamily: "sans-serif" }}>
        Loading...
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    background: "#080808",
    border: "1px solid #2a2a2a",
    color: "#f5f5f5",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const cardStyle = {
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "16px",
  };

  const methodColor = (method) =>
    method === "GET" ? "#22c55e"
    : method === "POST" ? "#38bdf8"
    : method === "DELETE" ? "#ef4444"
    : "#f59e0b";

  const methodBg = (method) =>
    method === "GET" ? "rgba(34,197,94,0.10)"
    : method === "POST" ? "rgba(56,189,248,0.10)"
    : method === "DELETE" ? "rgba(239,68,68,0.10)"
    : "rgba(245,158,11,0.10)";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#f5f5f5", fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: "14px" }}>

      {/* SIDEBAR */}
      <div style={{ width: "260px", minWidth: "260px", background: "#0f0f0f", borderRight: "1px solid #2a2a2a", padding: "24px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "28px", paddingLeft: "8px" }}>
          <div style={{ color: "#d4a24c", fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>
            👻 GhostRoute
          </div>
          <div style={{ color: "#888", fontSize: "12px" }}>
            Your API, before it exists.
          </div>
        </div>

        {[
          { label: "Dashboard", active: true },
          { label: "Projects", active: false },
          { label: "API Logs", active: false },
          { label: "Settings", active: false },
        ].map(({ label, active }) => (
          <div key={label} style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: active ? "600" : "400",
            color: active ? "#d4a24c" : "#888",
            background: active ? "rgba(212,162,76,0.10)" : "transparent",
            border: active ? "1px solid rgba(212,162,76,0.20)" : "1px solid transparent",
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px" }}>

        {/* TOP NAV */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <input
            placeholder="Search endpoints..."
            style={{ ...inputStyle, width: "360px", padding: "10px 14px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "18px", cursor: "pointer" }}>🔔</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#d4a24c", display: "flex", alignItems: "center", justifyContent: "center", color: "#080808", fontWeight: "700", fontSize: "13px" }}>
              S
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#f5f5f5", marginBottom: "6px" }}>
              {project.filename}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "#163321", color: "#22c55e", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                ● LIVE
              </span>
              <span style={{ color: "#888", fontSize: "13px" }}>Mock Server Active</span>
            </div>
          </div>
          <button onClick={handleExport} style={{ background: "#d4a24c", color: "#080808", border: "none", padding: "0 20px", height: "40px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
            Export Project
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "Endpoints", value: project.routes.length },
            { label: "Latency", value: `${config.latency_ms}ms` },
            { label: "Error Rate", value: `${config.error_rate}%` },
            { label: "Total Logs", value: logs.length },
          ].map(({ label, value }) => (
            <div key={label} style={cardStyle}>
              <div style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>{label}</div>
              <div style={{ color: "#f5f5f5", fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>{value}</div>
              <div style={{ color: "#d4a24c", fontSize: "11px", fontWeight: "600" }}>Active</div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 1fr", gap: "12px", marginBottom: "16px", height: "420px" }}>

          {/* ENDPOINTS */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ color: "#f5f5f5", fontWeight: "700", fontSize: "15px", marginBottom: "10px" }}>Endpoints</div>
            <input placeholder="Search endpoint..." style={{ ...inputStyle, marginBottom: "10px" }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {project.routes.map((route, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #2a2a2a" }}>
                  <span style={{ display: "inline-block", minWidth: "62px", textAlign: "center", fontWeight: "700", fontSize: "11px", padding: "3px 6px", borderRadius: "5px", color: methodColor(route.method), background: methodBg(route.method) }}>
                    {route.method}
                  </span>
                  <span style={{ color: "#f5f5f5", fontSize: "13px" }}>{route.path}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MOCK CONFIG */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
            <div style={{ color: "#f5f5f5", fontWeight: "700", fontSize: "15px" }}>Mock Configuration</div>

            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0 }}>
              {[
                { label: "Latency (ms)", key: "latency_ms" },
                { label: "Error Rate (%)", key: "error_rate" },
                { label: "Status Code", key: "status_code" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <div style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>{label}</div>
                  <input
                    type="number"
                    value={config[key]}
                    onChange={(e) => setConfig({ ...config, [key]: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <button onClick={saveConfig} style={{ background: "#d4a24c", color: "#080808", border: "none", height: "38px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
              Save Configuration
            </button>
          </div>

          {/* RESPONSE OVERRIDE */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
            <div style={{ color: "#f5f5f5", fontWeight: "700", fontSize: "15px" }}>Response Override</div>

            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0 }}>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                style={{ ...inputStyle }}
              >
                <option value="">Select Route</option>
                {project.routes.map((route, index) => (
                  <option key={index} value={`${route.method} ${route.path}`}>
                    {route.method} {route.path}
                  </option>
                ))}
              </select>

              <textarea
                value={overrideResponse}
                onChange={(e) => setOverrideResponse(e.target.value)}
                style={{ ...inputStyle, flex: 1, minHeight: "120px", resize: "none", fontFamily: "'Courier New', monospace", fontSize: "12px", lineHeight: "1.5" }}
              />
            </div>

            <button onClick={saveOverride} style={{ background: "#d4a24c", color: "#080808", border: "none", height: "38px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
              Save Override
            </button>
          </div>
        </div>

        {/* LOGS */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <div style={{ color: "#f5f5f5", fontWeight: "700", fontSize: "15px", marginBottom: "10px" }}>Signal Trace</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                  {["Method", "Path", "Status", "Latency", "Timestamp"].map((h) => (
                    <th key={h} style={{ padding: "6px 12px", textAlign: "left", color: "#888", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px 12px", color: "#888", fontSize: "13px" }}>
                      No requests captured yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "6px 12px" }}>
                        <span style={{ display: "inline-block", minWidth: "62px", textAlign: "center", fontWeight: "700", fontSize: "11px", padding: "3px 6px", borderRadius: "5px", color: methodColor(log.method), background: methodBg(log.method) }}>
                          {log.method}
                        </span>
                      </td>
                      <td style={{ padding: "6px 12px", color: "#f5f5f5", fontSize: "13px" }}>{log.path}</td>
                      <td style={{ padding: "6px 12px", color: "#f5f5f5", fontSize: "13px" }}>{log.status_code}</td>
                      <td style={{ padding: "6px 12px", color: "#f5f5f5", fontSize: "13px" }}>{log.latency_ms}ms</td>
                      <td style={{ padding: "6px 12px", color: "#888", fontSize: "13px" }}>{log.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;