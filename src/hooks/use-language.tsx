import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Language = "en" | "hi";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  aqi: "AQI",
  aqi_full: "Air Quality Index",
  aqi_long: "Air Quality Level",
  dashboard: "Dashboard",
  hyperlocal_map: "Hyperlocal AQI Map",
  region_delhi_ncr: "Delhi-NCR Region",
  good: "Good",
  moderate: "Moderate",
  unhealthy: "Unhealthy",
  severe: "Severe",
  status: "Status",
  zone: "Zone",
  select_zone: "Select Zone",
  delhi: "Delhi",
  gurgaon: "Gurgaon",
  noida: "Noida",
  current_aqi: "Current AQI",
  updated: "Updated",
  forecast_title: "AQI Forecast",
  baseline: "Baseline",
};

const hi: Dictionary = {
  aqi: "वायु गुणवत्ता सूचकांक",
  aqi_full: "वायु गुणवत्ता सूचकांक",
  aqi_long: "वायु गुणवत्ता स्तर",
  dashboard: "डैशबोर्ड",
  hyperlocal_map: "हाइपरलोकल वायु गुणवत्ता मानचित्र",
  region_delhi_ncr: "दिल्ली-एनसीआर क्षेत्र",
  good: "अच्छा",
  moderate: "मध्यम",
  unhealthy: "अस्वस्थ",
  severe: "गंभीर",
  status: "स्थिति",
  zone: "क्षेत्र",
  select_zone: "क्षेत्र चुनें",
  delhi: "दिल्ली",
  gurgaon: "गुरुग्राम",
  noida: "नोएडा",
  current_aqi: "वर्तमान वायु गुणवत्ता सूचकांक",
  updated: "अपडेट किया गया",
  forecast_title: "वायु गुणवत्ता पूर्वानुमान",
  baseline: "आधार",
};

const dictionaries: Record<Language, Dictionary> = { en, hi };

type LanguageContextType = {
  lang: Language;
  toggle: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  const toggle = useCallback(() => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang];
      return dict[key] ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, toggle, t }), [lang, toggle, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


