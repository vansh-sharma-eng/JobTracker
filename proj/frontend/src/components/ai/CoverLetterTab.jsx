import { useState } from "react";
import toast from "react-hot-toast";
import { Wand2, FileText, Copy, Download } from "lucide-react";
import { generateCoverLetter } from "../../api/ai";
import { copyToClipboard, downloadTextFile } from "../../utils/aiHelpers";

export default function CoverLetterTab() {
  const [coverCompany, setCoverCompany] = useState("Google");
  const [coverRole, setCoverRole] = useState("Full Stack Software Engineer");
  const [coverTone, setCoverTone] = useState("Professional & Confident");
  const [coverBg, setCoverBg] = useState(
    "I have built production-grade full-stack systems using Spring Boot and React with automated CI/CD."
  );
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverResult, setCoverResult] = useState(null);

  const handleGenerateCover = async (e) => {
    e.preventDefault();
    setCoverLoading(true);
    try {
      const res = await generateCoverLetter({
        companyName: coverCompany,
        role: coverRole,
        tone: coverTone,
        userBackground: coverBg,
      });
      setCoverResult(res);
      toast.success("Tailored cover letter generated!");
    } catch {
      toast.error("Cover letter generation failed");
    } finally {
      setCoverLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-4">
        <form onSubmit={handleGenerateCover} className="card p-5 space-y-4">
          <h3 className="font-semibold text-base">Cover Letter Parameters</h3>
          <div>
            <label className="label text-xs">Company Name *</label>
            <input
              type="text"
              value={coverCompany}
              onChange={(e) => setCoverCompany(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Job Title / Role *</label>
            <input
              type="text"
              value={coverRole}
              onChange={(e) => setCoverRole(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Desired Tone</label>
            <select
              value={coverTone}
              onChange={(e) => setCoverTone(e.target.value)}
              className="input"
            >
              <option value="Professional & Confident">Professional & Confident</option>
              <option value="Enthusiastic & High Energy">Enthusiastic & High Energy</option>
              <option value="Modern & Direct">Modern & Direct</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Key Background / Standout Experience</label>
            <textarea
              value={coverBg}
              onChange={(e) => setCoverBg(e.target.value)}
              rows={4}
              className="input text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={coverLoading}
            className="btn btn-primary w-full py-2.5"
          >
            <Wand2 size={16} />
            {coverLoading ? "Generating Tailored Letter…" : "Generate AI Cover Letter"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 space-y-4">
        {coverResult ? (
          <div className="card p-5 space-y-4 modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h4 className="font-semibold text-sm">{coverResult.subjectLine}</h4>
                <p className="caption text-xs">
                  {coverResult.wordCount} words · Tone: {coverResult.toneUsed}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(coverResult.coverLetter, "Cover letter")}
                  className="btn btn-ghost btn-sm"
                  title="Copy to clipboard"
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={() => downloadTextFile(coverResult.coverLetter, `CoverLetter-${coverCompany}.txt`)}
                  className="btn btn-sm"
                  title="Download text file"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-[var(--border)] font-serif text-sm leading-relaxed whitespace-pre-line text-zinc-200">
              {coverResult.coverLetter}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center text-[var(--text-3)] space-y-3">
            <FileText size={36} className="mx-auto text-[var(--text-3)] opacity-60" />
            <p className="font-medium text-sm text-[var(--text-2)]">Ready to write your letter</p>
            <p className="caption max-w-sm mx-auto text-xs">
              Fill in the company and position details on the left to generate an authentic, personalized cover letter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
