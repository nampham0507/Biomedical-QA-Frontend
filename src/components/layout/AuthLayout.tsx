import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { FlaskConical, ShieldCheck, Sparkles, BookOpenCheck } from "lucide-react";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

const FEATURES = [
  { icon: Sparkles, key: "ai" as const },
  { icon: BookOpenCheck, key: "sources" as const },
  { icon: ShieldCheck, key: "trust" as const },
];

export default function AuthLayout() {
  const { t } = useI18n();

  const featureCopy: Record<(typeof FEATURES)[number]["key"], { title: string; description: string }> = {
    ai: { title: t.authLayout.featureAiTitle, description: t.authLayout.featureAiDesc },
    sources: { title: t.authLayout.featureSourcesTitle, description: t.authLayout.featureSourcesDesc },
    trust: { title: t.authLayout.featureTrustTitle, description: t.authLayout.featureTrustDesc },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
            <FlaskConical className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">{t.common.appName}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md"
        >
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary-100">
            {t.layout.clinicalAuthority}
          </p>
          <h1 className="mb-4 text-3xl font-semibold leading-tight">{t.layout.tagline}</h1>

          <div className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, key }, idx) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{featureCopy[key].title}</p>
                  <p className="text-sm text-primary-100/90">{featureCopy[key].description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-primary-100/70">
          © {new Date().getFullYear()} {t.common.appName}. {t.authLayout.footerNote}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col px-4 py-6 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <FlaskConical className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-gray-900">{t.common.appName}</span>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
