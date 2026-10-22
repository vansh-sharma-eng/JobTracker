// JobTracker Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("JobTracker 1-Click Extension installed successfully.");
  chrome.storage.local.get(["jobtracker_api"], (res) => {
    if (!res.jobtracker_api) {
      chrome.storage.local.set({ jobtracker_api: "http://localhost:8080/api/v1" });
    }
  });
});
