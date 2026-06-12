import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Users, Database, ArrowLeft } from "lucide-react";
import { useI18n } from "../../i18n";
import { cn } from "../../lib/utils";

export default function AdminLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin", end: true, icon: BarChart3, label: t.admin.analytics },
    { to: "/admin/users", icon: Users, label: t.admin.users },
    { to: "/admin/datasets", icon: Database, label: t.admin.datasets },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900">
            {t.admin.dashboard}
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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

        <div className="border-t border-gray-200 p-3">
          <button
            onClick={() => navigate("/app/ask")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
            {t.nav.dashboard}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
