import client from "./client";

export const getGmailStatus = async () => {
  const res = await client.get("/integrations/gmail/status");
  return res.data;
};

export const scanGmailInbox = async () => {
  const res = await client.post("/integrations/gmail/scan");
  return res.data;
};

export const simulateGmailEmail = async (payload) => {
  const res = await client.post("/integrations/gmail/simulate", payload);
  return res.data;
};

export const connectGmail = async (email) => {
  const res = await client.post(`/integrations/gmail/connect?email=${encodeURIComponent(email)}`);
  return res.data;
};

export const getReminders = async () => {
  const res = await client.get("/reminders");
  return res.data;
};

export const getGoogleCalendarLink = async (jobId) => {
  const res = await client.get(`/reminders/jobs/${jobId}/calendar-link`);
  return res.data;
};

export const downloadIcsCalendar = async (jobId) => {
  const res = await client.get(`/reminders/jobs/${jobId}/calendar.ics`, {
    responseType: "blob",
  });
  return res.data;
};
