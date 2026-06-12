import { en } from "./en";
import { vi } from "./vi";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "vi";
const translations = { en, vi };

interface I18nStore {
  language: Language;
  t: typeof en;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: (navigator.language.startsWith("vi") ? "vi" : "en") as Language,
      t: translations[navigator.language.startsWith("vi") ? "vi" : "en"],
      setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
    }),
    { name: "biomedqa-language" },
  ),
);

export type { Language };
