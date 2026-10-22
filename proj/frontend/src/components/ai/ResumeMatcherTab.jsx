import { useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { matchResume } from "../../api/ai";
import { copyToClipboard } from "../../utils/aiHelpers";

const SAMPLE_RESUME = `VANSH SHARMA
Full Stack Software Engineer | vansh@example.com | github.com/vansh
SUMMARY:
Full-stack engineer with 3+ years experience building scalable web applications, REST APIs, and microservices.
Proficient in Java, Spring Boot, React, JavaScript, MySQL, Docker, and Git.

EXPERIENCE:
Software Engineer — CloudTech (2023 - Present)
- Designed and built high-throughput REST APIs using Java 17 and Spring Boot 3, reducing query latency by 35%.
- Implemented responsive React frontend dashboards with real-time analytics and Drag-and-Drop Kanban boards.
- Containerized microservices with Docker and automated testing with JUnit and GitHub Actions CI/CD.

SKILLS:
Java, Spring Boot, Spring Security, Hibernate, MySQL, React, JavaScript, HTML5, CSS3, Docker, Git, REST APIs, JUnit.`;

const SAMPLE_JD = `Senior Full Stack Developer — Google / TechCorp
We are seeking an experienced Full Stack Engineer to lead our enterprise applications team.
Requirements:
- 3+ years of experience with Java and Spring Boot backend microservices
- Strong frontend proficiency with React, JavaScript, and Tailwind CSS
- Experience designing relational databases (MySQL or PostgreSQL), Redis caching, and Docker containers
- Proven track record in System Design, Unit Testing, and Agile collaboration
- Strong problem-solving, communication, and ownership mindset`;

export default function ResumeMatcherTab() {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const handleMatchResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescription.trim()) {
      return toast.error("Please provide both resume and job description");
    }
    setMatchLoading(true);
    try {
      const res = await matchResume({ resumeText, jobDescription });
      setMatchResult(res);
      toast.success("Resume match analysis complete!");
    } catch {
      toast.error("Resume match analysis failed");
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--accent)]" /> Target Job Description
            </h3>
            <button
              type="button"
              onClick={() => setJobDescription(SAMPLE_JD)}
              className="caption hover:underline text-xs"
            >
              Load Sample JD
            </button>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            placeholder="Paste the job description here..."
            className="input font-mono text-xs"
          />

          <div className="flex items-center justify-between pt-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" /> Your Resume Content
            </h3>
            <button
              type="button"
              onClick={() => setResumeText(SAMPLE_RESUME)}
              className="caption hover:underline text-xs"
            >
              Load Sample Resume
            </button>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={8}
            placeholder="Paste your plain text resume or project summary..."
            className="input font-mono text-xs"
          />

          <button
            onClick={handleMatchResume}
            disabled={matchLoading}
            className="btn btn-primary w-full py-2.5"
          >
            <Sparkles size={16} />
            {matchLoading ? "Analyzing Match & ATS Keywords…" : "Run AI Resume Match Analysis"}
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-4">
        {matchResult ? (
          <div className="card p-5 space-y-5 modal-in">
            {/* Score Gauge */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/40 border border-[var(--accent)]/30">
              <div>
                <p className="caption uppercase tracking-wider text-[11px] text-[var(--accent)] font-semibold">
                  Overall Match Score
                </p>
                <h2 className="text-3xl font-extrabold text-white mt-1">
                  {matchResult.matchScore}%
                  <span className="text-sm font-medium text-emerald-400 ml-2">
                    ({matchResult.matchGrade})
                  </span>
                </h2>
                <p className="caption text-xs mt-1">{matchResult.summary}</p>
              </div>
              <div className="text-right">
                <span className="text-xs caption">ATS Compatibility</span>
                <div className="text-xl font-bold text-amber-400">{matchResult.atsScore}/100</div>
              </div>
            </div>

            {/* Matched Keywords */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Matched Skills & Keywords ({matchResult.matchedKeywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchedKeywords?.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Missing High-Priority Keywords ({matchResult.missingKeywords?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missingKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    onClick={() => copyToClipboard(kw, kw)}
                    title="Click to copy keyword"
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-pointer hover:bg-amber-500/20 transition-colors"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="pt-2 border-t border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--text-1)] uppercase tracking-wider mb-2">
                Targeted Resume Recommendations
              </h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-2)] list-disc pl-4">
                {matchResult.improvementRecommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-[var(--text-3)] space-y-3">
            <Sparkles size={36} className="mx-auto text-[var(--text-3)] opacity-60" />
            <p className="font-medium text-sm text-[var(--text-2)]">No Analysis Yet</p>
            <p className="caption max-w-sm mx-auto text-xs">
              Click "Run AI Resume Match Analysis" to generate an ATS match percentage, keyword gap check, and targeted advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
