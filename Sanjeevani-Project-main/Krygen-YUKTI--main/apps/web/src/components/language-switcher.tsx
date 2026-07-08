"use client";

import { useTranslation } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 border-2 border-black bg-white dark:bg-[#1E1E1E] text-black dark:text-white text-xs font-black uppercase px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all h-9"
      aria-label="Toggle Language"
    >
      {language === "en" ? (
        <>
          <span className="text-sm">🇺🇸</span>
          <span>English</span>
        </>
      ) : (
        <>
          <span className="text-sm">🇮🇳</span>
          <span>हिन्दी</span>
        </>
      )}
    </button>
  );
}
export default LanguageSwitcher;
