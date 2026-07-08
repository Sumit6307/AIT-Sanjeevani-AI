"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { mvpApi } from "@/lib/mvp-api";
import { EMERGENCY_CALL_NUMBER } from "@/lib/triage";
import { useTranslation } from "@/components/language-provider";

const NAV_ITEMS = [
  { href: "/dashboard/patient", key: "nav.dashboard", icon: "📊" },
  { href: "/dashboard/patient/personal-info", key: "patient.personalInfoTitle", icon: "👤" },
  { href: "/dashboard/patient/prescriptions", key: "dashboard.sidebar.prescriptions", icon: "💊" },
  { href: "/dashboard/patient/pharmacies", key: "dashboard.sidebar.pharmacyLocator", icon: "🏪" },
  { href: "/dashboard/patient/emergency", key: "dashboard.sidebar.emergencyServices", icon: "🚨" },
  { href: "/dashboard/patient/consultations", key: "dashboard.sidebar.consultations", icon: "📅" },
  { href: "/dashboard/patient/symptom-checker", key: "patient.symptomsTab.title", icon: "🩺" },
  { href: "/dashboard/patient/records", key: "dashboard.sidebar.records", icon: "📋" },
];

type SosEmergencyType =
  | "CHEST_PAIN"
  | "BREATHING_DIFFICULTY"
  | "SEVERE_BLEEDING"
  | "STROKE_SYMPTOMS"
  | "ALLERGIC_REACTION"
  | "UNCONSCIOUSNESS"
  | "MENTAL_HEALTH_CRISIS"
  | "ACCIDENT_INJURY"
  | "OTHER";

const SOS_EMERGENCY_KEYS: SosEmergencyType[] = [
  "BREATHING_DIFFICULTY",
  "CHEST_PAIN",
  "SEVERE_BLEEDING",
  "STROKE_SYMPTOMS",
  "ALLERGIC_REACTION",
  "UNCONSCIOUSNESS",
  "MENTAL_HEALTH_CRISIS",
  "ACCIDENT_INJURY",
  "OTHER",
];

export default function PatientShell({
  children,
  userId,
  userName,
}: {
  children: React.ReactNode;
  userId: string;
  userName: string;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const shortName = userName.split(" ")[0] ?? userName;
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosEmergencyType, setSosEmergencyType] = useState<SosEmergencyType>("BREATHING_DIFFICULTY");
  const [sosDetails, setSosDetails] = useState("");
  const [sendingSosAlert, setSendingSosAlert] = useState(false);

  const openEmergencyDialer = () => {
    window.location.href = `tel:${EMERGENCY_CALL_NUMBER}`;
  };

  const triggerSosAlert = async () => {
    setSendingSosAlert(true);
    try {
      await mvpApi.post<{ ok: boolean }>("/patients/me/sos-alert", userId, {
        emergencyType: sosEmergencyType,
        details: sosDetails.trim() || undefined,
      });
      toast.success(
        t("auth.roleSelection") === "Select your workspace role"
          ? "SOS alert sent to admin. Calling emergency services now."
          : "प्रशासक को एसओएस अलर्ट भेजा गया। आपातकालीन सेवाओं को अभी कॉल कर रहे हैं।"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `${error.message}. ${
              t("auth.roleSelection") === "Select your workspace role"
                ? "Calling emergency services now."
                : "आपातकालीन सेवाओं को अभी कॉल कर रहे हैं।"
            }`
          : (t("auth.roleSelection") === "Select your workspace role"
              ? "SOS alert could not sync. Calling emergency services now."
              : "एसओएस अलर्ट सिंक नहीं हो सका। आपातकालीन सेवाओं को अभी कॉल कर रहे हैं।")
      );
    } finally {
      setSendingSosAlert(false);
      setShowSosModal(false);
      setSosDetails("");
      openEmergencyDialer();
    }
  };

  return (
    <>
      {showSosModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-none border-4 border-border bg-card p-4 shadow-[8px_8px_0px_0px_var(--shadow)]">
            <div className="text-lg font-black text-foreground">{t("sos.title")}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {t("sos.desc").replace("{{number}}", EMERGENCY_CALL_NUMBER)}
            </div>
            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("sos.typeLabel")}
                </label>
                <select
                  className="h-10 w-full rounded-none border-2 border-border bg-background px-3 text-sm outline-none focus:border-primary focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  value={sosEmergencyType}
                  onChange={(event) => setSosEmergencyType(event.target.value as SosEmergencyType)}
                >
                  {SOS_EMERGENCY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t(`sos.types.${key}` as any)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("sos.detailsLabel")}
                </label>
                <textarea
                  value={sosDetails}
                  onChange={(event) => setSosDetails(event.target.value)}
                  className="h-24 w-full rounded-none border-2 border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  placeholder={t("sos.placeholder")}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={sendingSosAlert}
                onClick={() => setShowSosModal(false)}
              >
                {t("sos.cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={sendingSosAlert}
                onClick={() => void triggerSosAlert()}
              >
                {sendingSosAlert ? t("sos.sending") : t("sos.sendSos").replace("{{number}}", EMERGENCY_CALL_NUMBER)}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid min-h-[calc(100svh-52px)] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r-2 border-border bg-card p-6 lg:sticky lg:top-0 lg:block lg:h-[calc(100svh-52px)]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-none border-2 border-border bg-primary text-xl font-black text-primary-foreground shadow-[2px_2px_0px_0px_var(--shadow)]">
              S
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-foreground leading-none">Sanjeevni</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("sos.portal")}</div>
            </div>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-none border-2 px-4 py-3 text-sm font-bold transition-all ${
                    active
                      ? "border-border bg-primary text-black shadow-[4px_4px_0px_0px_var(--shadow)] translate-x-[-2px] translate-y-[-2px]"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{t(item.key as any)}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-8 rounded-none border-2 border-border bg-emerald-light p-4 shadow-[4px_4px_0px_0px_var(--shadow)]">
            <div className="flex items-center gap-2 text-sm font-bold text-black">
              <span className="size-3 rounded-full bg-emerald border border-border" />
              {t("sos.offlineReady")}
            </div>
            <div className="mt-1 text-xs font-medium text-black">{t("sos.offlineSyncTip")}</div>
          </div>

          <Button
            className="mt-4 w-full bg-red text-white border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--shadow)]"
            onClick={() => setShowSosModal(true)}
          >
            🚨 {t("sos.title")}
          </Button>
        </aside>

        <main className="w-full overflow-x-hidden bg-background">
          <div className="border-b-2 border-border bg-card px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-none border-2 border-border bg-primary text-sm font-black text-primary-foreground shadow-[2px_2px_0px_0px_var(--shadow)]">
                  S
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-foreground">{t("sos.portal")}</div>
                  <div className="truncate text-xs font-medium text-muted-foreground">{shortName}</div>
                </div>
              </div>
              <Button
                size="xs"
                className="border-2 border-border bg-red text-white"
                onClick={() => setShowSosModal(true)}
              >
                SOS
              </Button>
            </div>
            <div className="mt-3 overflow-x-auto pb-1">
              <nav className="flex w-max gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <a
                      key={`mobile-${item.href}`}
                      href={item.href}
                      className={`flex items-center gap-1.5 rounded-none border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                        active
                          ? "border-border bg-primary text-black shadow-[3px_3px_0px_0px_var(--shadow)]"
                          : "border-transparent bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{t(item.key as any)}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-none border-2 border-border bg-emerald-light px-2.5 py-1 text-xs font-bold text-black shadow-[2px_2px_0px_0px_var(--shadow)]">
              <span className="size-2 rounded-full bg-emerald border border-border" />
              {t("sos.offlineReady")}
            </div>
          </div>

          <div className="hidden items-center justify-between border-b-2 border-border bg-card px-6 py-4 lg:flex">
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{t("sos.workspace")}</div>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-border bg-primary text-xs font-bold text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-foreground">{userName}</span>
            </div>
          </div>
          <div className="w-full px-4 py-4 sm:px-5 sm:py-5 lg:px-10 lg:py-6">{children}</div>
        </main>
      </div>
    </>
  );
}
