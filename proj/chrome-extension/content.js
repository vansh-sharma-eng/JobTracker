// JobTracker Content Script — Extracts jobs from LinkedIn, Naukri, and career pages
(function () {
  function extractJobDetails() {
    const url = window.location.href;
    let companyName = "";
    let role = "";
    let location = "";
    let salary = "";
    let locationType = "REMOTE";
    let source = "Web / Direct";
    let notes = "";

    // 1. LinkedIn Job Scraper
    if (url.includes("linkedin.com")) {
      source = "LinkedIn";

      // Role / Title
      const titleEl = document.querySelector(
        ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24, .t-24.job-details-jobs-unified-top-card__job-title"
      );
      if (titleEl) role = titleEl.innerText.trim();

      // Company Name
      const compEl = document.querySelector(
        ".job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description a"
      );
      if (compEl) companyName = compEl.innerText.trim();

      // Location & Workplace Type
      const bulletEls = document.querySelectorAll(
        ".job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__primary-description span"
      );
      bulletEls.forEach((el) => {
        const text = el.innerText.trim();
        if (text.toLowerCase().includes("remote")) locationType = "REMOTE";
        else if (text.toLowerCase().includes("hybrid")) locationType = "HYBRID";
        else if (text.toLowerCase().includes("on-site") || text.toLowerCase().includes("onsite")) locationType = "ONSITE";
        if (text.length > 2 && !text.toLowerCase().includes("ago") && !location) {
          location = text;
        }
      });

      // Salary insight
      const salaryEl = document.querySelector(".job-details-jobs-unified-top-card__job-insight, .jobs-unified-top-card__job-insight");
      if (salaryEl && (salaryEl.innerText.includes("$") || salaryEl.innerText.includes("₹") || salaryEl.innerText.toLowerCase().includes("yr"))) {
        salary = salaryEl.innerText.trim();
      }

      // Notes / Description snippet
      const descEl = document.querySelector("#job-details, .jobs-description-content__text");
      if (descEl) {
        notes = descEl.innerText.slice(0, 500).trim() + "...";
      }
    }

    // 2. Naukri Job Scraper
    else if (url.includes("naukri.com")) {
      source = "Naukri";

      const titleEl = document.querySelector(".styles_jd-header-title__rZwM1, h1.styles_jd-header-title, .jd-header-title");
      if (titleEl) role = titleEl.innerText.trim();

      const compEl = document.querySelector(".styles_jd-header-comp-name__MvqAI a, .styles_jd-header-comp-name, .comp-name");
      if (compEl) companyName = compEl.innerText.trim();

      const salEl = document.querySelector(".styles_jph-salary__... , .salary, [class*='salary']");
      if (salEl) salary = salEl.innerText.trim();

      const locEl = document.querySelector(".styles_jph-location__... , .location, [class*='location']");
      if (locEl) {
        location = locEl.innerText.trim();
        if (location.toLowerCase().includes("remote")) locationType = "REMOTE";
        else if (location.toLowerCase().includes("hybrid")) locationType = "HYBRID";
        else locationType = "ONSITE";
      }

      const descEl = document.querySelector(".styles_JDJobs-rec-desc__... , .job-desc, section.styles_job-desc-container__...");
      if (descEl) {
        notes = descEl.innerText.slice(0, 500).trim() + "...";
      }
    }

    // 3. Generic Fallback
    else {
      const h1 = document.querySelector("h1");
      if (h1) role = h1.innerText.trim();
      companyName = document.title.split("-")[0].split("|")[0].trim();
      source = window.location.hostname.replace("www.", "");
    }

    // Clean up title and company
    role = role.replace(/[\n\r\t]+/g, " ").trim();
    companyName = companyName.replace(/[\n\r\t]+/g, " ").trim();

    return {
      companyName: companyName || "Unknown Company",
      role: role || "Software Engineer",
      locationType,
      salary: salary || null,
      jobUrl: url,
      source,
      notes: notes || null,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: "SAVED"
    };
  }

  // Listen for popup inquiries
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractJob") {
      const data = extractJobDetails();
      sendResponse({ success: true, data });
    }
  });

  // Inject sleek floating 1-click badge on recognized job sites
  function injectFloatingButton() {
    if (document.getElementById("jobtracker-floating-badge")) return;

    const btn = document.createElement("button");
    btn.id = "jobtracker-floating-badge";
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <span>Track in JobTracker</span>
    `;

    Object.assign(btn.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "9999px",
      background: "#6366f1",
      color: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-2px) scale(1.03)";
      btn.style.boxShadow = "0 14px 28px -4px rgba(99, 102, 241, 0.65)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "none";
      btn.style.boxShadow = "0 10px 25px -5px rgba(99, 102, 241, 0.5)";
    });

    btn.addEventListener("click", async () => {
      btn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⏳</span> Clipping...`;
      try {
        const job = extractJobDetails();
        chrome.storage.local.get(["jobtracker_token", "jobtracker_api"], async (res) => {
          const token = res.jobtracker_token;
          const apiBase = res.jobtracker_api || "http://localhost:8080/api/v1";

          if (!token) {
            btn.innerHTML = `⚠️ Connect via Extension`;
            btn.style.background = "#eab308";
            setTimeout(() => {
              btn.innerHTML = `<span>Track in JobTracker</span>`;
              btn.style.background = "#6366f1";
            }, 3000);
            return;
          }

          const response = await fetch(`${apiBase}/jobs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(job)
          });

          if (response.ok) {
            btn.innerHTML = `✓ Saved to Board!`;
            btn.style.background = "#10b981";
          } else {
            btn.innerHTML = `❌ Failed to save`;
            btn.style.background = "#ef4444";
          }

          setTimeout(() => {
            btn.innerHTML = `<span>Track in JobTracker</span>`;
            btn.style.background = "#6366f1";
          }, 3500);
        });
      } catch (e) {
        btn.innerHTML = `❌ Error`;
      }
    });

    document.body.appendChild(btn);
  }

  // Inject after a short timeout so dynamic DOM on LinkedIn / Naukri finishes rendering
  setTimeout(injectFloatingButton, 2000);
})();
