import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { Sparkles, TrendingUp, Users, CheckCircle, ArrowDownRight, Layers } from "lucide-react";
import Header from "../components/Header";
import { fetchAnalytics } from "../api/analytics";

const STATUS_COLORS = {
  SAVED: "#a855f7",
  APPLIED: "#60a5fa",
  INTERVIEW: "#fbbf24",
  OFFER: "#34d399",
  REJECTED: "#f87171",
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(90);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAnalytics(daysBack);
      setData(result);
    } catch {
      toast.error("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <>
        <Header title="Analytics & Product Insights" subtitle="Data-driven intelligence across your entire job pipeline" />
        <div className="p-6 text-[var(--text-2)] text-sm" aria-busy="true">Loading analytics…</div>
      </>
    );
  }

  const pieData = Object.entries(data.statusBreakdown || {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const sourceData = Object.entries(data.applicationsBySource || {}).map(([source, count]) => ({
    source,
    count,
  }));

  const _locationData = Object.entries(data.applicationsByLocationType || {}).map(([type, count]) => ({
    type,
    count,
  }));

  const funnelData = data.recruitmentFunnel || [];

  return (
    <>
      <Header title="Analytics & Product Insights" subtitle="Funnel drop-off, weekly application trends, and smart actionable recommendations" />

      <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Pipeline Performance Overview</h2>
            <p className="caption text-xs">Tracking conversion ratios and recruiter response velocity</p>
          </div>
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="input !w-auto text-xs"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-blue-500">
            <p className="text-xs text-[var(--text-2)] font-medium">Recruiter Response Rate</p>
            <h2 className="text-3xl font-bold mt-1 text-blue-400">{data.responseRate ?? 0}%</h2>
            <p className="caption text-[11px] mt-1">Applications that received a response</p>
          </div>
          <div className="card p-5 border-l-4 border-l-amber-500">
            <p className="text-xs text-[var(--text-2)] font-medium">Interview Conversion</p>
            <h2 className="text-3xl font-bold mt-1 text-amber-400">{data.interviewRate ?? 0}%</h2>
            <p className="caption text-[11px] mt-1">Applied → Interview invite rate</p>
          </div>
          <div className="card p-5 border-l-4 border-l-emerald-500">
            <p className="text-xs text-[var(--text-2)] font-medium">Offer Rate</p>
            <h2 className="text-3xl font-bold mt-1 text-emerald-400">{data.offerRate ?? 0}%</h2>
            <p className="caption text-[11px] mt-1">Overall pipeline to offer conversion</p>
          </div>
          <div className="card p-5 border-l-4 border-l-purple-500">
            <p className="text-xs text-[var(--text-2)] font-medium">Ghosting Rate</p>
            <h2 className="text-3xl font-bold mt-1 text-purple-400">{data.ghostRate ?? 0}%</h2>
            <p className="caption text-[11px] mt-1">Pending/unresponsive submissions</p>
          </div>
        </div>

        {/* Actionable Product Insights */}
        {data.actionableInsights?.length > 0 && (
          <div className="card p-5 bg-gradient-to-r from-indigo-950/30 via-[var(--surface)] to-transparent border border-[var(--accent)]/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles size={18} className="text-[var(--accent)]" />
              <span>Smart Product Insights & Pipeline Analytics</span>
              <span className="badge badge-interview text-[10px] ml-auto">AI Heuristics</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.actionableInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 flex items-start gap-2.5"
                >
                  <TrendingUp size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recruitment Funnel Drop-Off Section */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent)]" /> Recruitment Funnel & Drop-Off Analysis
              </h3>
              <p className="caption text-xs mt-0.5">Stage-by-stage pipeline throughput and attrition rate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {funnelData.map((stage, idx) => (
              <div
                key={stage.stage}
                className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-[var(--text-2)]">
                    {stage.stage}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5">
                    {stage.count} roles
                  </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, stage.conversionRate)}%`,
                      background: idx === 0 ? "#a855f7" : idx === 1 ? "#60a5fa" : idx === 2 ? "#fbbf24" : "#34d399",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="caption">
                    {idx === 0 ? "Initial pipeline" : `${stage.conversionRate}% from prev`}
                  </span>
                  {stage.dropOffCount > 0 && (
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <ArrowDownRight size={11} /> -{stage.dropOffCount} drop
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications per week */}
          <div className="card p-5">
            <h3 className="card-title mb-4">Applications per week</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.applicationsPerWeek || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c31" />
                <XAxis dataKey="week" stroke="#8a8a94" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8a8a94" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#222226", border: "1px solid #3d3d44", borderRadius: 10, color: "#f4f4f5" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Applications over time */}
          <div className="card p-5">
            <h3 className="card-title mb-4">Applications over time (Daily)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c31" />
                <XAxis dataKey="date" stroke="#8a8a94" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8a8a94" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#222226", border: "1px solid #3d3d44", borderRadius: 10, color: "#f4f4f5" }} />
                <Line type="monotone" dataKey="count" stroke="#8b7cf6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status breakdown pie */}
          <div className="card p-5">
            <h3 className="card-title mb-4">Status distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={64} outerRadius={94} paddingAngle={3} stroke="none">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#8b7cf6"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#222226", border: "1px solid #3d3d44", borderRadius: 10, color: "#f4f4f5" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Applications by source */}
          <div className="card p-5">
            <h3 className="card-title mb-4">Pipeline by Source</h3>
            {sourceData.length === 0 ? (
              <p className="text-[var(--text-3)] text-sm py-12 text-center">No source data yet — tag sources like LinkedIn, Referral, or Naukri.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2c31" />
                  <XAxis dataKey="source" stroke="#8a8a94" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#8a8a94" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#222226", border: "1px solid #3d3d44", borderRadius: 10, color: "#f4f4f5" }} />
                  <Bar dataKey="count" fill="#8b7cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Analytics;
