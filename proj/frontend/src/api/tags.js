import client from "./client";

export const fetchTags = () => client.get("/tags").then((res) => res.data);

export const createTag = (name, color) =>
  client.post("/tags", { name, color }).then((res) => res.data);

export const deleteTag = (id) => client.delete(`/tags/${id}`).then((res) => res.data);
