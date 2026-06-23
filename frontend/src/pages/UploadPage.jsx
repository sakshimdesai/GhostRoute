import { useState } from "react";
import { uploadSpec } from "../services/api";
import DashboardPage from "./DashboardPage";

function UploadPage() {
  const [projectId, setProjectId] = useState(
    localStorage.getItem("ghostroute_project_id")
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an OpenAPI specification.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await uploadSpec(file);

      setProjectId(data.project_id);

      localStorage.setItem(
        "ghostroute_project_id",
        data.project_id
      );
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(
          JSON.stringify(
            err.response.data.detail,
            null,
            2
          )
        );
      } else {
        setError("Upload failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (projectId) {
    return (
      <DashboardPage
        projectId={projectId}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        className="ghost-card"
        style={{
          width: "100%",
          maxWidth: "850px",
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            color: "#d4a24c",
            fontWeight: "600",
          }}
        >
          👻 GhostRoute
        </div>

        <h1
          style={{
            fontSize: "56px",
            marginBottom: "20px",
            lineHeight: "1.1",
            color: "#f5f5f5",
          }}
        >
          Your API,
          <br />
          before it exists.
        </h1>

        <p
          style={{
            maxWidth: "600px",
            margin: "0 auto 40px auto",
            fontSize: "18px",
            color: "#888",
            lineHeight: "1.7",
          }}
        >
          Upload an OpenAPI specification and
          instantly generate a live mock server
          with configurable latency, error
          simulation, request logging and
          response overrides.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <input
            className="ghost-input"
            type="file"
            accept=".json"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "#080808",
              border: "1px solid #2a2a2a",
              color: "#f5f5f5",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            className="ghost-button"
            onClick={handleUpload}
            disabled={loading}
            style={{
              minWidth: "220px",
              height: "50px",
              background: "#d4a24c",
              color: "#080808",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            {loading
              ? "Generating..."
              : "Generate Mock Server"}
          </button>
        </div>

        {file && (
          <div
            style={{
              marginTop: "20px",
              color: "#22c55e",
              fontSize: "14px",
            }}
          >
            Selected: {file.name}
          </div>
        )}

        {error && (
          <pre
            style={{
              marginTop: "24px",
              textAlign: "left",
              background: "#080808",
              border: "1px solid #2a2a2a",
              padding: "16px",
              borderRadius: "12px",
              color: "#ef4444",
              overflowX: "auto",
            }}
          >
            {error}
          </pre>
        )}
      </div>
    </div>
  );
}

export default UploadPage;