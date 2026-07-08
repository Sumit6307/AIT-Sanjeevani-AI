"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";

export type LanguageCode = "en" | "hi";

const dictionaries = {
  en,
  hi,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  formatDate: (dateInput: string | Date | null | undefined) => string;
  formatCurrency: (paise: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Load language preference from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sanjeevni-language") as LanguageCode | null;
    if (saved && (saved === "en" || saved === "hi")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("sanjeevni-language", lang);
  };

  const t = (key: string): string => {
    const dictionary = dictionaries[language] || en;
    return getNestedValue(dictionary, key);
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return "";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    
    if (language === "hi") {
      // Return Hindi formatted date string
      return date.toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (paise: number): string => {
    const rupees = paise / 100;
    if (language === "hi") {
      return `₹${rupees.toLocaleString("en-IN")}`;
    }
    return `₹${rupees.toFixed(2)}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
