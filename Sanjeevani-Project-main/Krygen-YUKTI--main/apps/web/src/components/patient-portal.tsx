"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { env } from "@my-better-t-app/env/web";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "./language-provider";
import { mvpApi } from "@/lib/mvp-api";
import PharmacyLocator from "./pharmacy-locator";
import EmergencyHub from "./emergency-hub";
import {
  getPatientRecordsOffline,
  getRecentSymptomChecksOffline,
  savePatientRecordsOffline,
  saveSymptomCheckOffline,
} from "@/lib/offline-db";
import {
  EMERGENCY_CALL_NUMBER,
  normalizeSymptomTriage,
  triageLevelClassName,
  triageLevelLabel,
  type SymptomTriage,
} from "@/lib/triage";
import {
  prescriptionLanguageOptions,
  timingSlotDisplay,
  type PrescriptionLanguageCode,
  type SimplifiedPrescriptionSummary,
} from "@/lib/prescription-visual";

type PortalSection = "overview" | "consultations" | "symptoms" | "records" | "prescriptions" | "personal-info" | "pharmacy-locator" | "emergency-services";

type MeUser = {
  id: string;
  name: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN";
  patient: {
    age: number | null;
    gender: string | null;
    bloodGroup: string | null;
    village: string | null;
    languagePreference: string | null;
  } | null;
};

type DoctorListing = {
  id: string;
  specialty: string;
  languages: string[];
  consultationFeePaise: number;
  user: {
    name: string;
  };
};

type Appointment = {
  id: string;
  scheduledAt: string;
  status: "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  callMode: "VIDEO" | "AUDIO" | "CHAT";
  callRoomId: string;
  consultationUi?: string | null;
  prescription?: {
    id: string;
    qrToken: string;
    createdAt: string;
  } | null;
  doctor?: {
    user?: {
      name?: string;
    };
  };
};

type Prescription = {
  id: string;
  createdAt: string;
  diagnosis: string;
  symptoms: string;
  notes: string | null;
  followUpDate: string | null;
  qrToken: string;
  appointment?: {
    scheduledAt: string;
    status: "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    callMode?: "VIDEO" | "AUDIO" | "CHAT";
  };
  doctor: {
    user: {
      name: string;
    };
  };
  items: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions: string | null;
  }>;
};

type ReportItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  createdAt: string;
};

type SymptomHistoryItem = {
  id?: number;
  symptoms: string;
  response: SymptomTriage;
  createdAt: string;
};

type PrayagrajMedicineAvailability = {
  medicine_requested: string;
  status: "Available" | "Alternative Available" | "Not Available";
  exact_match: {
    pharmacy_name: string;
    area: string;
    stock: number;
    price: number;
  };
  alternatives: Array<{
    brand_name: string;
    generic_name: string;
    pharmacy_name: string;
    area: string;
    stock: number;
    price: number;
  }>;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const dayTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dayTimeFormatter.format(date);
}

function doctorRating(name: string) {
  const seed = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return (4.1 + (seed % 8) * 0.1).toFixed(1);
}

function specialtyYears(name: string) {
  const seed = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return 7 + (seed % 9);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function appointmentStatusClassName(value: Appointment["status"]) {
  if (value === "BOOKED") return "bg-sky-100 text-sky-900";
  if (value === "IN_PROGRESS") return "bg-red-100 text-red-800";
  if (value === "COMPLETED") return "bg-emerald-100 text-emerald-900";
  if (value === "CANCELLED") return "bg-zinc-200 text-zinc-800";
  return "bg-amber-100 text-amber-900";
}

function languagePreferenceToCode(value: string | null | undefined): PrescriptionLanguageCode {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.startsWith("hi")) return "hi";
  if (normalized.startsWith("ta")) return "ta";
  if (normalized.startsWith("bn")) return "bn";
  return "en";
}

function dosageTimingClass(icon: string) {
  if (icon.includes("☀️")) return "border-amber-200 bg-amber-50 text-amber-900";
  if (icon.includes("🌤️")) return "border-orange-200 bg-orange-50 text-orange-900";
  if (icon.includes("🌙") || icon.includes("🛌")) return "border-indigo-200 bg-indigo-50 text-indigo-900";
  if (icon.includes("🕒")) return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-zinc-200 bg-zinc-50 text-zinc-900";
}

function primaryTimingIcon(icon: string) {
  if (icon.includes("☀️")) return "☀️";
  if (icon.includes("🌤️")) return "🌤️";
  if (icon.includes("🌙")) return "🌙";
  if (icon.includes("🛌")) return "🌙";
  if (icon.includes("🕒")) return "🕒";
  return "📌";
}

function splitTimingLabel(label: string) {
  const parts = label
    .split("—")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return {
      primary: parts[0],
      secondary: parts.slice(1).join(" — "),
    };
  }
  return {
    primary: label,
    secondary: "",
  };
}

function durationDaysFromText(value: string) {
  const dayMatch = value.match(/(\d+)\s*(?:day|days)/i);
  if (dayMatch) return Number(dayMatch[1]);

  const weekMatch = value.match(/(\d+)\s*(?:week|weeks)/i);
  if (weekMatch) return Number(weekMatch[1]) * 7;

  const monthMatch = value.match(/(\d+)\s*(?:month|months)/i);
  if (monthMatch) return Number(monthMatch[1]) * 30;

  return null;
}

function summaryDurationDays(summary: SimplifiedPrescriptionSummary | null) {
  if (!summary) return null;
  const parsed = summary.medicines
    .map((medicine) => durationDaysFromText(medicine.duration))
    .filter((value): value is number => value !== null && Number.isFinite(value) && value > 0);
  if (!parsed.length) return null;
  return Math.max(...parsed);
}

export default function PatientPortal({ userId, section }: { userId: string; section: PortalSection }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t, formatDate: localeFormatDate, language } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<MeUser | null>(null);
  const [doctors, setDoctors] = useState<DoctorListing[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<{
    consultations: Appointment[];
    prescriptions: Prescription[];
    reports: ReportItem[];
  }>({
    consultations: [],
    prescriptions: [],
    reports: [],
  });
  const [recordsSyncedAt, setRecordsSyncedAt] = useState<string | null>(null);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [preferredMode, setPreferredMode] = useState<"VIDEO" | "AUDIO" | "CHAT">("VIDEO");

  const [symptomForm, setSymptomForm] = useState({
    symptoms: "",
    age: "",
    duration: "",
    knownConditionsCsv: "",
    additionalContext: "",
  });
  const [symptomTriage, setSymptomTriage] = useState<SymptomTriage | null>(null);
  const [symptomHistory, setSymptomHistory] = useState<SymptomHistoryItem[]>([]);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);

  const [recordSearch, setRecordSearch] = useState("");
  const [prescriptionTextInput, setPrescriptionTextInput] = useState("");
  const [lockedPrescriptionSource, setLockedPrescriptionSource] = useState<{
    id: string;
    doctorName: string;
    diagnosis: string;
    issuedAt: string;
  } | null>(null);
  const [prescriptionLanguage, setPrescriptionLanguage] = useState<PrescriptionLanguageCode>("en");
  const [simplifiedPrescription, setSimplifiedPrescription] = useState<SimplifiedPrescriptionSummary | null>(null);
  const [simplifyingPrescription, setSimplifyingPrescription] = useState(false);
  const [isPrescriptionCardOpen, setIsPrescriptionCardOpen] = useState(true);
  const [prayagrajAvailabilityByPrescription, setPrayagrajAvailabilityByPrescription] = useState<
    Record<string, PrayagrajMedicineAvailability[]>
  >({});
  const [checkingPrayagrajAvailabilityFor, setCheckingPrayagrajAvailabilityFor] = useState<string | null>(null);

  const upcomingAppointments = useMemo(
    () => appointments.filter((item) => item.status === "BOOKED" || item.status === "IN_PROGRESS"),
    [appointments],
  );

  const previousConsultations = useMemo(
    () =>
      records.consultations
        .filter((item) => item.status === "COMPLETED" || item.status === "CANCELLED" || item.status === "NO_SHOW")
        .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)),
    [records.consultations],
  );

  const trackedMedicines = useMemo(
    () => records.prescriptions.reduce((total, row) => total + row.items.length, 0),
    [records.prescriptions],
  );

  const filteredDoctors = useMemo(() => {
    const term = doctorSearch.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) => {
      return (
        doctor.user.name.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term) ||
        doctor.languages.some((language) => language.toLowerCase().includes(term))
      );
    });
  }, [doctorSearch, doctors]);

  const normalizedRecordSearch = recordSearch.trim().toLowerCase();

  const filteredReports = useMemo(
    () =>
      records.reports.filter((item) => {
        if (!normalizedRecordSearch) return true;
        return (
          item.fileName.toLowerCase().includes(normalizedRecordSearch) ||
          item.mimeType.toLowerCase().includes(normalizedRecordSearch)
        );
      }),
    [normalizedRecordSearch, records.reports],
  );

  const filteredPrescriptions = useMemo(
    () =>
      records.prescriptions.filter((item) => {
        if (!normalizedRecordSearch) return true;
        const medicines = item.items.map((entry) => entry.medicineName).join(" ").toLowerCase();
        return (
          item.diagnosis.toLowerCase().includes(normalizedRecordSearch) ||
          item.symptoms.toLowerCase().includes(normalizedRecordSearch) ||
          (item.notes ?? "").toLowerCase().includes(normalizedRecordSearch) ||
          item.qrToken.toLowerCase().includes(normalizedRecordSearch) ||
          item.doctor.user.name.toLowerCase().includes(normalizedRecordSearch) ||
          medicines.includes(normalizedRecordSearch)
        );
      }),
    [normalizedRecordSearch, records.prescriptions],
  );

  const filteredConsultations = useMemo(
    () =>
      previousConsultations.filter((item) => {
        if (!normalizedRecordSearch) return true;
        const doctorName = item.doctor?.user?.name?.toLowerCase() ?? "";
        return (
          doctorName.includes(normalizedRecordSearch) ||
          item.status.toLowerCase().includes(normalizedRecordSearch) ||
          item.callMode.toLowerCase().includes(normalizedRecordSearch)
        );
      }),
    [normalizedRecordSearch, previousConsultations],
  );

  const loadSymptomHistory = useCallback(async () => {
    const rows = await getRecentSymptomChecksOffline(userId, 10);
    const normalizedRows: SymptomHistoryItem[] = [];
    for (const entry of rows) {
      const normalized = normalizeSymptomTriage(entry.response);
      if (!normalized) continue;
      normalizedRows.push({
        id: entry.id,
        symptoms: entry.symptoms,
        response: normalized,
        createdAt: entry.createdAt,
      });
    }
    setSymptomHistory(normalizedRows);
  }, [userId]);

  const loadDoctors = useCallback(async () => {
    const response = await mvpApi.get<{ doctors: DoctorListing[] }>("/doctors", userId);
    setDoctors(response.doctors);
  }, [userId]);

  const loadAppointments = useCallback(async () => {
    const response = await mvpApi.get<{ appointments: Appointment[] }>("/appointments/me", userId);
    setAppointments(response.appointments);
  }, [userId]);

  const loadRecords = useCallback(async () => {
    try {
      const response = await mvpApi.get<{
        consultations: Appointment[];
        prescriptions: Prescription[];
        reports: ReportItem[];
      }>("/patients/me/records", userId);
      setRecords(response);
      setRecordsSyncedAt(new Date().toISOString());
      await savePatientRecordsOffline(userId, response);
    } catch (error) {
      const cached = await getPatientRecordsOffline(userId);
      if (!cached) throw error;
      setRecords({
        consultations: cached.consultations as Appointment[],
        prescriptions: cached.prescriptions as Prescription[],
        reports: cached.reports as ReportItem[],
      });
      setRecordsSyncedAt(cached.updatedAt);
      toast.info("Offline mode: loaded cached health records");
    }
  }, [userId]);

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const meResponse = await mvpApi.get<{ user: MeUser }>("/me", userId);
      if (meResponse.user.role !== "PATIENT" || !meResponse.user.patient) {
        router.replace("/dashboard");
        return;
      }
      setMe(meResponse.user);
      setPrescriptionLanguage(languagePreferenceToCode(meResponse.user.patient.languagePreference));

      await Promise.all([loadDoctors(), loadAppointments(), loadRecords(), loadSymptomHistory()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load patient workspace");
    } finally {
      setLoading(false);
    }
  }, [loadAppointments, loadDoctors, loadRecords, loadSymptomHistory, router, userId]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadAppointments();
      if (section !== "symptoms") {
        void loadRecords();
      }
      if (section === "consultations") {
        void loadDoctors();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [loadAppointments, loadDoctors, loadRecords, section]);

  useEffect(() => {
    if (!symptomTriage) return;
    if (symptomTriage.triageLevel !== "RED") return;
    setShowEmergencyOverlay(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([300, 120, 300, 120, 500]);
    }
  }, [symptomTriage]);

  const callEmergencyServices = useCallback(() => {
    window.location.href = `tel:${EMERGENCY_CALL_NUMBER}`;
  }, []);

  const openDoctorBooking = useCallback(() => {
    router.push("/dashboard/patient/consultations");
  }, [router]);

  const seedDemoDoctor = async () => {
    setSaving(true);
    try {
      const response = await mvpApi.post<{ message: string }>("/dev/seed-doctor", userId);
      toast.success(response.message);
      await loadDoctors();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not seed doctor");
    } finally {
      setSaving(false);
    }
  };

  const createAppointment = async (doctorId: string, mode: "VIDEO" | "AUDIO" | "CHAT") => {
    let target = scheduledAt;
    if (!target) {
      const suggested = new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16);
      const userInput = window.prompt(
        `Choose appointment date & time for ${mode.toLowerCase()} call (YYYY-MM-DDTHH:mm)`,
        suggested,
      );
      if (!userInput) {
        return;
      }
      target = userInput.trim();
      setScheduledAt(target);
    }

    const parsed = new Date(target);
    if (Number.isNaN(parsed.getTime())) {
      toast.error("Invalid schedule format. Use YYYY-MM-DDTHH:mm");
      return;
    }

    setSaving(true);
    try {
      await mvpApi.post("/appointments", userId, {
        doctorId,
        scheduledAt: parsed.toISOString(),
        callMode: mode,
      });
      toast.success("Consultation booked");
      await Promise.all([loadAppointments(), loadRecords()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to book consultation");
    } finally {
      setSaving(false);
    }
  };

  const runSymptomCheck = async () => {
    if (symptomForm.symptoms.trim().length < 10) {
      toast.error("Please describe symptoms in more detail");
      return;
    }

    const payload = {
      symptoms: symptomForm.symptoms.trim(),
      age: symptomForm.age ? Number(symptomForm.age) : undefined,
      duration: symptomForm.duration || undefined,
      knownConditions: symptomForm.knownConditionsCsv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      additionalContext: symptomForm.additionalContext || undefined,
    };

    setSaving(true);
    try {
      const response = await mvpApi.post<{ triage: unknown }>("/ai/symptom-checker", userId, payload);
      const normalized = normalizeSymptomTriage(response.triage);
      if (!normalized) {
        throw new Error("Received invalid triage format");
      }
      setSymptomTriage(normalized);

      await saveSymptomCheckOffline({
        userId,
        symptoms: payload.symptoms,
        age: payload.age,
        duration: payload.duration,
        knownConditions: payload.knownConditions,
        additionalContext: payload.additionalContext,
        response: normalized,
      });

      await loadSymptomHistory();

      if (normalized.triageLevel === "RED") {
        toast.error("Emergency detected. Call emergency services now.");
      } else if (normalized.triageLevel === "YELLOW") {
        toast.warning("Urgent symptoms detected. Opening doctor booking.");
        openDoctorBooking();
      } else if (normalized.triageLevel === "GREEN") {
        toast.info("Routine consultation recommended.");
      } else {
        toast.info("Self-care guidance available. Monitor symptoms.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Symptom triage unavailable");
    } finally {
      setSaving(false);
    }
  };

  const runPrescriptionSimplifier = async () => {
    const text = prescriptionTextInput.trim();
    if (text.length < 10) {
      toast.error("Load a doctor prescription first, then choose language and generate.");
      return;
    }

    setSimplifyingPrescription(true);
    try {
      const response = await mvpApi.post<{ summary: SimplifiedPrescriptionSummary }>(
        "/ai/prescription-simplify",
        userId,
        {
          text,
          language: prescriptionLanguage,
        },
      );
      setSimplifiedPrescription(response.summary);
      setIsPrescriptionCardOpen(true);
      toast.success("Visual prescription card generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Prescription simplifier unavailable");
    } finally {
      setSimplifyingPrescription(false);
    }
  };

  const checkPrayagrajAvailability = async (prescription: Prescription) => {
    setCheckingPrayagrajAvailabilityFor(prescription.id);
    try {
      const response = await mvpApi.get<{
        prescriptionId: string;
        results: PrayagrajMedicineAvailability[];
      }>(`/pharmacies/prayagraj/availability/${prescription.qrToken}`, userId);

      setPrayagrajAvailabilityByPrescription((previous) => ({
        ...previous,
        [prescription.id]: response.results,
      }));
      toast.success("Matched prescription medicines in Prayagraj inventory");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to check Prayagraj inventory");
    } finally {
      setCheckingPrayagrajAvailabilityFor((current) =>
        current === prescription.id ? null : current,
      );
    }
  };

  const loadPrescriptionIntoSimplifier = useCallback((
    prescription: Prescription,
    options?: { silent?: boolean },
  ) => {
    const medicineText = prescription.items
      .map((item) => {
        const segments = [
          `${item.medicineName} ${item.dosage}`,
          `${item.frequency}`,
          `for ${item.durationDays} days`,
          `Qty ${item.quantity}`,
          item.instructions?.trim() || "",
        ].filter(Boolean);
        return segments.join(", ");
      })
      .join(". ");
    const assembled = [
      medicineText,
      prescription.notes?.trim(),
      `Symptoms: ${prescription.symptoms}`,
      `Diagnosis: ${prescription.diagnosis}`,
    ]
      .filter(Boolean)
      .join(". ");
    setPrescriptionTextInput(assembled);
    setLockedPrescriptionSource({
      id: prescription.id,
      doctorName: prescription.doctor.user.name,
      diagnosis: prescription.diagnosis,
      issuedAt: prescription.createdAt,
    });
    setIsPrescriptionCardOpen(true);
    document.getElementById("smart-prescription-simplifier")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!options?.silent) {
      toast.info("Doctor prescription loaded. You can now switch language and generate the card.");
    }
  }, []);

  const loadLatestPrescriptionIntoSimplifier = useCallback(() => {
    if (!filteredPrescriptions.length) {
      toast.error("No prescription found to load");
      return;
    }
    loadPrescriptionIntoSimplifier(filteredPrescriptions[0]);
  }, [filteredPrescriptions, loadPrescriptionIntoSimplifier]);

  useEffect(() => {
    if (section !== "prescriptions") return;
    if (prescriptionTextInput.trim().length >= 10) return;
    if (!filteredPrescriptions.length) return;
    loadPrescriptionIntoSimplifier(filteredPrescriptions[0], { silent: true });
  }, [
    filteredPrescriptions,
    loadPrescriptionIntoSimplifier,
    prescriptionTextInput,
    section,
  ]);

  const uploadRecord = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Max upload size is 8MB");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      await mvpApi.postForm("/patients/me/reports/upload", userId, formData);
      toast.success("Health record uploaded securely");
      await loadRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = async (report: ReportItem) => {
    if (report.fileUrl.startsWith("secure://")) {
      setSaving(true);
      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_SERVER_URL}/api/mvp/reports/${report.id}/download`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "x-user-id": userId,
            },
          },
        );
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? "Download failed");
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = report.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to download report");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (report.fileUrl) {
      window.open(report.fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none bg-primary/10">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
          <p className="text-sm font-medium text-foreground">Loading patient workspace...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-none bg-red-light">
            <span className="text-lg">⚠️</span>
          </div>
          <p className="text-sm font-medium text-foreground">Unable to load patient profile.</p>
        </div>
      </div>
    );
  }

  if (section === "overview") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("patient.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("patient.overviewDesc")}</p>
          </div>
          <a href="/dashboard/patient/consultations">
            <Button size="sm">{t("patient.bookCall")}</Button>
          </a>
        </div>

        <Card>
          <CardContent className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">{t("patient.upcomingAppointments")}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{upcomingAppointments.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t("patient.pastConsultations")}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{previousConsultations.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t("dashboard.sidebar.prescriptions")}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{records.prescriptions.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t("patient.medicinesTracked")}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{trackedMedicines}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("patient.upcomingAppointments")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingAppointments.length ? null : (
              <p className="text-sm text-muted-foreground">{t("patient.noUpcoming")}</p>
            )}
            {upcomingAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-none border border-border p-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{appointment.doctor?.user?.name ?? "Doctor"}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(appointment.scheduledAt)}</div>
                </div>
                <span className={appointment.status === "IN_PROGRESS" ? "pill-danger" : "pill-info"}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "consultations") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.sidebar.consultations")}</CardTitle>
            <CardDescription>{t("patient.book.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_160px]">
              <Input
                value={doctorSearch}
                onChange={(event) => setDoctorSearch(event.target.value)}
                placeholder={t("patient.book.searchPlaceholder")}
              />
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
              <select
                className="h-9 rounded-none border-2 border-border bg-card px-3 text-sm outline-none focus:shadow-[2px_2px_0px_0px_var(--shadow)] focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={preferredMode}
                onChange={(event) => setPreferredMode(event.target.value as "VIDEO" | "AUDIO" | "CHAT")}
              >
                <option value="VIDEO">{t("patient.book.preferVideo")}</option>
                <option value="AUDIO">{t("patient.book.preferAudio")}</option>
                <option value="CHAT">{t("patient.book.preferChat")}</option>
              </select>
            </div>

            {!doctors.length ? (
              <div className="rounded-none border border-dashed border-border p-6 text-center">
                <div className="mx-auto mb-2 icon-circle-blue"><span>👨‍⚕️</span></div>
                <div className="text-sm font-medium text-foreground">{t("patient.book.noDoctors")}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t("patient.book.noDoctorsDesc")}</div>
                <Button className="mt-3" size="sm" variant="outline" onClick={() => void seedDemoDoctor()}>
                  {t("patient.book.seedDoctor")}
                </Button>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="rounded-none border-2 border-border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-md">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-blue-light text-sm font-semibold text-primary">
                      {initials(doctor.user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{doctor.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {doctor.specialty} &middot; {specialtyYears(doctor.user.name)} {t("patient.age") === "Age" ? "yrs exp" : "वर्षों का अनुभव"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doctor.languages.map((language) => (
                          <span key={`${doctor.id}-${language}`} className="pill-info">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="text-sm font-semibold text-emerald">
                      {currency.format((doctor.consultationFeePaise ?? 0) / 100)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="xs" variant={preferredMode === "AUDIO" ? "default" : "outline"} disabled={saving} onClick={() => void createAppointment(doctor.id, "AUDIO")}>
                        {t("call.audioMode")}
                      </Button>
                      <Button size="xs" disabled={saving} onClick={() => void createAppointment(doctor.id, "VIDEO")}>
                        {t("call.videoMode")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("patient.upcomingAppointments")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingAppointments.length ? null : (
              <div className="text-sm text-muted-foreground">{t("patient.noUpcoming")}</div>
            )}
            {upcomingAppointments.map((appointment) => {
              const liveHref = appointment.consultationUi ?? `/dashboard/call/${appointment.callRoomId}`;
              const externalLink = liveHref.startsWith("http");

              return (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between rounded-none border-2 border-border p-2">
                  <div>
                    <div className="font-medium">{appointment.doctor?.user?.name ?? "Doctor"}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(appointment.scheduledAt)} • {appointment.callMode}
                    </div>
                    {appointment.prescription ? (
                      <div className="text-xs text-emerald-700">
                        {t("patient.prescriptionReady")}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {appointment.status === "IN_PROGRESS" ? (
                      <>
                        <a
                          href={liveHref}
                          target={externalLink ? "_blank" : undefined}
                          rel={externalLink ? "noreferrer" : undefined}
                        >
                          <Button size="sm" variant="outline">
                            {t("patient.joinLive")}
                          </Button>
                        </a>
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          LIVE
                        </span>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        {t("patient.waitingDoctor")}
                      </Button>
                    )}
                    <span className={`rounded-full px-2 py-1 text-xs ${appointmentStatusClassName(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("patient.history")}</CardTitle>
            <CardDescription>
              {t("patient.historyDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {previousConsultations.length ? null : (
              <div className="text-sm text-muted-foreground">{t("common.noAppointments")}</div>
            )}
            {previousConsultations.map((appointment) => (
              <div key={`history-${appointment.id}`} className="rounded-none border-2 border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{appointment.doctor?.user?.name ?? "Doctor"}</div>
                    <div className="text-xs text-muted-foreground">
                      {localeFormatDate(appointment.scheduledAt)} • {appointment.callMode}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${appointmentStatusClassName(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                {appointment.prescription ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-none bg-emerald-50 p-2 text-xs text-emerald-900">
                    <div>{t("patient.rxGenerated")}</div>
                    <div className="flex gap-2">
                      <a href="/dashboard/patient/records">
                        <Button size="sm" variant="outline">
                          {t("patient.viewRx")}
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        className="bg-[#5C94FF] text-black font-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        onClick={() => router.push(`/dashboard/call/${appointment.id}`)}
                      >
                        {t("patient.viewSummary")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-none bg-gray-50 p-2 text-xs text-muted-foreground">
                    <div>{t("patient.noRx")}</div>
                    <Button
                      size="sm"
                      className="bg-[#5C94FF] text-black font-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      onClick={() => router.push(`/dashboard/call/${appointment.id}`)}
                    >
                      {t("patient.viewSummary")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "symptoms") {
    return (
      <>
        {showEmergencyOverlay ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/85 p-4">
            <div className="w-full max-w-md rounded-none border-2 border-red-200 bg-red-600 p-5 text-white shadow-2xl">
              <div className="text-2xl font-black">{t("patient.symptomsTab.emergencyOverlayTitle")}</div>
              <div className="mt-1 text-sm text-red-100">{t("patient.symptomsTab.emergencyOverlayDesc")}</div>
              <div className="mt-4 space-y-2 rounded-none bg-red-700/70 p-3 text-sm">
                <div>{symptomTriage?.summary}</div>
                <div className="text-red-100">{symptomTriage?.explanation}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="destructive" onClick={callEmergencyServices}>
                  {t("patient.symptomsTab.emergency")} {EMERGENCY_CALL_NUMBER}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEmergencyOverlay(false)}
                  className="border-white/70 bg-white/10 text-white hover:bg-white/20"
                >
                  {t("patient.symptomsTab.dismiss")}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("patient.symptomsTab.title")}</CardTitle>
              <CardDescription>
                {t("patient.symptomsTab.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <Label>{t("patient.symptomsTab.symptomsLabel")}</Label>
                  <textarea
                    value={symptomForm.symptoms}
                    onChange={(event) =>
                      setSymptomForm((previous) => ({ ...previous, symptoms: event.target.value }))
                    }
                    className="h-28 w-full rounded-none border border-border bg-card px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    placeholder={t("patient.symptomsTab.placeholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("patient.symptomsTab.ageLabel")}</Label>
                  <Input
                    type="number"
                    value={symptomForm.age}
                    onChange={(event) => setSymptomForm((previous) => ({ ...previous, age: event.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("patient.symptomsTab.durationLabel")}</Label>
                  <Input
                    value={symptomForm.duration}
                    onChange={(event) =>
                      setSymptomForm((previous) => ({ ...previous, duration: event.target.value }))
                    }
                    placeholder={t("patient.symptomsTab.durationPlaceholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("patient.symptomsTab.conditionsLabel")}</Label>
                  <Input
                    value={symptomForm.knownConditionsCsv}
                    onChange={(event) =>
                      setSymptomForm((previous) => ({
                        ...previous,
                        knownConditionsCsv: event.target.value,
                      }))
                    }
                    placeholder={t("patient.symptomsTab.conditionsPlaceholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t("patient.symptomsTab.contextLabel")}</Label>
                  <Input
                    value={symptomForm.additionalContext}
                    onChange={(event) =>
                      setSymptomForm((previous) => ({
                        ...previous,
                        additionalContext: event.target.value,
                      }))
                    }
                    placeholder={t("patient.symptomsTab.contextPlaceholder")}
                  />
                </div>
              </div>

              <Button disabled={saving} onClick={() => void runSymptomCheck()}>
                {t("patient.symptomsTab.runBtn")}
              </Button>

              {symptomTriage ? (() => {
                const isRed = symptomTriage.triageLevel === "RED";
                const isYellow = symptomTriage.triageLevel === "YELLOW";
                const isGreen = symptomTriage.triageLevel === "GREEN";
                const isBlue = symptomTriage.triageLevel === "BLUE";
                
                const cardBg = isRed ? "bg-red-light" : isYellow ? "bg-amber-light" : isGreen ? "bg-emerald-light" : "bg-blue-light";
                const accentBg = isRed ? "bg-[#FF6B6B]" : isYellow ? "bg-[#FCD34D]" : isGreen ? "bg-[#A3E635]" : "bg-[#5C94FF]";
                const pulseClass = isRed ? "nb-pulse-danger animate-[pulse_1.5s_infinite]" : "";
                const borderClass = isRed ? "border-red" : "border-black";
                const badgeText = triageLevelLabel(symptomTriage.triageLevel);
                
                return (
                  <div className={`space-y-4 rounded-none border-2 p-5 ${cardBg} ${borderClass} ${pulseClass} shadow-soft nb-rise`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🩺</span>
                        <div className="text-lg font-bold text-foreground">{t("patient.symptomsTab.assessmentTitle")}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${accentBg}`}>
                        {symptomTriage.triageLevel} &middot; {badgeText}
                      </span>
                    </div>

                    {/* Urgency Meter */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("patient.symptomsTab.urgencyTitle")}</div>
                      <div className="grid grid-cols-4 gap-1.5 border-2 border-black bg-white p-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {[
                          { val: "BLUE", color: "bg-[#5C94FF]", label: t("patient.symptomsTab.selfCare") },
                          { val: "GREEN", color: "bg-[#A3E635]", label: t("patient.symptomsTab.routine") },
                          { val: "YELLOW", color: "bg-[#FCD34D]", label: t("patient.symptomsTab.urgent") },
                          { val: "RED", color: "bg-[#FF6B6B]", label: t("patient.symptomsTab.emergency") },
                        ].map((seg) => {
                          const isActive = seg.val === symptomTriage.triageLevel;
                          return (
                            <div
                              key={seg.val}
                              className={`h-6 rounded text-[9px] font-black uppercase flex items-center justify-center border transition-all duration-300 ${
                                isActive
                                  ? `${seg.color} text-black border-black translate-y-[-1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`
                                  : "bg-slate-50 text-slate-400 border-dashed border-slate-300"
                              }`}
                            >
                              {seg.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-none border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("patient.symptomsTab.summaryTitle")}</div>
                        <p className="text-sm font-medium text-foreground leading-relaxed">{symptomTriage.summary}</p>
                      </div>
                      
                      <div className="rounded-none border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("patient.symptomsTab.explanationTitle")}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{symptomTriage.explanation}</p>
                      </div>

                      <div className="rounded-none border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:col-span-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-700 mb-1">{t("patient.symptomsTab.actionTitle")}</div>
                        <p className="text-sm font-bold text-foreground leading-relaxed">{symptomTriage.recommendedAction}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground border-2 border-black border-dashed bg-white/40 p-2 rounded">
                      ⚠️ <span className="font-bold">{t("patient.symptomsTab.disclaimerTitle")}</span> {symptomTriage.disclaimer}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {isRed && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={callEmergencyServices}
                          className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] nb-btn-interactive nb-pulse-danger bg-red text-white"
                        >
                          🚨 {t("patient.symptomsTab.emergency")} {EMERGENCY_CALL_NUMBER}
                        </Button>
                      )}
                      {isYellow && (
                        <Button
                          size="sm"
                          onClick={openDoctorBooking}
                          className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] nb-btn-interactive bg-[#FCD34D] text-black"
                        >
                          📅 {t("patient.book.bookBtn")}
                        </Button>
                      )}
                      {isGreen && (
                        <Button
                          size="sm"
                          onClick={openDoctorBooking}
                          className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] nb-btn-interactive bg-[#A3E635] text-black"
                        >
                          📅 {t("patient.book.bookBtn")}
                        </Button>
                      )}
                      {isBlue && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info("Please keep monitoring symptoms closely.")}
                            className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] nb-btn-interactive"
                          >
                            {t("patient.symptomsTab.checkBtn")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={openDoctorBooking}
                            className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] nb-btn-interactive bg-[#5C94FF] text-black"
                          >
                            📅 {t("patient.book.bookBtn")}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })() : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("patient.symptomsTab.savedChecks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {symptomHistory.length ? null : (
                <div className="text-sm text-muted-foreground">{t("patient.symptomsTab.noSavedChecks")}</div>
              )}
              {symptomHistory.map((entry) => (
                <button
                  key={`${entry.id ?? entry.createdAt}`}
                  type="button"
                  className="w-full rounded-none border-2 border-border px-3 py-2 text-left hover:bg-muted/30"
                  onClick={() => setSymptomTriage(entry.response)}
                >
                  <div className="font-medium">
                    {entry.response.triageLevel} - {triageLevelLabel(entry.response.triageLevel)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)} • {entry.symptoms.slice(0, 90)}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (section === "personal-info") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("patient.personalInfoTitle")}</CardTitle>
            <CardDescription>{t("patient.personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-5">
              <div className="rounded-none border-2 border-border p-3">
                <div className="text-xs text-muted-foreground">{t("patient.age")}</div>
                <div className="mt-1 text-sm font-semibold">{me.patient?.age ?? t("patient.notSet")}</div>
              </div>
              <div className="rounded-none border-2 border-border p-3">
                <div className="text-xs text-muted-foreground">{t("patient.gender")}</div>
                <div className="mt-1 text-sm font-semibold">{me.patient?.gender ?? t("patient.notSet")}</div>
              </div>
              <div className="rounded-none border-2 border-border p-3">
                <div className="text-xs text-muted-foreground">{t("patient.bloodGroup")}</div>
                <div className="mt-1 text-sm font-semibold">{me.patient?.bloodGroup ?? t("patient.notSet")}</div>
              </div>
              <div className="rounded-none border-2 border-border p-3">
                <div className="text-xs text-muted-foreground">{t("patient.village")}</div>
                <div className="mt-1 text-sm font-semibold">{me.patient?.village ?? t("patient.notSet")}</div>
              </div>
              <div className="rounded-none border-2 border-border p-3">
                <div className="text-xs text-muted-foreground">{t("patient.languageLabel")}</div>
                <div className="mt-1 text-sm font-semibold">{me.patient?.languagePreference ?? t("patient.notSet")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (section === "pharmacy-locator") {
    return <PharmacyLocator userId={userId} t={t} language={language} prescriptions={records.prescriptions} />;
  }

  if (section === "emergency-services") {
    return <EmergencyHub userId={userId} t={t} language={language} />;
  }

  if (section === "prescriptions") {
    const visualDurationDays = summaryDurationDays(simplifiedPrescription);
    const treatmentDurationLabel = visualDurationDays
      ? `${visualDurationDays} ${t("patient.durationDays")}`
      : t("patient.asAdvised");

    return (
      <div className="space-y-4">
        <Card id="smart-prescription-simplifier" className="overflow-hidden border-2 border-border shadow-soft">
          <CardHeader className="border-b border-border bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{t("patient.rxSimplifierTitle")}</CardTitle>
                <CardDescription className="mt-1">
                  {t("patient.rxSimplifierDesc")}
                </CardDescription>
              </div>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {t("patient.lockedSource")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-none border border-border bg-muted/20 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Label>{t("patient.rxTextLabel")}</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadLatestPrescriptionIntoSimplifier()}
                  disabled={!filteredPrescriptions.length}
                >
                  {t("patient.loadLatestRx")}
                </Button>
              </div>
              <textarea
                readOnly
                value={prescriptionTextInput}
                className="h-28 w-full cursor-not-allowed rounded-none border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-foreground/90 outline-none"
                placeholder={t("patient.rxPlaceholder")}
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {t("patient.rxReadonlyTip")}
              </div>
              {lockedPrescriptionSource ? (
                <div className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t("patient.sourceLabel")}:</span>
                  Dr. {lockedPrescriptionSource.doctorName} • {lockedPrescriptionSource.diagnosis} •{" "}
                  {formatDate(lockedPrescriptionSource.issuedAt)}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label>{t("patient.languageLabel")}</Label>
                <select
                  className="h-10 min-w-44 rounded-none border-2 border-border bg-card px-3 text-sm outline-none focus:shadow-[2px_2px_0px_0px_var(--shadow)] focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={prescriptionLanguage}
                  onChange={(event) => setPrescriptionLanguage(event.target.value as PrescriptionLanguageCode)}
                >
                  {prescriptionLanguageOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                disabled={simplifyingPrescription || prescriptionTextInput.trim().length < 10}
                onClick={() => void runPrescriptionSimplifier()}
                className="h-10"
              >
                {simplifyingPrescription ? t("patient.generating") : t("patient.generateCard")}
              </Button>
            </div>

            {simplifiedPrescription ? (
              <details
                className="overflow-hidden rounded-none border-2 border-border bg-slate-100/50 shadow-soft"
                open={isPrescriptionCardOpen}
                onToggle={(event) =>
                  setIsPrescriptionCardOpen((event.currentTarget as HTMLDetailsElement).open)
                }
              >
                <summary className="cursor-pointer list-none bg-white/90 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{t("patient.visualCardTitle")}</div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t("auth.roleSelection") === "Select your workspace role" ? (isPrescriptionCardOpen ? "Tap to collapse" : "Tap to expand") : (isPrescriptionCardOpen ? "समेटने के लिए दबाएं" : "खोलने के लिए दबाएं")}
                    </span>
                  </div>
                </summary>

                <div className="space-y-3 border-t border-border px-4 py-4 text-sm">
                  <div className="rounded-none border border-border bg-white px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl font-semibold text-foreground">{t("patient.viewRx")}</div>
                        <div className="text-lg text-muted-foreground">
                          {lockedPrescriptionSource?.diagnosis || "Treatment Plan"}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("patient.languageLabel")} : {simplifiedPrescription.languageLabel} · {simplifiedPrescription.medicines.length} {t("dashboard.sidebar.prescriptions")} · {treatmentDurationLabel}
                      </div>
                    </div>
                    <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                      {t("doctor.rxCreator.duration")} : <span className="font-semibold text-foreground">{treatmentDurationLabel}</span>
                    </div>
                  </div>

                  <div className="rounded-none border border-border bg-white px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("patient.symptomsTab.summaryTitle")}</div>
                    <div className="mt-1.5 leading-relaxed text-foreground">
                      {simplifiedPrescription.doctorExplanation}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {simplifiedPrescription.medicines.map((medicine, index) => {
                      const timings = medicine.timingSlots.map((slot) =>
                        timingSlotDisplay(slot, simplifiedPrescription.languageCode)
                      );
                      const title = medicine.medicineName;
                      const details = [
                        medicine.dosage,
                        medicine.duration,
                        ...medicine.instructions,
                      ]
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                        .join(" • ");

                      return (
                        <div
                          key={`simplified-med-${index}`}
                          className="rounded-none border border-border bg-white px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-2xl font-semibold leading-tight text-foreground">
                              {title} <span className="text-xl font-normal text-muted-foreground">{medicine.dosage}</span>
                            </div>
                            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-semibold text-indigo-700">
                              {medicine.duration}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {details || (t("auth.roleSelection") === "Select your workspace role" ? "As prescribed by doctor" : "डॉक्टर द्वारा निर्धारित के अनुसार")}
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {timings.map((timing, timingIndex) => {
                              const icon = primaryTimingIcon(timing.icon);
                              const split = splitTimingLabel(timing.label);
                              return (
                                <div
                                  key={`${medicine.medicineName}-${timing.label}-${timingIndex}`}
                                  className={`rounded-none border px-3 py-2 ${dosageTimingClass(icon)}`}
                                >
                                  <div className="text-[30px] leading-none sm:text-xl">
                                    {icon}
                                  </div>
                                  <div className="mt-1 text-lg font-semibold leading-tight sm:text-base">
                                    {split.primary}
                                  </div>
                                  {split.secondary ? (
                                    <div className="mt-0.5 text-sm opacity-80 sm:text-xs">{split.secondary}</div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {simplifiedPrescription.hydrationTips.length ? (
                      <div className="rounded-none border border-sky-200 bg-white px-4 py-3">
                        <div className="text-3xl leading-none">💧</div>
                        <div className="mt-1 text-2xl font-semibold text-foreground sm:text-xl">{t("call.hydration")}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {simplifiedPrescription.hydrationTips.join(" • ")}
                        </div>
                      </div>
                    ) : null}

                    {simplifiedPrescription.generalAdvice.length ? (
                      <div className="rounded-none border border-emerald-200 bg-white px-4 py-3">
                        <div className="text-sm font-semibold text-foreground">{t("doctor.rxCreator.notes")}</div>
                        <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                          {simplifiedPrescription.generalAdvice.map((tip, tipIndex) => (
                            <div key={`${tip}-${tipIndex}`} className="flex items-start gap-2">
                              <span className="text-emerald-600">✓</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {simplifiedPrescription.warnings.length ? (
                      <div className="rounded-none border border-amber-200 bg-amber-50 px-4 py-3 md:col-span-2">
                        <div className="text-sm font-semibold text-amber-900">{t("call.reportTitle") === "AI-Generated Medical Consultation Report" ? "Warnings" : "सावधानियां"}</div>
                        <div className="mt-1 text-sm text-amber-900">
                          {simplifiedPrescription.warnings.join(" • ")}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex w-full items-center gap-2">
           <Input value={recordSearch} onChange={(e) => setRecordSearch(e.target.value)} placeholder={t("common.searchPlaceholder")} className="w-full sm:max-w-md" />
        </div>
        <Card id="records-prescriptions">
          <CardHeader>
            <CardTitle>{t("dashboard.sidebar.prescriptions")}</CardTitle>
            <CardDescription>{t("patient.recordsTab.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPrescriptions.length ? null : (
              <div className="text-sm text-muted-foreground">{t("common.noRecords")}</div>
            )}
            <div className="space-y-2">
              {filteredPrescriptions.map((prescription) => {
                const availabilityRows = prayagrajAvailabilityByPrescription[prescription.id];
                const checkingAvailability = checkingPrayagrajAvailabilityFor === prescription.id;

                return (
                <details
                  key={`rx-${prescription.id}`}
                  className="overflow-hidden rounded-none border-2 border-border bg-card shadow-soft"
                >
                  <summary className="cursor-pointer list-none bg-gradient-to-r from-violet-50/70 to-sky-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{prescription.diagnosis}</div>
                        <div className="text-xs text-muted-foreground">
                          Dr. {prescription.doctor.user.name} • {formatDate(prescription.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="max-w-full break-all rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">
                          QR: SANJEEVNI_RX:{prescription.qrToken}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {prescription.items.length} medicine
                          {prescription.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </summary>

                  <div className="space-y-2 border-t border-border px-4 py-4 text-sm">
                    <div><span className="font-medium">{t("doctor.rxCreator.symptoms")}:</span> {prescription.symptoms}</div>
                    <div><span className="font-medium">{t("doctor.rxCreator.diagnosis")}:</span> {prescription.diagnosis}</div>
                    <div>
                      <span className="font-medium">{t("patient.pastConsultations")}:</span>{" "}
                      {prescription.appointment ? formatDate(prescription.appointment.scheduledAt) : (t("auth.roleSelection") === "Select your workspace role" ? "Not linked" : "लिंक नहीं है")}
                      {prescription.appointment ? (
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs ${appointmentStatusClassName(prescription.appointment.status)}`}
                        >
                          {prescription.appointment.status}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <span className="font-medium">{t("doctor.rxCreator.followUpDate")}:</span>{" "}
                      {prescription.followUpDate ? formatDate(prescription.followUpDate) : (t("auth.roleSelection") === "Select your workspace role" ? "Not specified" : "निर्दिष्ट नहीं")}
                    </div>
                    <div><span className="font-medium">{t("doctor.rxCreator.notes")}:</span> {prescription.notes?.trim() || (t("auth.roleSelection") === "Select your workspace role" ? "No additional notes" : "कोई अतिरिक्त सलाह नहीं")}</div>

                    <div className="rounded-none border border-border bg-muted/20 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("dashboard.sidebar.prescriptions")}</div>
                      <div className="mt-1 space-y-1 text-xs">
                        {prescription.items.map((item, index) => (
                          <div key={`${prescription.id}-medicine-${index}`}>
                            • {item.medicineName} ({item.dosage}) • {item.frequency} • {item.durationDays} {t("patient.durationDays")} • {t("auth.roleSelection") === "Select your workspace role" ? "Qty" : "मात्रा"} {item.quantity}
                            {item.instructions?.trim() ? ` • ${item.instructions.trim()}` : ""}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadPrescriptionIntoSimplifier(prescription)}
                      >
                        {t("auth.roleSelection") === "Select your workspace role" ? "Simplify This" : "सरल बनाएं"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={checkingAvailability}
                        onClick={() => void checkPrayagrajAvailability(prescription)}
                      >
                        {checkingAvailability ? t("patient.generating") : (t("auth.roleSelection") === "Select your workspace role" ? "Check Prayagraj Availability" : "प्रयागराज उपलब्धता जांचें")}
                      </Button>
                    </div>

                    {availabilityRows ? (
                      <div className="rounded-none border border-border bg-muted/20 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Prayagraj Inventory Match
                        </div>
                        <div className="mt-2 space-y-2 text-xs">
                          {availabilityRows.map((result, index) => (
                            <div key={`${prescription.id}-prayagraj-result-${index}`} className="rounded-none border border-border/70 bg-card p-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium text-foreground">{result.medicine_requested}</span>
                                <span
                                  className={`rounded-full px-2 py-0.5 ${
                                    result.status === "Available"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : result.status === "Alternative Available"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-red-100 text-red-900"
                                  }`}
                                >
                                  {result.status}
                                </span>
                              </div>

                              {result.status === "Available" ? (
                                <div className="mt-1 text-muted-foreground">
                                  {result.exact_match.pharmacy_name} ({result.exact_match.area}) • Stock {result.exact_match.stock} •{" "}
                                  {currency.format(result.exact_match.price)}
                                </div>
                              ) : null}

                              {result.status === "Alternative Available" ? (
                                <div className="mt-1 space-y-1 text-muted-foreground">
                                  {result.alternatives.map((alternative, altIndex) => (
                                    <div key={`${prescription.id}-alt-${index}-${altIndex}`}>
                                      {alternative.brand_name} ({alternative.generic_name}) • {alternative.pharmacy_name} ({alternative.area}) • Stock {alternative.stock} •{" "}
                                      {currency.format(alternative.price)}
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              {result.status === "Not Available" ? (
                                <div className="mt-1 text-red-800">
                                  Not Available in Prayagraj
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </details>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.sidebar.records")}</CardTitle>
          <CardDescription>
            {t("patient.recordsTab.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Input
              value={recordSearch}
              onChange={(event) => setRecordSearch(event.target.value)}
              placeholder={t("common.searchPlaceholder")}
              className="w-full sm:max-w-lg"
            />
            <Button
              disabled={saving}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              {t("patient.recordsTab.uploadBtn")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadRecord(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {t("auth.roleSelection") === "Select your workspace role" ? "Secure uploads are private and only accessible to you, your consulting doctor, or admin." : "सुरक्षित अपलोड निजी हैं और केवल आपके, आपके परामर्शदाता डॉक्टर या व्यवस्थापक द्वारा ही पहुंच योग्य हैं।"}
            {recordsSyncedAt ? ` ${t("auth.roleSelection") === "Select your workspace role" ? "Last synced:" : "अंतिम सिंक:"} ${formatDate(recordsSyncedAt)}` : ""}
          </div>

          <div className="space-y-2 mt-4">
            <div className="text-sm font-semibold">{t("auth.roleSelection") === "Select your workspace role" ? "Personal Medical Uploads" : "व्यक्तिगत चिकित्सा अपलोड"}</div>
            {filteredReports.length ? null : (
              <div className="text-sm text-muted-foreground">{t("patient.recordsTab.empty")}</div>
            )}
            {filteredReports.map((report) => (
              <div key={report.id} className="flex flex-wrap items-center justify-between gap-2 rounded-none border-2 border-border p-3">
                <div className="min-w-0">
                  <div className="font-medium">{report.fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {report.mimeType} • Uploaded {formatDate(report.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    {report.fileUrl.startsWith("secure://") ? "Secure" : "External"}
                  </span>
                  <Button size="sm" variant="outline" disabled={saving} onClick={() => void downloadReport(report)}>
                    {t("auth.roleSelection") === "Select your workspace role" ? "Download" : "डाउनलोड"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("patient.history")}</CardTitle>
          <CardDescription>{t("patient.historyDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredConsultations.length ? null : (
            <div className="text-sm text-muted-foreground">{t("common.noAppointments")}</div>
          )}
          {filteredConsultations.map((consultation) => (
            <div key={consultation.id} className="rounded-none border-2 border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{consultation.doctor?.user?.name ?? "Doctor"}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(consultation.scheduledAt)} • {consultation.callMode}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${appointmentStatusClassName(consultation.status)}`}>
                  {consultation.status}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {consultation.prescription ? (
                  <>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">
                      {t("auth.roleSelection") === "Select your workspace role" ? "Prescription attached" : "पर्चा संलग्न है"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (consultation.prescription?.qrToken) {
                          setRecordSearch(consultation.prescription.qrToken);
                        }
                        document
                          .getElementById("records-prescriptions")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {t("auth.roleSelection") === "Select your workspace role" ? "Open Linked Prescription" : "संबद्ध पर्चा खोलें"}
                    </Button>
                  </>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{t("patient.noRx")}</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
