import client from "./client";

export const fetchAnalytics = (daysBack = 90) =>
  client.get("/analytics", { params: { daysBack } }).then((res) => res.data);
