import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Wand2, PlusCircle } from "lucide-react";
import { extractJob } from "../../api/ai";
import { createJob } from "../../api/jobs";

export default function SmartParserTab() {
  const navigate = useNavigate();
  const [rawJobText, setRawJobText] = useState(
    "Hiring at Stripe for a Senior Full Stack Engineer! Location is Remote (Worldwide). Base Salary 28 LPA to 35 LPA. Requirements: Java, Spring Boot, React, MySQL, Docker. Apply at https://stripe.com/jobs/sde-102"
  );
  const [parseLoading, setParseLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [savingJob, setSavingJob] = useState(false);

  const handleExtractJob = async (e) => {
    e.preventDefault();
    setParseLoading(true);
    try {
      const res = await extractJob({ content: rawJobText });
      setParseResult(res);
      toast.success("Job posting parsed successfully!");
    } catch {
      toast.error("Parsing failed");
    } finally {
      setParseLoading(false);
    }
  };

  const handleSaveParsedJob = async () => {
    if (!parseResult) return;
    setSavingJob(true);
    try {
      await createJob({
        companyName: parseResult.companyName,
        role: parseResult.role,
        locationType: parseResult.locationType || "REMOTE",
        salary: parseResult.salary,
        source: parseResult.source || "AI Smart Parser",
        jobUrl: parseResult.jobUrl,
        notes: parseResult.summary,
        appliedDate: new Date().toISOString().slice(0, 10),
        status: "SAVED",
        tags: parseResult.extractedSkills?.slice(0, 4) || [],
      });
      toast.success("Application saved to your board!");
      navigate("/kanban");
    } catch {
      toast.error("Could not save application");
    } finally {
      setSavingJob(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-6 space-y-4">
        <form onSubmit={handleExtractJob} className="card p-5 space-y-4">
          <h3 className="font-semibold text-base">Paste Any Job Text or URL</h3>
          <p className="caption text-xs">
            Copy-paste raw job listing text, an email from a recruiter, or LinkedIn text. The AI extracts company, title, salary, and requirements.
          </p>
          <textarea
            value={rawJobText}
            onChange={(e) => setRawJobText(e.target.value)}
            rows={8}
            className="input font-mono text-xs"
            required
          />
          <button
            type="submit"
            disabled={parseLoading}
            className="btn btn-primary w-full py-2.5"
          >
            <Wand2 size={16} />
            {parseLoading ? "Extracting Details…" : "Extract Job Details"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-6 space-y-4">
        {parseResult ? (
          <div className="card p-5 space-y-4 modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-semibold text-base text-white">Parsed Job Details</h3>
              <span className="badge badge-applied">{parseResult.locationType}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="caption block">Company</span>
                <span className="font-semibold text-sm text-white">{parseResult.companyName}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="caption block">Role</span>
                <span className="font-semibold text-sm text-white">{parseResult.role}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="caption block">Salary Range</span>
                <span className="font-semibold text-emerald-400">{parseResult.salary || "Not Specified"}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="caption block">Detected Source</span>
                <span className="font-semibold text-zinc-300">{parseResult.source || "Web"}</span>
              </div>
            </div>

            {parseResult.extractedSkills?.length > 0 && (
              <div>
                <span className="caption block mb-1 text-xs">Key Skills Extracted:</span>
                <div className="flex flex-wrap gap-1.5">
                  {parseResult.extractedSkills.map((sk, idx) => (
                    <span key={idx} className="badge badge-interview text-xs">{sk}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleSaveParsedJob}
                disabled={savingJob}
                className="btn btn-primary w-full py-2.5"
              >
                <PlusCircle size={16} />
                {savingJob ? "Saving to Tracker…" : "Save Directly to Applications Board"}
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-[var(--text-3)] space-y-3">
            <Wand2 size={36} className="mx-auto text-[var(--text-3)] opacity-60" />
            <p className="font-medium text-sm text-[var(--text-2)]">No Text Parsed Yet</p>
            <p className="caption max-w-sm mx-auto text-xs">
              Paste raw text or a job link on the left to automatically extract company, title, and salary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
