import { useState } from "react";
import toast from "react-hot-toast";
import { HelpCircle, Layers, Sparkles } from "lucide-react";
import { generateInterviewQuestions } from "../../api/ai";

export default function InterviewPrepTab() {
  const [prepCompany, setPrepCompany] = useState("Stripe");
  const [prepRole, setPrepRole] = useState("Backend Software Engineer");
  const [prepJd, setPrepJd] = useState(
    "Java, Spring Boot, high-scale REST APIs, distributed transaction management, and system resilience."
  );
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState(null);

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setPrepLoading(true);
    try {
      const res = await generateInterviewQuestions({
        companyName: prepCompany,
        role: prepRole,
        jobDescription: prepJd,
      });
      setPrepResult(res);
      toast.success("Interview questions generated!");
    } catch {
      toast.error("Question generation failed");
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerateQuestions} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label text-xs">Company Name *</label>
            <input
              type="text"
              value={prepCompany}
              onChange={(e) => setPrepCompany(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Role / Title *</label>
            <input
              type="text"
              value={prepRole}
              onChange={(e) => setPrepRole(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="label text-xs">Core Tech Stack / JD Focus</label>
            <input
              type="text"
              value={prepJd}
              onChange={(e) => setPrepJd(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={prepLoading}
          className="btn btn-primary w-full py-2.5"
        >
          <HelpCircle size={16} />
          {prepLoading ? "Generating Interview Questions…" : "Generate Tailored Interview Questions & Model Answers"}
        </button>
      </form>

      {prepResult && (
        <div className="space-y-6 modal-in">
          {/* Technical Questions */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2 text-indigo-400">
              <Layers size={18} /> Technical & Architecture Questions
            </h3>
            <div className="space-y-3">
              {prepResult.technicalQuestions?.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <p className="font-semibold text-sm text-white">Q{i + 1}: {q.question}</p>
                  <p className="caption text-xs italic">Why asked: {q.whyAsked}</p>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-zinc-300">
                    <span className="font-semibold text-emerald-400 block mb-1">Key Talking Points:</span>
                    {q.modelAnswerKeyPoints}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Questions */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2 text-amber-400">
              <Sparkles size={18} /> Behavioral & Culture (STAR Framework)
            </h3>
            <div className="space-y-3">
              {prepResult.behavioralQuestions?.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <p className="font-semibold text-sm text-white">Q{i + 1}: {q.question}</p>
                  <p className="caption text-xs italic">Why asked: {q.whyAsked}</p>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <span className="font-semibold block mb-1">STAR Method Tip:</span>
                    {q.starMethodTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reverse Questions */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-base text-emerald-400">
              Smart Questions to Ask the Interviewer
            </h3>
            <ul className="space-y-2 text-xs text-zinc-300 list-disc pl-5">
              {prepResult.questionsToAskInterviewer?.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
