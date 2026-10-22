import client from "./client";

export const fetchJobs = (params) =>
  client.get("/jobs", { params }).then((res) => res.data);

export const fetchJob = (id) => client.get(`/jobs/${id}`).then((res) => res.data);

export const createJob = (payload) =>
  client.post("/jobs", payload).then((res) => res.data);

export const updateJob = (id, payload) =>
  client.put(`/jobs/${id}`, payload).then((res) => res.data);

export const updateJobStatus = (id, status) =>
  client.patch(`/jobs/${id}/status`, { status }).then((res) => res.data);

export const deleteJob = (id) => client.delete(`/jobs/${id}`).then((res) => res.data);

export const fetchStats = () => client.get("/jobs/stats").then((res) => res.data);

export const fetchFollowUps = () => client.get("/jobs/follow-ups").then((res) => res.data);

export const uploadAttachment = (jobId, file, type) => {
  const formData = new FormData();
  formData.append("file", file);
  return client
    .post(`/jobs/${jobId}/attachments?type=${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const deleteAttachment = (jobId, attachmentId) =>
  client.delete(`/jobs/${jobId}/attachments/${attachmentId}`).then((res) => res.data);

export const downloadAttachment = (jobId, attachmentId) =>
  client
    .get(`/jobs/${jobId}/attachments/${attachmentId}/download`, { responseType: "blob" })
    .then((res) => res.data);

export const exportCsv = () =>
  client.get("/export/csv", { responseType: "blob" }).then((res) => res.data);
