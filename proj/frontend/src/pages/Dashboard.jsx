import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import Header from "../components/Header";
import StatsSection from "../components/StatsSection";
import JobSection from "../components/JobSection";
import FilterTabs from "../components/FilterTabs";
import AddJobModal from "../components/AddJobForm";
import { fetchJobs, fetchStats, createJob, updateJob, updateJobStatus, deleteJob, exportCsv } from "../api/jobs";
import { useDebounce } from "../hooks/useDebounce";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [activeStatus, setActiveStatus] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 20, sort: "createdAt,desc" };
      if (debouncedSearch) params.search = debouncedSearch;
      if (activeStatus) params.status = activeStatus;

      const data = await fetchJobs(params);
      setJobs(data.content);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Could not load applications");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeStatus, page]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // stats are non-critical, fail silently
    }
  }, []);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, activeStatus]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshAll = () => {
    loadJobs();
    loadStats();
  };

  const handleSave = async (payload, jobId) => {
    if (jobId) {
      await updateJob(jobId, payload);
    } else {
      await createJob(payload);
    }
    refreshAll();
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteJob(jobId);
      toast.success("Application removed");
      refreshAll();
    } catch {
      toast.error("Could not delete application");
    }
  };

  const handleStatusChange = async (jobId, status) => {
    try {
      await updateJobStatus(jobId, status);
      refreshAll();
    } catch {
      toast.error("Could not update status");
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setOpenModal(true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "job-applications.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Export failed");
    }
  };

  const counts = stats
    ? {
        total: stats.totalApplied,
        SAVED: stats.statusBreakdown?.SAVED || 0,
        APPLIED: stats.statusBreakdown?.APPLIED || 0,
        INTERVIEW: stats.interview,
        OFFER: stats.offer,
        REJECTED: stats.rejected,
      }
    : {};

  return (
    <>
      <Header
        onAddClick={() => { setEditingJob(null); setOpenModal(true); }}
        search={search}
        onSearchChange={setSearch}
        onExport={handleExport}
        title="Applications"
        subtitle="Track every application in one place"
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsSection
            loading={!stats}
            interview={stats?.interview ?? 0}
            Nocard={stats?.totalApplied ?? 0}
            Offer={stats?.offer ?? 0}
            successRate={stats?.successRate ?? 0}
          />
        </div>

        <section className="card overflow-hidden" aria-label="Applications">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="card-title">{counts.total ?? 0} applications</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="search md:hidden">
                <Search size={16} aria-hidden="true" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company or role…" aria-label="Search applications" />
              </label>
              <FilterTabs counts={counts} activeStatus={activeStatus} onSelect={setActiveStatus} />
            </div>
          </div>

          <JobSection
            jobs={jobs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAdd={() => { setEditingJob(null); setOpenModal(true); }}
          />

          {totalPages > 1 && (
            <nav className="flex items-center justify-between gap-3 p-4" style={{ borderTop: "1px solid var(--border)" }} aria-label="Pagination">
              <span className="caption">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</button>
                <button className="btn btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </nav>
          )}
        </section>
      </main>

      {openModal && (
        <AddJobModal
          job={editingJob}
          onClose={() => { setOpenModal(false); setEditingJob(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default Dashboard;
