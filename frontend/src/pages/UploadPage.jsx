import { useState } from "react";
import { uploadSpec } from "../services/api";
import DashboardPage from "./DashboardPage";

function UploadPage() {
  const [projectId, setProjectId] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await uploadSpec(file);

      setProjectId(data.project_id);
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
        maxWidth: "700px",
        margin: "50px auto",
        padding: "20px",
      }}
    >
      <h1>Stub</h1>

      <p>
        Upload an OpenAPI specification
        to generate mock APIs.
      </p>

      <input
        type="file"
        accept=".json"
        onChange={(e) =>
          setFile(e.target.files[0])
        }
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading
          ? "Uploading..."
          : "Generate Mock Server"}
      </button>

      {error && (
        <pre
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </pre>
      )}
    </div>
  );
}

export default UploadPage;