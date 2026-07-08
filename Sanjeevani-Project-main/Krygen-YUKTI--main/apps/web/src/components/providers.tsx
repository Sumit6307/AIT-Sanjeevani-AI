"use client";

import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        {children}
        <Toaster richColors />
      </LanguageProvider>
    </ThemeProvider>
  );
}
