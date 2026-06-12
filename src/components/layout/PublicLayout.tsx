import { Outlet, Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import LanguageSwitcher from "../shared/LanguageSwitcher";

export default function PublicLayout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
              BQ
            </div>
            <span className="font-semibold text-gray-900">
              {t.common.appName}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login" className="btn-secondary text-sm px-3 py-1.5">
              {t.auth.login}
            </Link>
            <Link to="/register" className="btn-primary text-sm px-3 py-1.5">
              {t.auth.register}
            </Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
