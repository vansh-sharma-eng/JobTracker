const API_DEFAULT = "http://localhost:8080/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const authSection = document.getElementById("authSection");
  const jobSection = document.getElementById("jobSection");
  const loginBtn = document.getElementById("loginBtn");
  const saveBtn = document.getElementById("saveBtn");
  const jobForm = document.getElementById("jobForm");
  const userEmailTag = document.getElementById("userEmailTag");

  const previewTitle = document.getElementById("previewTitle");
  const previewCompany = document.getElementById("previewCompany");
  const companyInput = document.getElementById("companyName");
  const roleInput = document.getElementById("role");
  const statusInput = document.getElementById("status");
  const locationTypeInput = document.getElementById("locationType");
  const salaryInput = document.getElementById("salary");
  const tagsInput = document.getElementById("tags");
  const jobUrlInput = document.getElementById("jobUrl");

  let currentToken = null;
  let apiBase = API_DEFAULT;

  // 1. Check storage for token
  const stored = await chrome.storage.local.get(["jobtracker_token", "jobtracker_user", "jobtracker_api"]);
  if (stored.jobtracker_api) apiBase = stored.jobtracker_api;

  if (stored.jobtracker_token) {
    currentToken = stored.jobtracker_token;
    userEmailTag.textContent = stored.jobtracker_user || "Connected";
    showJobForm();
  } else {
    // Try auto-detecting token from open localhost:5173 tab
    const tabs = await chrome.tabs.query({ url: "*://localhost:5173/*" });
    if (tabs.length > 0) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => localStorage.getItem("token")
        });
        if (results && results[0] && results[0].result) {
          currentToken = results[0].result;
          await chrome.storage.local.set({ jobtracker_token: currentToken });
          userEmailTag.textContent = "Synced from Web App";
          showJobForm();
        } else {
          showAuth();
        }
      } catch (e) {
        showAuth();
      }
    } else {
      showAuth();
    }
  }

  function showAuth() {
    authSection.style.display = "block";
    jobSection.style.display = "none";
  }

  function showJobForm() {
    authSection.style.display = "none";
    jobSection.style.display = "block";
    extractFromCurrentTab();
  }

  // 2. Handle Login inside extension
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) return alert("Please enter email and password");

    loginBtn.textContent = "Connecting...";
    loginBtn.disabled = true;

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      currentToken = data.accessToken;
      await chrome.storage.local.set({
        jobtracker_token: currentToken,
        jobtracker_user: data.user.email
      });

      userEmailTag.textContent = data.user.email;
      showJobForm();
    } catch (e) {
      alert("Login Error: " + e.message);
    } finally {
      loginBtn.textContent = "Connect Account";
      loginBtn.disabled = false;
    }
  });

  // 3. Extract job from current tab
  async function extractFromCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    jobUrlInput.value = tab.url || "";

    try {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" }, (response) => {
        if (response && response.success && response.data) {
          const d = response.data;
          companyInput.value = d.companyName || "";
          roleInput.value = d.role || "";
          if (d.locationType) locationTypeInput.value = d.locationType;
          if (d.salary) salaryInput.value = d.salary;
          if (d.status) statusInput.value = d.status;
          if (d.jobUrl) jobUrlInput.value = d.jobUrl;

          previewTitle.textContent = d.role;
          previewCompany.textContent = d.companyName;
        } else {
          previewTitle.textContent = tab.title.split("-")[0] || "Custom Job Posting";
          previewCompany.textContent = tab.url ? new URL(tab.url).hostname : "Current Page";
          roleInput.value = previewTitle.textContent.trim();
          companyInput.value = previewCompany.textContent.trim();
        }
      });
    } catch (e) {
      previewTitle.textContent = "Manual Job Entry";
      previewCompany.textContent = "Enter details below";
    }
  }

  // 4. Save Job to Tracker
  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentToken) return showAuth();

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>Saving application...</span>`;

    const payload = {
      companyName: companyInput.value.trim(),
      role: roleInput.value.trim(),
      locationType: locationTypeInput.value,
      salary: salaryInput.value.trim() || null,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: statusInput.value,
      source: "Chrome Extension",
      jobUrl: jobUrlInput.value.trim() || null,
      tags: tagsInput.value ? tagsInput.value.split(",").map(t => t.trim()).filter(Boolean) : []
    };

    try {
      const res = await fetch(`${apiBase}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) {
          await chrome.storage.local.remove(["jobtracker_token"]);
          showAuth();
          throw new Error("Session expired. Please log in again.");
        }
        const err = await res.json();
        throw new Error(err.message || "Failed to save application");
      }

      saveBtn.style.background = "#10b981";
      saveBtn.innerHTML = `✓ Saved to JobTracker Board!`;

      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (err) {
      alert("Error: " + err.message);
      saveBtn.disabled = false;
      saveBtn.style.background = "#6366f1";
      saveBtn.innerHTML = `<span>Save to JobTracker</span>`;
    }
  });
});
