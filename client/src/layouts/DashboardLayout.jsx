
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Layers,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Search,
  Bell,
  Command,
  ChartNoAxesCombined,
  Menu,
  X
} from "lucide-react";

const navigation = [
  {
    section: "MONITORING",
    items: [
      { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
      { label: "Applications", path: "/applications", icon: Layers },
      { label: "Logs Explorer", path: "/logs", icon: Activity },
      { label: "Incidents", path: "/incidents", icon: AlertTriangle }
    ]
  },
  {
    section: "INSIGHTS",
    items: [
      { label: "Analytics", path: "/analytics", icon: ChartNoAxesCombined }
    ]
  },
  {
    section: "PREFERENCES",
    items: [
      { label: "Settings", path: "/settings", icon: Settings }
    ]
  }
];

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentPage =
    navigation.flatMap((section) => section.items).find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== "/dashboard" &&
          location.pathname.startsWith(`${item.path}/`))
    )?.label || "Workspace";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarWidth = collapsed ? "lg:w-[76px]" : "lg:w-[250px]";

  return (
    <div className="min-h-screen bg-canvas text-primary">

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "lg:w-[76px]" : "w-[260px]"}
          `}
      >

        {/* Brand */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border px-5">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 overflow-hidden"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck size={21} strokeWidth={2.2} />
            </span>

            {!collapsed && (
              <span className="text-[16px] font-bold tracking-tight">
                Sentinel<span className="text-accent">Ops</span>
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="hidden rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-primary lg:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-muted hover:bg-surface-hover lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace selector */}
        {!collapsed && (
          <div className="border-b border-border p-4">
            <button className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-3 text-left transition hover:bg-surface-hover">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                  SO
                </div>

                <div>
                  <p className="text-xs font-semibold">My Workspace</p>
                  <p className="mt-1 text-[11px] text-muted">
                    Personal workspace
                  </p>
                </div>
              </div>

              <ChevronDown size={15} className="text-muted" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigation.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-semibold tracking-[1.5px] text-muted">
                  {section.section}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/dashboard"}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg px-3 py-[10px] text-[13px] font-medium transition-all ${
                          collapsed ? "justify-center" : ""
                        } ${
                          isActive
                            ? "bg-accent/10 text-accent"
                            : "text-secondary hover:bg-surface-hover hover:text-primary"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-r-full bg-accent" />
                          )}

                          <Icon
                            size={18}
                            strokeWidth={1.8}
                            className="shrink-0"
                          />

                          {!collapsed && <span>{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-success/5 px-3 py-2.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-[11px] font-medium text-success">
                Monitoring workspace
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[13px] text-secondary transition hover:bg-danger/5 hover:text-danger ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={17} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main application */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"
        }`}
      >

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur-xl sm:px-7">

          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-secondary hover:bg-surface-hover lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="hidden text-[10px] text-muted sm:block">
                My Workspace
              </p>
              <h1 className="truncate text-sm font-semibold tracking-tight sm:mt-1">
                {currentPage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">

            {/* Search UI */}
            <button
              onClick={() => window.dispatchEvent(new Event("sentinel:search"))}
              className="hidden h-9 w-48 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-left text-xs text-muted transition hover:border-secondary/40 md:flex lg:w-64"
            >
              <Search size={15} />
              <span className="flex-1">Search workspace...</span>
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">
                <Command size={10} className="inline" /> K
              </kbd>
            </button>

            <button
              title="Notifications"
              className="relative rounded-lg p-2 text-secondary transition hover:bg-surface-hover hover:text-primary"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>

            <div className="relative border-l border-border pl-3 sm:pl-4">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 rounded-lg p-1 transition hover:bg-surface-hover"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-bold text-accent">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted">
                    {user?.email || ""}
                  </p>
                </div>

                <ChevronDown size={14} className="hidden text-muted sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl border border-border bg-surface p-2 shadow-2xl">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-xs font-semibold">
                      {user?.name}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-muted">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-danger transition hover:bg-danger/10"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
