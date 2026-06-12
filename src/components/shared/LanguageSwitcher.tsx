import { useI18n } from "../../i18n";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
      {(["en", "vi"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-2.5 py-1 font-medium transition-colors ${
            language === lang
              ? "bg-primary-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
