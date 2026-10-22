import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./Sidebar";
import { MenuContext } from "./menuContext";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar-open");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <MenuContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
        <div
          className="min-h-screen flex flex-col"
          style={{
            marginLeft: sidebarOpen ? 260 : 72,
            transition: "margin-left 0.35s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Toaster
            position="bottom-right"
            toastOptions={{ style: { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" } }}
          />
          <Outlet />
        </div>
      </div>
    </MenuContext.Provider>
  );
};

export default Layout;
