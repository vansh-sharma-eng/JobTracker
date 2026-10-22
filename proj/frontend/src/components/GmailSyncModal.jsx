import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Mail, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import { getGmailStatus, scanGmailInbox, simulateGmailEmail } from "../api/integrations";

const PRESETS = [
  {
    name: "Google Interview Invite",
    fromEmail: "recruiting@google.com",
    subject: "Interview Invitation: Senior Software Engineer at Google",
    body: "Hi Candidate,\n\nWe were impressed by your background and would like to invite you for a 45-minute technical screen next week. Please let us know your availability!\n\nBest,\nGoogle Recruiting Team"
  },
  {
    name: "Amazon Rejection Letter",
    fromEmail: "no-reply@amazon.jobs",
    subject: "Update on your Amazon Application - Software Development Engineer",
    body: "Thank you for taking the time to speak with our team. Unfortunately, at this time we have decided to pursue other candidates whose qualifications more closely align with our current needs.\n\nWe wish you the best in your job search."
  },
  {
    name: "Stripe Offer Letter",
    fromEmail: "talent@stripe.com",
    subject: "Offer of Employment: Full Stack Engineer at Stripe",
    body: "Congratulations! We are pleased to extend an official offer of employment for the Full Stack Engineer role at Stripe. Please find attached the offer letter details."
  }
];

export default function GmailSyncModal({ onClose, onSyncSuccess }) {
  const [status, setStatus] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState("scan"); // "scan" | "simulate"
  const [syncResults, setSyncResults] = useState(null);

  // Simulation form
  const [fromEmail, setFromEmail] = useState(PRESETS[0].fromEmail);
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [body, setBody] = useState(PRESETS[0].body);

  const loadStatus = async () => {
    try {
      const res = await getGmailStatus();
      setStatus(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setSyncResults(null);
    try {
      const res = await scanGmailInbox();
      setSyncResults(res);
      if (res.statusUpdatesApplied > 0) {
        toast.success(`Updated ${res.statusUpdatesApplied} application status from inbox!`);
        if (onSyncSuccess) onSyncSuccess();
      } else {
        toast.success("Inbox scanned. All statuses are up to date.");
      }
      loadStatus();
    } catch {
      toast.error("Inbox scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    setSyncResults(null);
    try {
      const res = await simulateGmailEmail({ fromEmail, subject, body });
      setSyncResults(res);
      if (res.statusUpdatesApplied > 0) {
        toast.success(`Auto-updated to ${res.updates[0].newStatus}!`);
        if (onSyncSuccess) onSyncSuccess();
      } else {
        toast(res.message, { icon: "ℹ️" });
      }
      loadStatus();
    } catch {
      toast.error("Email simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const applyPreset = (preset) => {
    setFromEmail(preset.fromEmail);
    setSubject(preset.subject);
    setBody(preset.body);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card modal-in flex flex-col w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">Gmail Auto-Status Sync</h2>
              <p className="caption text-xs">Reads interview & rejection emails to auto-update your board</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status banner */}
          <div className="rounded-xl p-3.5 flex items-center justify-between" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-1)] truncate">
                  Connected: {status?.email || "candidate@gmail.com"}
                </p>
                <p className="caption text-[11px] truncate">
                  OAuth sync active · {status?.totalStatusUpdatesMade ?? 0} auto-updates applied
                </p>
              </div>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="btn btn-primary btn-sm shrink-0"
              title="Scan recent emails"
            >
              <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
              {scanning ? "Scanning…" : "Scan Inbox"}
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="seg w-full">
            <button
              type="button"
              className={`flex-1 ${activeTab === "scan" ? "active" : ""}`}
              onClick={() => setActiveTab("scan")}
            >
              Live Inbox Scan
            </button>
            <button
              type="button"
              className={`flex-1 ${activeTab === "simulate" ? "active" : ""}`}
              onClick={() => setActiveTab("simulate")}
            >
              Test Email Simulator
            </button>
          </div>

          {activeTab === "scan" && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                JobTracker scans your connected Gmail account using OAuth2. It uses NLP classification to automatically detect:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <span className="font-semibold text-amber-400 block mb-0.5">Interview</span>
                  <span className="caption text-[10px]">Coding rounds, phone screens</span>
                </div>
                <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5">
                  <span className="font-semibold text-red-400 block mb-0.5">Rejection</span>
                  <span className="caption text-[10px]">"Unfortunately not proceeding"</span>
                </div>
                <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <span className="font-semibold text-emerald-400 block mb-0.5">Offer</span>
                  <span className="caption text-[10px]">Official job offer letters</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="btn btn-primary w-full py-2.5"
                >
                  <RefreshCw size={16} className={scanning ? "animate-spin" : ""} />
                  {scanning ? "Scanning Gmail Inbox…" : "Run Full Inbox Scan Now"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "simulate" && (
            <form onSubmit={handleSimulate} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="label text-xs">Quick Demo Presets</label>
                <div className="flex gap-1.5">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-2)] hover:text-white"
                    >
                      {idx === 0 ? "Interview" : idx === 1 ? "Rejection" : "Offer"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label text-xs">From / Sender</label>
                <input
                  type="text"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="label text-xs">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="label text-xs">Email Body Content</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="btn btn-primary w-full py-2"
              >
                <Send size={15} />
                {simulating ? "Processing Email..." : "Simulate Incoming Email & Auto-Update"}
              </button>
            </form>
          )}

          {/* Results display */}
          {syncResults && (
            <div className="rounded-xl p-3.5 bg-black/40 border border-[var(--border)] space-y-2 modal-in">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-1)]">
                {syncResults.statusUpdatesApplied > 0 ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="text-amber-400" />
                )}
                {syncResults.message}
              </div>

              {syncResults.updates?.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
                >
                  <div>
                    <span className="font-semibold text-white">{u.companyName}</span>
                    <span className="caption block text-[11px] truncate max-w-[260px]">{u.emailSubject}</span>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-interview text-[11px]">{u.previousStatus} → {u.newStatus}</span>
                    <span className="caption block text-[10px] text-emerald-400 mt-0.5">{u.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
