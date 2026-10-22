import { useState, useEffect } from "react";
import { Search, Plus, Download, Mail, Bell } from "lucide-react";
import { getReminders } from "../api/integrations";
import GmailSyncModal from "./GmailSyncModal";

const Header = ({
  onAddClick,
  search,
  onSearchChange,
  onExport,
  title = "Applications",
  subtitle = "",
  onSyncSuccess,
}) => {
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showRemindersDropdown, setShowRemindersDropdown] = useState(false);

  const loadReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data || []);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 h-[68px] backdrop-blur-md"
        style={{ background: "rgba(18,18,20,.85)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">{title}</h1>
            {subtitle && <p className="caption truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSearchChange && (
            <label className="search w-[180px] md:w-[240px] hidden md:flex">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search company or role…"
                aria-label="Search applications"
              />
            </label>
          )}

          {/* Gmail Auto-Sync Trigger */}
          <button
            onClick={() => setShowGmailModal(true)}
            className="btn btn-ghost btn-sm flex items-center gap-1.5"
            title="Gmail auto-status sync"
          >
            <Mail size={15} className="text-red-400" />
            <span className="hidden xl:inline text-xs">Gmail Sync</span>
          </button>

          {/* Reminders Bell with active count */}
          <div className="relative">
            <button
              onClick={() => setShowRemindersDropdown((v) => !v)}
              className="btn btn-ghost btn-icon btn-sm relative"
              aria-label="View follow-up reminders"
              title="Follow-up reminders"
            >
              <Bell size={16} />
              {reminders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center animate-pulse">
                  {reminders.length}
                </span>
              )}
            </button>

            {showRemindersDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] shadow-2xl p-3 z-50 modal-in space-y-2 text-xs"
                onMouseLeave={() => setShowRemindersDropdown(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] font-semibold text-white">
                  <span>Due Follow-ups ({reminders.length})</span>
                  <span className="caption text-[10px]">Background Cron</span>
                </div>
                {reminders.length === 0 ? (
                  <p className="caption py-2 text-center">No overdue follow-ups</p>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {reminders.map((r) => (
                      <div
                        key={r.id}
                        className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-0.5"
                      >
                        <p className="font-semibold text-white truncate">{r.companyName} — {r.role}</p>
                        <p className="text-amber-400 text-[11px]">Due: {r.followUpDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {onExport && (
            <button onClick={onExport} className="btn btn-sm" aria-label="Export as CSV" title="Export applications to CSV">
              <Download size={15} /> <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {onAddClick && (
            <button onClick={onAddClick} className="btn btn-primary btn-sm">
              <Plus size={15} /> <span>Add job</span>
            </button>
          )}
        </div>
      </header>

      {showGmailModal && (
        <GmailSyncModal
          onClose={() => setShowGmailModal(false)}
          onSyncSuccess={() => {
            if (onSyncSuccess) onSyncSuccess();
            loadReminders();
          }}
        />
      )}
    </>
  );
};

export default Header;
