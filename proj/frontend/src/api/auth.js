import client from "./client";

export const registerUser = (payload) =>
  client.post("/auth/register", payload).then((res) => res.data);

export const loginUser = (payload) =>
  client.post("/auth/login", payload).then((res) => res.data);

export const googleLoginUser = (payload) =>
  client.post("/auth/google", payload).then((res) => res.data);

export const logoutUser = () => client.post("/auth/logout").then((res) => res.data);
