import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { X, Paperclip, Trash2, ChevronDown, UploadCloud } from "lucide-react";
import { uploadAttachment, deleteAttachment, downloadAttachment } from "../api/jobs";

const MAX_FILE_MB = 5;

const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = () => toISO(new Date());
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
};

const LOCATIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const SOURCES = ["LinkedIn", "Referral", "Company website", "Naukri", "Indeed", "Wellfound", "Other"];

const emptyForm = () => ({
  companyName: "",
  role: "",
  locationType: "REMOTE",
  salary: "",
  appliedDate: today(),
  status: "APPLIED",
  source: "",
  jobUrl: "",
  notes: "",
  followUpDate: "",
  tags: "",
});

export default function AddJobModal({ onClose, onSave, job }) {
  const isEditing = !!job;

  const [form, setForm] = useState(() =>
    isEditing
      ? {
          companyName: job.companyName || "",
          role: job.role || "",
          locationType: job.locationType || "REMOTE",
          salary: job.salary || "",
          appliedDate: job.appliedDate || today(),
          status: job.status || "APPLIED",
          source: job.source || "",
          jobUrl: job.jobUrl || "",
          notes: job.notes || "",
          followUpDate: job.followUpDate || "",
          tags: (job.tags || []).map((t) => t.name).join(", "),
        }
      : emptyForm()
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState(job?.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Optional fields stay hidden unless we're editing a job that already uses them
  const [showMore, setShowMore] = useState(
    isEditing &&
      !!(
        job.salary ||
        job.source ||
        job.jobUrl ||
        job.notes ||
        job.followUpDate ||
        job.tags?.length ||
        job.attachments?.length ||
        job.status !== "APPLIED"
      )
  );

  // Close on Escape + stop the page behind from scrolling
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = "Company is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.appliedDate) newErrors.appliedDate = "Applied date is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        companyName: form.companyName.trim(),
        role: form.role.trim(),
        locationType: form.locationType,
        salary: form.salary || null,
        appliedDate: form.appliedDate,
        status: form.status,
        source: form.source || null,
        jobUrl: form.jobUrl || null,
        notes: form.notes || null,
        followUpDate: form.followUpDate || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await onSave(payload, job?.id);
      toast.success(isEditing ? "Application updated" : "Application saved");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Attachments (click or drag & drop, multiple files) ---------- */
  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || !job?.id) return;
    setUploading(true);
    for (const file of files) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_FILE_MB} MB`);
        continue;
      }
      try {
        const attachment = await uploadAttachment(job.id, file, "OTHER");
        setAttachments((prev) => [...prev, attachment]);
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Upload failed: ${file.name}`);
      }
    }
    setUploading(false);
  };

  const handleFileUpload = (e) => {
    uploadFiles(e.target.files);
    e.target.value = "";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(job.id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      toast.error("Could not remove file");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const blob = await downloadAttachment(job.id, attachment.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download file");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit application" : "Add application"}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      // Stops the browser from opening a file if it is dropped outside the drop zone
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <form
        onSubmit={handleSubmit}
        className="card modal-in flex flex-col w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-base font-semibold">{isEditing ? "Edit application" : "Add application"}</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Essentials */}
          <div>
            <label className="label" htmlFor="companyName">Company *</label>
            <input
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Google, Amazon..."
              className="input"
              aria-invalid={!!errors.companyName}
              autoFocus
            />
            {errors.companyName && <p className="err">{errors.companyName}</p>}
          </div>

          <div>
            <label className="label" htmlFor="role">Role *</label>
            <input
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Full Stack Developer"
              className="input"
              aria-invalid={!!errors.role}
            />
            {errors.role && <p className="err">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="label" id="loc-label">Location</span>
              <div className="seg w-full" role="radiogroup" aria-labelledby="loc-label">
                {LOCATIONS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    role="radio"
                    aria-checked={form.locationType === l.value}
                    aria-selected={form.locationType === l.value}
                    onClick={() => set("locationType", l.value)}
                    className="flex-1 justify-center !px-2"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="appliedDate">Applied on *</label>
              <input
                id="appliedDate"
                type="date"
                name="appliedDate"
                value={form.appliedDate}
                onChange={handleChange}
                className="input"
                aria-invalid={!!errors.appliedDate}
              />
              {errors.appliedDate && <p className="err">{errors.appliedDate}</p>}
            </div>
          </div>

          {/* Optional details */}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="flex items-center gap-1.5 text-[13px] font-medium hover:underline"
            style={{ color: "var(--text-2)" }}
          >
            <ChevronDown size={15} style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            {showMore ? "Hide details" : "More details (optional)"}
          </button>

          {showMore && (
            <div className="space-y-4 modal-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange} className="input">
                    <option value="SAVED">Saved</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="salary">Salary</label>
                  <input id="salary" name="salary" value={form.salary} onChange={handleChange} placeholder="20 LPA" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="source">Source</label>
                  <input
                    id="source"
                    name="source"
                    list="source-options"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="LinkedIn, Referral..."
                    className="input"
                  />
                  <datalist id="source-options">
                    {SOURCES.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label" htmlFor="followUpDate">Follow-up date</label>
                  <div className="flex gap-2">
                    <input id="followUpDate" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} className="input" />
                    <button
                      type="button"
                      className="btn shrink-0"
                      onClick={() => set("followUpDate", inDays(7))}
                      title="Set follow-up to 7 days from today"
                    >
                      +7d
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="jobUrl">Job URL</label>
                <input id="jobUrl" name="jobUrl" value={form.jobUrl} onChange={handleChange} placeholder="https://..." className="input" />
              </div>

              <div>
                <label className="label" htmlFor="tags">Tags (comma separated)</label>
                <input id="tags" name="tags" value={form.tags} onChange={handleChange} placeholder="dream job, referral" className="input" />
              </div>

              <div>
                <label className="label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Interview notes, contacts..."
                  className="input"
                />
              </div>

              {/* Attachments (edit mode only) */}
              {isEditing && (
                <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="label">Attachments</span>

                  <div className="flex flex-col gap-2 mb-3">
                    {attachments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(a)}
                          className="flex items-center gap-2 truncate text-left hover:underline"
                        >
                          <Paperclip size={14} /> {a.fileName}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(a.id)}
                          className="text-[var(--danger)] hover:opacity-80"
                          aria-label={`Remove ${a.fileName}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {attachments.length === 0 && <p className="caption">No files uploaded yet.</p>}
                  </div>

                  <label
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl px-4 py-6 text-center cursor-pointer transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-[var(--accent)]"
                    style={{
                      border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                      background: dragging ? "var(--accent-soft)" : "var(--bg)",
                    }}
                  >
                    {uploading ? (
                      <span className="spinner" aria-hidden="true" />
                    ) : (
                      <UploadCloud size={22} style={{ color: dragging ? "var(--accent)" : "var(--text-2)" }} aria-hidden="true" />
                    )}
                    <span className="text-[13px] font-medium">
                      {uploading ? "Uploading…" : dragging ? "Drop files to upload" : "Drag & drop files here, or click to browse"}
                    </span>
                    <span className="caption">Resume, cover letter · max {MAX_FILE_MB} MB each</span>
                    <input type="file" multiple className="sr-only" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving && <span className="spinner" aria-hidden="true" />}
            {saving ? "Saving..." : "Save job"}
          </button>
        </div>
      </form>
    </div>
  );
}