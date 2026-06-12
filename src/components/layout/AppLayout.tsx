import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  History,
  Heart,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useI18n } from "../../i18n";
import LanguageSwitcher from "../shared/LanguageSwitcher";
import api from "../../services/api";
import { cn } from "../../lib/utils";

export default function AppLayout() {
  const { t } = useI18n();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
    navigate("/login");
  }

  const navItems = [
    { to: "/app/ask", icon: MessageSquare, label: t.nav.ask },
    { to: "/app/history", icon: History, label: t.nav.history },
    { to: "/app/favorites", icon: Heart, label: t.nav.favorites },
    { to: "/app/profile", icon: User, label: t.nav.profile },
    ...(user?.role === "admin"
      ? [{ to: "/admin", icon: Shield, label: t.nav.admin }]
      : []),
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
            BQ
          </div>
          <span className="font-semibold text-gray-900">
            {t.common.appName}
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-2">
          <LanguageSwitcher />
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
