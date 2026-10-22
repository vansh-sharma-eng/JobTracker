import client from "./client";

export const matchResume = async (payload) => {
  const res = await client.post("/ai/match-resume", payload);
  return res.data;
};

export const generateCoverLetter = async (payload) => {
  const res = await client.post("/ai/generate-cover-letter", payload);
  return res.data;
};

export const generateInterviewQuestions = async (payload) => {
  const res = await client.post("/ai/interview-questions", payload);
  return res.data;
};

export const extractJob = async (payload) => {
  const res = await client.post("/ai/extract-job", payload);
  return res.data;
};
