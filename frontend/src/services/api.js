import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadSpec = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/projects/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getProjects = async () => {
  const response = await api.get("/projects/");
  return response.data;
};

export const getProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const getLogs = async (projectId) => {
  const response = await api.get(
    `/projects/${projectId}/logs`
  );
  return response.data;
};

export const getConfig = async (projectId) => {
  const response = await api.get(
    `/projects/${projectId}/config`
  );
  return response.data;
};

export const updateConfig = async (
  projectId,
  config
) => {
  const response = await api.put(
    `/projects/${projectId}/config`,
    config
  );

  return response.data;
};
export const exportProject = async (
  projectId
) => {
  const response = await api.get(
    `/projects/${projectId}/export`
  );

  return response.data;
};
export const saveResponseOverride = async (
  projectId,
  payload
) => {
  const response = await api.put(
    `/projects/${projectId}/response`,
    payload
  );

  return response.data;
};

export const getResponseOverrides = async (
  projectId
) => {
  const response = await api.get(
    `/projects/${projectId}/response`
  );

  return response.data;
};
export default api;