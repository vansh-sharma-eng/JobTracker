import { MapPin, CalendarDays, Tag as TagIcon, BellRing, ExternalLink, Paperclip, Pencil, Trash2, Briefcase, CalendarPlus } from "lucide-react";
import { getGoogleCalendarLink } from "../api/integrations";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const isFollowUpDue = (dateStr) => {
  if (!dateStr) return false;
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  return new Date(dateStr) <= soon;
};

const handleCalendarSync = async (jobId) => {
  try {
    const { calendarUrl } = await getGoogleCalendarLink(jobId);
    if (calendarUrl) window.open(calendarUrl, "_blank", "noopener,noreferrer");
  } catch {
    toast.error("Could not generate calendar link");
  }
};

const StatusSelect = ({ job, onStatusChange }) => (
  <div className="relative inline-block">
    <select
      value={job.status}
      onChange={(e) => onStatusChange(job.id, e.target.value)}
      aria-label={`Status for ${job.companyName}`}
      className={`badge badge-${job.status.toLowerCase()} appearance-none cursor-pointer pr-2 outline-none border-0`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} style={{ background: "#1a1a1d", color: "#f4f4f5" }}>{label(s)}</option>
      ))}
    </select>
  </div>
);

const Company = ({ job }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div className="h-9 w-9 rounded-lg flex items-center justify-center font-semibold shrink-0" style={{ background: "var(--surface-3)" }}>
      {job.companyName?.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="font-medium truncate">{job.companyName}</span>
        {job.jobUrl && (
          <a href={job.jobUrl} target="_blank" rel="noreferrer" aria-label={`Open ${job.companyName} listing`} style={{ color: "var(--text-3)" }} className="hover:text-white shrink-0">
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <p className="caption truncate">{job.role}</p>
    </div>
  </div>
);

const Extras = ({ job }) => (
  <>
    {job.tags?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        {job.tags.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border" style={{ borderColor: t.color, color: t.color }}>
            <TagIcon size={10} />{t.name}
          </span>
        ))}
      </div>
    )}
    {isFollowUpDue(job.followUpDate) && job.status !== "REJECTED" && (
      <p className="flex items-center gap-1 mt-1 text-[12px]" style={{ color: "var(--warning)" }}>
        <BellRing size={12} /> Follow up by {job.followUpDate}
      </p>
    )}
  </>
);

const Actions = ({ job, onEdit, onDelete }) => (
  <div className="flex justify-end items-center gap-1">
    {job.status === "INTERVIEW" && (
      <button
        className="btn btn-ghost btn-icon btn-sm text-[var(--accent)] hover:!text-white"
        onClick={() => handleCalendarSync(job.id)}
        aria-label={`Sync interview with Google Calendar`}
        title="Sync to Google Calendar"
      >
        <CalendarPlus size={15} />
      </button>
    )}
    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(job)} aria-label={`Edit ${job.companyName}`}><Pencil size={15} /></button>
    <button className="btn btn-ghost btn-icon btn-sm hover:!text-red-400" onClick={() => onDelete(job.id)} aria-label={`Remove ${job.companyName}`}><Trash2 size={15} /></button>
  </div>
);

const JobSection = ({ jobs = [], onEdit, onDelete, onStatusChange, loading, onAdd }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3" aria-busy="true" aria-label="Loading applications">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-11 w-full" />)}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--surface-3)" }}>
          <Briefcase size={22} style={{ color: "var(--text-2)" }} />
        </div>
        <p className="font-medium">No applications found</p>
        <p className="caption mt-1 mb-4">Add your first application, or clear the current search and filters.</p>
        {onAdd && <button className="btn btn-primary" onClick={onAdd}>Add job</button>}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="table-wrap hidden md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th><th>Status</th><th>Location</th><th>Applied</th><th>Salary</th><th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="max-w-[320px]"><Company job={job} /><Extras job={job} /></td>
                <td><StatusSelect job={job} onStatusChange={onStatusChange} /></td>
                <td style={{ color: "var(--text-2)" }} className="capitalize whitespace-nowrap">{job.locationType?.toLowerCase()}</td>
                <td style={{ color: "var(--text-2)" }} className="whitespace-nowrap">
                  {job.appliedDate}
                  {job.attachments?.length > 0 && <span className="ml-2 inline-flex items-center gap-1 caption"><Paperclip size={12} />{job.attachments.length}</span>}
                </td>
                <td style={{ color: "var(--text-2)" }} className="whitespace-nowrap">{job.salary ? `₹ ${job.salary}` : "—"}</td>
                <td><Actions job={job} onEdit={onEdit} onDelete={onDelete} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {jobs.map((job) => (
          <li key={job.id} className="p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between gap-3">
              <Company job={job} />
              <StatusSelect job={job} onStatusChange={onStatusChange} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 caption">
              <span className="inline-flex items-center gap-1 capitalize"><MapPin size={12} />{job.locationType?.toLowerCase()}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{job.appliedDate}</span>
              {job.salary && <span>₹ {job.salary}</span>}
            </div>
            <Extras job={job} />
            <Actions job={job} onEdit={onEdit} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default JobSection;
