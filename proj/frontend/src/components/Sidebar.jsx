import { NavLink } from "react-router-dom";
import { LayoutDashboard, Kanban, ChartLine, Zap, LogOut, Sparkles, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useAuth } from "../context/useAuth";

const NAV = [
  { to: "/", label: "Applications", icon: LayoutDashboard, end: true },
  { to: "/kanban", label: "Kanban Board", icon: Kanban },
  { to: "/ai-suite", label: "AI Career Copilot", icon: Sparkles, isAi: true },
  { to: "/analytics", label: "Analytics", icon: ChartLine },
];

const Sidebar = ({ open, onToggle }) => {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside
      aria-label="Primary"
      className="sidebar-rail"
      style={{
        width: open ? 260 : 72,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
        overflow: "visible", // lets the arrow sit on the edge without being clipped
      }}
    >
      <div>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <Zap size={22} fill="currentColor" strokeWidth={0} className="shrink-0" />
            <span className="sidebar-label">{open ? "JobTracker" : ""}</span>
          </div>
        </div>

        {open && <p className="caption px-3 mb-2" style={{ opacity: open ? 1 : 0, transition: "opacity 0.2s" }}>Main menu</p>}

        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end, isAi }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""} ${isAi ? "relative" : ""} ${!open ? "nav-link-collapsed" : ""}`
              }
            >
              <Icon size={17} className={`shrink-0 ${isAi ? "text-[var(--accent)]" : ""}`} />
              {open && (
                <span className="sidebar-label">{label}</span>
              )}
              {open && isAi && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/30 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Collapse / expand arrow: middle of the sidebar's right edge */}
      <button
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
        style={{
          position: "absolute",
          top: "50%",
          right: -14,
          transform: "translateY(-50%)",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "var(--sidebar)",
          border: "1px solid var(--border)",
          color: "#a1a1aa",
          cursor: "pointer",
          zIndex: 40,
          padding: 0,
        }}
      >
        {open ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
      </button>

      {/* User card at bottom */}
      <div>
        <div
          className="sidebar-user-card"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            {initials}
          </div>
          {open && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name || "You"}</p>
              <p className="caption truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="btn btn-ghost btn-icon btn-sm"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;