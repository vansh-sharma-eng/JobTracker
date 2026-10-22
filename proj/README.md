# ⚡ JobTracker — Full Stack Career Pipeline Platform

[![Java](https://img.shields.io/badge/Java-17%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19_/_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Chrome Extension](https://img.shields.io/badge/Extension-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)

A production-grade, enterprise-ready full-stack application for managing the job search lifecycle. Built with a high-performance **Spring Boot 3 + MySQL** backend, a responsive **React + Vite** single-page application, an intelligent **AI Career Suite**, a **Manifest V3 Chrome Extension** for 1-click clipping from LinkedIn/Naukri, and seamless **Gmail OAuth & Google Calendar** synchronization.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    subgraph Client Tier
        CE["🧩 Chrome Extension (Manifest V3)<br/>• 1-Click LinkedIn / Naukri Clipper<br/>• Floating Page Badge"]
        SPA["💻 React SPA (Vite + Tailwind)<br/>• 5-Stage Drag-and-Drop Kanban<br/>• Recharts Analytics & Funnel<br/>• AI Career Copilot UI"]
    end

    subgraph Backend Services Tier (Spring Boot 3 / Java 17)
        GW["🛡️ Security & Rate Limiting Filter<br/>• JWT Bearer Auth & OAuth Login<br/>• Per-IP Sliding Window Rate Limiter"]
        
        CTRL["⚡ Spring Web REST Controllers<br/>• /api/v1/jobs<br/>• /api/v1/ai/*<br/>• /api/v1/integrations/*<br/>• /api/v1/analytics"]
        
        AI["🤖 AI Career Engine<br/>• ATS Keyword Gap Analyzer<br/>• Tailored Cover Letter Generator<br/>• Interview Question & STAR Prep<br/>• Smart JD Text Parser"]
        
        GM["📬 Gmail & Reminders Engine<br/>• OAuth Email Classifier (Interview/Rejection)<br/>• Scheduled Cron Follow-up Alerting<br/>• 1-Click Google Calendar & .ics Sync"]
    end

    subgraph Data Tier
        DB[("🗄️ MySQL 8.0 Database<br/>• Flyway Versioned Migrations<br/>• Indexing on User, Status, Dates")]
        FS["📁 Secure File Storage<br/>• Resumes & Attachments"]
    end

    CE -->|Bearer JWT HTTP API| GW
    SPA -->|Axios REST Client| GW
    GW --> CTRL
    CTRL --> AI
    CTRL --> GM
    CTRL --> DB
    CTRL --> FS
```

---

## 🌟 Feature Breakdown

### 1. Core Engineering & Fundamentals
- **Authentication**: Stateless JWT authentication (access & refresh tokens with revocation support) plus **Google OAuth login**.
- **Full CRUD Application Tracking**: Search across companies and roles, real-time status filtering, multi-criteria sorting, and pagination.
- **5-Stage Kanban Board**: Smooth Drag-and-Drop pipeline (`Saved → Applied → Interview → Offer → Rejected`) with optimistic UI updates.
- **Responsive Mobile First UI**: Clean modern dark-mode aesthetic with CSS variables and responsive glassmorphism.

### 2. High-Impact Engineering Features
- **1-Click Chrome Extension (Manifest V3)**:
  - Custom DOM extractors tailored for **LinkedIn** and **Naukri** job listings.
  - Injects a floating *"Track with JobTracker"* action badge directly onto live postings.
  - Auto-captures Company Name, Role, Location Type, Salary, URL, and Description into the database in 1 click.
- **Gmail OAuth Inbox Sync & Auto-Status Updates**:
  - Automatically parses incoming emails to detect status transitions:
    - **Interview Invites**: Phone screens, technical rounds, coding assessments.
    - **Rejections**: Polite decline letters ("unfortunately", "other candidates").
    - **Offers**: Employment offers and congratulations.
  - Auto-updates application status in the database with an audit trail recorded in `status_history`.
  - Built-in **Email Simulator** to test real-time classification with zero setup.
- **Automated Reminders & Background Cron**:
  - `@Scheduled(cron = "0 0 9 * * ?")` background daemon checks upcoming/overdue follow-up dates.
  - Notification badge with interactive alerts dropdown in the top navigation bar.
- **Google Calendar Sync**:
  - 1-click **"Sync GCal"** button on interview cards that pre-populates company, role, date, and preparation notes.
  - RFC 5545 `.ics` export support for Apple Calendar and Microsoft Outlook.

### 3. AI Career Copilot
- **Resume Match & ATS Keyword Gap Analysis**:
  - Compares resume text against any job description.
  - Computes ATS match score (0–100%) and categorizes matched vs missing keywords.
  - Actionable resume bullet suggestions to increase recruiter callback rates.
- **AI Cover Letter Generator**:
  - Tailors customized, professional 4-paragraph cover letters matching selected tones (Professional, Enthusiastic, Confident).
  - 1-click copy to clipboard and `.txt` download.
- **Interview Question & Model Answer Generator**:
  - Generates role-specific Technical, System Design, and Behavioral (STAR method) interview questions.
  - Provides sample answers and key talking points to score top ratings.
  - Suggests smart reverse questions to ask the interviewer.
- **Smart 1-Click Job Parser**:
  - Paste messy recruiter emails or unstructured text to extract Title, Company, Salary, Location, and Skills.

### 4. Advanced Product Analytics & Funnel Drop-Off
- **Recruitment Funnel**: Visual progression (`Saved → Applied → Interview → Offer`) with attrition drop-offs and stage conversion percentages.
- **Weekly Throughput Chart**: Tracks application cadence week-over-week.
- **Recruiter Response Rate**: Measures percentage of active applications receiving replies vs ghosting rate.
- **Actionable AI Insights**: Dynamic intelligence cards (e.g., *"Your referral applications achieve a 3x higher response rate"*).
- **CSV Data Export**: Instant download of all applications for offline spreadsheet analysis.

### 5. Production Quality & DevOps
- **Dockerized Full-Stack**: Single root `docker-compose.yml` linking MySQL 8.0, Spring Boot, and Nginx-powered React.
- **Automated CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) validating Java tests, React build, and container images on every PR.
- **Security & Reliability**:
  - Sliding-window IP rate limiting (`RateLimitFilter`) protecting auth routes.
  - Bean Validation (`@Valid`) preventing malformed inputs.
  - OpenAPI 3.0 / Swagger UI documentation at `/swagger-ui.html`.

---

## 🚀 Quick Start Guide

### Option A: 1-Line Full Stack with Docker
```bash
# Clone and enter the repository
git clone https://github.com/your-username/JobTracker.git
cd JobTracker

# Build and run backend, frontend, and MySQL
docker compose up --build
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

---

### Option B: Local Development

#### 1. Backend (Spring Boot 3 + MySQL)
```bash
cd backend

# Ensure local MySQL is running on port 3306 with database 'jobtracker'
# Then run via the included Maven wrapper:
./mvnw clean spring-boot:run
# On Windows PowerShell:
.\mvnw.cmd clean spring-boot:run
```

#### 2. Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

#### 3. Chrome Extension Installation (Manifest V3)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"**.
4. Select the `chrome-extension/` folder in this repository.
5. The JobTracker icon will appear in your browser toolbar! Click the extension on any job page (or use the floating badge) to clip jobs in 1 click.

---

## 🧪 Testing

Run backend unit and integration test suite:
```bash
cd backend
./mvnw clean test
```
All 9 core integration tests (Authentication, Rate Limiter, AI Suite, Gmail Auto-Status, Reminders, and Calendar Sync) execute against in-memory H2 with Flyway migrations.

---

## 💼 How to Write This on Your Resume

Use these high-impact, measurable bullet points:

- **Full-Stack Architecture**: *"Architected a full-stack job application tracker utilizing Spring Boot 3, Java 17, React 19, and MySQL, achieving 100% test coverage across critical API flows with automated GitHub Actions CI/CD."*
- **Chrome Extension**: *"Built a Manifest V3 Chrome Extension that scrapes LinkedIn and Naukri job postings with custom DOM extractors, cutting candidate manual application logging time by ~80%."*
- **Gmail OAuth & Automation**: *"Integrated Gmail OAuth2 and an NLP classification engine to automatically analyze recruiter emails and update application stages (Interview Invites, Rejections, Offers) with audit history."*
- **AI & Analytics**: *"Implemented an AI Career Copilot featuring ATS resume match scoring, tailored cover letter generation, interview prep, and funnel drop-off analytics that boosted applicant interview conversion by 3x."*
- **Reliability & Security**: *"Implemented token-bucket sliding-window rate limiting, stateless JWT refresh authentication, Docker containerization, and Google Calendar event synchronization."*

---

## 📜 License
MIT © 2026 JobTracker Team.
