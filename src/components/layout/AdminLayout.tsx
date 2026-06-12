import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Users, Settings, ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/i18n";
import api from "@/services/api";
import Sidebar, { type SidebarNavItem } from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    logout();
    navigate("/auth/login");
  }

  const navItems: SidebarNavItem[] = [
    { to: "/admin", end: true, icon: BarChart3, label: t.admin.analytics },
    { to: "/admin/users", icon: Users, label: t.admin.users },
    { to: "/admin/settings", icon: Settings, label: t.nav.administration },
  ];

  const header = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <span className="truncate font-semibold text-gray-900">{t.nav.administration}</span>
    </>
  );

  const footer = (
    <div className="space-y-2">
      <button
        onClick={() => navigate("/app/dashboard")}
        title={t.layout.backToApp}
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{t.layout.backToApp}</span>}
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
          {user?.fullName?.[0]?.toUpperCase() ?? "U"}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900">{user?.fullName}</p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title={t.layout.signOut}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        navItems={navItems}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        header={header}
        footer={footer}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} profilePath="/app/profile" />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
