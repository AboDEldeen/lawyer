"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { translations, type Language } from "@/lib/i18n/translations";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
  dir: "rtl",
  isArabic: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("lang") as Language | null;
      if (saved === "ar" || saved === "en") {
        setLangState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, mounted]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("lang", newLang);
    } catch {}
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  }, []);

  const t = useCallback(
    (key: string): string => {
      try {
        const dict = translations[lang] as Record<string, unknown>;
        if (dict && typeof dict[key] === "string") return dict[key] as string;

        // fallback to Arabic
        const arDict = translations["ar"] as Record<string, unknown>;
        if (arDict && typeof arDict[key] === "string") return arDict[key] as string;
      } catch {}
      return key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        dir: lang === "ar" ? "rtl" : "ltr",
        isArabic: lang === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
