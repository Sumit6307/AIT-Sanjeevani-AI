"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { mvpApi } from "@/lib/mvp-api";
import { useTranslation } from "@/components/language-provider";

type CallMode = "HD_VIDEO" | "LOW_VIDEO" | "AUDIO_ONLY";
type ViewMode = "CALL" | "SUMMARY_PREVIEW";

interface TranscriptLine {
  speaker: "DOCTOR" | "PATIENT";
  text: string;
  timestamp: string;
}

interface ChatMessage {
  sender: "DOCTOR" | "PATIENT";
  text: string;
  time: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

interface StructuredSummaryData {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    date: string;
  };
  chiefComplaint: string;
  symptomsDiscussed: string[];
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    currentMedications: string[];
  };
  findings: {
    observations: string;
    possibleDiagnosis: string;
    icd10Code?: string;
    notes?: string;
  };
  medicinesTable: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  recommendedTests: string[];
  lifestyleRecommendations: {
    diet: string;
    exercise: string;
    hydration: string;
    sleep: string;
    precautions: string;
  };
  followUpPlan: {
    nextAppointment: string;
    monitoring: string;
    warningSigns: string[];
  };
  summaryText: string;
  actionItems: {
    patient: string[];
    doctor: string[];
  };
}

interface ConsultationSummary {
  id: string;
  appointmentId: string;
  transcript: TranscriptLine[];
  summaryText: string;
  structuredData: StructuredSummaryData;
  isFinalized: boolean;
}

interface PeerNetworkStatus {
  role: string;
  latency: number | null;
  mode: string;
  packetLoss: number;
  jitter: number;
}

const NETWORK_CHECK_INTERVAL_MS = 5_000;
const LATENCY_OPTIMIZATION_THRESHOLD = 150;
const LATENCY_AUDIO_THRESHOLD = 400;
const STABLE_RECOVERY_CHECKS_REQUIRED = 3;
const OFFLINE_THRESHOLD_CHECKS = 3;

export default function CallRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId ?? "unknown-room";
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const { t, language, formatDate: localeFormatDate } = useTranslation();

  const storageKey = useMemo(() => `sanjeevni-chat:${roomId}`, [roomId]);
  const talkyRoom = useMemo(() => `sanjeevni-${roomId}`, [roomId]);

  const [chatFallback, setChatFallback] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("CALL");
  
  // Adaptive Network States
  const [localMode, setLocalMode] = useState<CallMode>("HD_VIDEO");
  const [latency, setLatency] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number>(0);
  const [packetLoss, setPacketLoss] = useState<number>(0);
  const [isOffline, setIsOffline] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [peerStatus, setPeerStatus] = useState<PeerNetworkStatus | null>(null);
  
  // Call Session Timer
  const [callDuration, setCallDuration] = useState(0);

  // Chat Fallback States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // AI Summary States
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [editingSummary, setEditingSummary] = useState<StructuredSummaryData | null>(null);

  const localModeRef = useRef<CallMode>("HD_VIDEO");
  const consecutiveOfflineChecks = useRef(0);
  const consecutiveStableChecks = useRef(0);
  const lastLatencyRef = useRef<number | null>(null);
  const probeInFlight = useRef(false);

  // Talky URLs based on the resolved localMode state
  const talkyUrl = useMemo(() => {
    const base = `https://talky.io/${encodeURIComponent(talkyRoom)}`;
    if (localMode === "AUDIO_ONLY") {
      return `${base}?audio`;
    }
    return base;
  }, [talkyRoom, localMode]);

  // Load Offline notepad & Chat history
  useEffect(() => {
    const cachedNotes = localStorage.getItem(storageKey);
    if (cachedNotes) {
      setChatFallback(cachedNotes);
    }
    const cachedChat = localStorage.getItem(`sanjeevni-chat-history:${roomId}`);
    if (cachedChat) {
      setMessages(JSON.parse(cachedChat));
    }
  }, [storageKey, roomId]);

  // Save Chat History
  const saveChatHistory = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    localStorage.setItem(`sanjeevni-chat-history:${roomId}`, JSON.stringify(newMessages));
  };

  // Load existing summary if call already completed
  useEffect(() => {
    if (!userId) return;
    mvpApi.get<{ summary: ConsultationSummary }>(`/appointments/${roomId}/summary`, userId)
      .then((res) => {
        if (res.summary) {
          setSummary(res.summary);
          setEditingSummary(res.summary.structuredData);
          setViewMode("SUMMARY_PREVIEW");
        }
      })
      .catch(() => {});
  }, [roomId, userId]);

  // Call Duration counter
  useEffect(() => {
    if (viewMode !== "CALL") return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode]);

  // Network adaptation probe & status reporting
  useEffect(() => {
    let cancelled = false;

    const probeNetwork = async () => {
      if (probeInFlight.current) return;
      probeInFlight.current = true;

      const startedAt = performance.now();
      try {
        const response = await fetch(`/api/latency?ts=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Probe failed");

        if (cancelled) return;

        const rtt = Math.round(performance.now() - startedAt);
        setLatency(rtt);
        setIsOffline(false);
        consecutiveOfflineChecks.current = 0;

        // Calculate simulated jitter
        if (lastLatencyRef.current !== null) {
          const currentJitter = Math.abs(rtt - lastLatencyRef.current);
          setJitter(currentJitter);
        }
        lastLatencyRef.current = rtt;

        // Reset packet loss
        setPacketLoss(0);

        // Network State Transition Logic
        if (rtt > LATENCY_AUDIO_THRESHOLD) {
          // Switch to Audio Only
          if (localModeRef.current !== "AUDIO_ONLY") {
            localModeRef.current = "AUDIO_ONLY";
            setLocalMode("AUDIO_ONLY");
            toast.error("Weak internet. Consultation shifted to audio-only mode to maintain connection.");
          }
          consecutiveStableChecks.current = 0;
          setShowRecoveryPrompt(false);
        } else if (rtt > LATENCY_OPTIMIZATION_THRESHOLD) {
          // Switch to Low Video
          if (localModeRef.current === "HD_VIDEO") {
            localModeRef.current = "LOW_VIDEO";
            setLocalMode("LOW_VIDEO");
            toast.warning("Network connection is slow. Optimizing video resolution.");
          }
          consecutiveStableChecks.current = 0;
          setShowRecoveryPrompt(false);
        } else {
          // Stable connection check for recovery
          if (localModeRef.current !== "HD_VIDEO") {
            consecutiveStableChecks.current += 1;
            if (consecutiveStableChecks.current >= STABLE_RECOVERY_CHECKS_REQUIRED) {
              setShowRecoveryPrompt(true);
            }
          } else {
            consecutiveStableChecks.current = 0;
          }
        }
      } catch {
        if (cancelled) return;
        
        consecutiveOfflineChecks.current += 1;
        setPacketLoss((prev) => Math.min(prev + 33, 100)); // Increase simulated packet loss

        if (consecutiveOfflineChecks.current >= OFFLINE_THRESHOLD_CHECKS) {
          setIsOffline(true);
        }
      } finally {
        probeInFlight.current = false;
      }
    };

    const syncStatus = async () => {
      if (!userId) return;
      try {
        // Post local status
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL ?? ""}/api/mvp/appointments/${roomId}/network`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({
            latency: lastLatencyRef.current,
            mode: localModeRef.current,
            packetLoss: consecutiveOfflineChecks.current > 0 ? 50 : 0,
            jitter: lastLatencyRef.current ? Math.floor(Math.random() * 10) : 0,
          }),
        });

        // Get peer status
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL ?? ""}/api/mvp/appointments/${roomId}/network`, {
          headers: { "x-user-id": userId },
        });
        if (response.ok) {
          const data = await response.json();
          const peers = Object.values(data.participants || {}) as PeerNetworkStatus[];
          if (peers.length > 0) {
            setPeerStatus(peers[0]);
          } else {
            setPeerStatus(null);
          }
        }
      } catch (e) {
        console.warn("Status sync failed", e);
      }
    };

    const runLoop = async () => {
      await probeNetwork();
      await syncStatus();
    };

    void runLoop();
    const intervalId = window.setInterval(runLoop, NETWORK_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [roomId, userId]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          const resultIndex = event.resultIndex;
          const text = event.results[resultIndex][0].transcript.trim();
          if (text) {
            const speaker = userRole === "DOCTOR" ? "DOCTOR" : "PATIENT";
            const timestamp = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            setTranscriptLines((prev) => [...prev, { speaker, text, timestamp }]);
          }
        };

        rec.onerror = (err: any) => {
          console.error("Speech scribe error", err);
        };

        rec.onend = () => {
          if (isTranscribing) {
            try {
              rec.start();
            } catch {}
          }
        };

        setRecognitionInstance(rec);
      }
    }
  }, [userRole, isTranscribing]);

  const toggleTranscription = () => {
    if (!recognitionInstance) {
      toast.error("Speech Recognition is not supported by your browser.");
      return;
    }

    if (isTranscribing) {
      recognitionInstance.stop();
      setIsTranscribing(false);
      toast.success("AI Consultation Scribe paused.");
    } else {
      try {
        recognitionInstance.start();
        setIsTranscribing(true);
        toast.success("AI Scribe active. Conversations are logged.");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const simulateDialogue = () => {
    const lines: TranscriptLine[] = [
      {
        speaker: "PATIENT",
        text: "Hello Doctor, I've had a severe throbbing headache since yesterday evening. My body is aching and I feel hot.",
        timestamp: "07:22:00 AM",
      },
      {
        speaker: "DOCTOR",
        text: "Hello. Let's get that checked. Have you measured your body temperature?",
        timestamp: "07:22:15 AM",
      },
      {
        speaker: "PATIENT",
        text: "Yes, it was 101.2F when I checked an hour ago. I also feel a bit dizzy when I stand up, and slightly nauseous.",
        timestamp: "07:22:30 AM",
      },
      {
        speaker: "DOCTOR",
        text: "Okay. This sounds like an acute viral fever accompanied by mild dehydration from lack of fluids. Let's start you on Paracetamol 650mg tablets for the fever, to be taken three times daily after food for three days. To counter the dehydration and dizziness, drink ORS solution mixed in clean water throughout the day. Please rest completely.",
        timestamp: "07:22:50 AM",
      },
      {
        speaker: "PATIENT",
        text: "Understood. Should I take any tests if the fever does not go away?",
        timestamp: "07:23:10 AM",
      },
      {
        speaker: "DOCTOR",
        text: "If the fever continues beyond three days, please get a Complete Blood Count (CBC) test done. If you experience severe vomiting or breathing difficulties, contact emergency care immediately. Otherwise, we will schedule a follow-up check next Monday.",
        timestamp: "07:23:30 AM",
      },
      {
        speaker: "PATIENT",
        text: "Thank you doctor, I will follow these instructions.",
        timestamp: "07:23:45 AM",
      },
    ];
    setTranscriptLines(lines);
    toast.success("Consultation dialogue simulated!");
  };

  const generateAISummary = async () => {
    if (transcriptLines.length === 0) {
      toast.error("Please record some speech or simulate dialogue before ending.");
      return;
    }
    if (!userId) return;

    setIsGenerating(true);
    try {
      const res = await mvpApi.post<{ summary: ConsultationSummary }>(
        `/appointments/${roomId}/summary/generate`,
        userId,
        { transcript: transcriptLines, language }
      );
      setSummary(res.summary);
      setEditingSummary(res.summary.structuredData);
      setViewMode("SUMMARY_PREVIEW");
      toast.success("AI Summary generated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate AI summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEditedSummary = async () => {
    if (!userId || !editingSummary) return;
    try {
      const res = await mvpApi.patch<{ summary: ConsultationSummary }>(
        `/appointments/${roomId}/summary/finalize`,
        userId,
        {
          summaryText: editingSummary.summaryText,
          structuredData: editingSummary,
        }
      );
      setSummary(res.summary);
      toast.success("Consultation summary finalized and sent to patient!");
    } catch (e: any) {
      toast.error(e.message || "Failed to finalize summary.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Chat message submission
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !userRole) return;
    const nextMsg: ChatMessage = {
      sender: userRole === "DOCTOR" ? "DOCTOR" : "PATIENT",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    saveChatHistory([...messages, nextMsg]);
    setChatInput("");
  };

  // Mock File Upload
  const triggerMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      if (!userRole) return;
      const fileNames = ["Medical_Report_BloodTest.pdf", "Prescription_Card_Hindi.png", "X-Ray_Chest.jpg"];
      const selectedFile = fileNames[Math.floor(Math.random() * fileNames.length)];
      const nextMsg: ChatMessage = {
        sender: userRole === "DOCTOR" ? "DOCTOR" : "PATIENT",
        text: `Shared a clinical document: ${selectedFile}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachmentName: selectedFile,
        attachmentUrl: "#",
      };
      saveChatHistory([...messages, nextMsg]);
      setIsUploading(false);
      toast.success(`${selectedFile} shared in consultation chat!`);
    }, 1500);
  };

  // Restore HD Video manually on improvement
  const restoreVideoQuality = () => {
    localModeRef.current = "HD_VIDEO";
    setLocalMode("HD_VIDEO");
    consecutiveStableChecks.current = 0;
    setShowRecoveryPrompt(false);
    toast.success("HD Video quality restored!");
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const addMedicineRow = () => {
    if (!editingSummary) return;
    setEditingSummary({
      ...editingSummary,
      medicinesTable: [
        ...editingSummary.medicinesTable,
        { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
      ]
    });
  };

  const removeMedicineRow = (index: number) => {
    if (!editingSummary) return;
    const nextList = [...editingSummary.medicinesTable];
    nextList.splice(index, 1);
    setEditingSummary({
      ...editingSummary,
      medicinesTable: nextList
    });
  };

  const updateMedicineCell = (index: number, field: string, value: string) => {
    if (!editingSummary) return;
    const nextList = [...editingSummary.medicinesTable];
    nextList[index] = { ...nextList[index], [field]: value };
    setEditingSummary({
      ...editingSummary,
      medicinesTable: nextList
    });
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 printing-container">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        
        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase text-center">Sanjeevni AI Consultation Summary</h1>
          <p className="text-center font-bold text-sm text-gray-600 mt-1">Digital Telehealth Medical Record</p>
        </div>

        {/* OFFLINE RECONNECTING OVERLAY */}
        {isOffline && viewMode === "CALL" && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
            <div className="size-14 border-8 border-[#FF8A8A] border-t-transparent animate-spin mb-4"></div>
            <h2 className="text-2xl font-black uppercase text-[#FF8A8A]">{t("call.reconnectingTitle")}</h2>
            <p className="text-xs font-bold text-gray-400 mt-1">
              {t("call.reconnectingDesc")}
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-black/95">
            <div className="size-16 border-8 border-black border-t-[#A3E635] animate-spin mb-6 animate-pulse"></div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-center max-w-md px-4">
              {t("call.generatingTitle")}
            </h2>
            <p className="text-sm font-semibold text-gray-500 mt-2">
              {t("call.generatingDesc")}
            </p>
          </div>
        )}

        {viewMode === "CALL" ? (
          <>
            {/* NETWORK STATUS BAR PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-4 border-black bg-[#A3E635] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📡</span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-black/60">{t("call.localNetwork")}</div>
                    <div className="font-black text-sm uppercase">
                      {isOffline ? "🛑 OFFLINE" : localMode === "HD_VIDEO" ? "📶 HD Video (Strong)" : localMode === "LOW_VIDEO" ? "📶 Low Bandwidth (Optimized)" : "📶 Very Poor (Audio-Only)"}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="border-4 border-black bg-[#5C94FF] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏥</span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-black/60">{t("call.remoteNetwork")}</div>
                    <div className="font-black text-sm uppercase">
                      {peerStatus ? `${peerStatus.role}: ${peerStatus.mode}` : "⌛ Connecting Peer..."}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="border-4 border-black bg-[#FFD166] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-3">
                <div className="flex items-center gap-2 flex-wrap justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-black/60">{t("call.sessionDuration")}</div>
                      <div className="font-black text-sm">{formatTimer(callDuration)}</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-black bg-white px-2 py-0.5 border border-black">
                    {isTranscribing ? "🎙️ Scribe Active" : "🎙️ Scribe Paused"}
                  </div>
                </div>
              </Card>
            </div>

            {/* STABILIZATION RECOVERY PROMPT */}
            {showRecoveryPrompt && (
              <div className="border-4 border-black bg-[#A3E635] text-black p-4 flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>Your network connection has stabilized. Would you like to resume HD Video?</div>
                </div>
                <Button
                  onClick={restoreVideoQuality}
                  className="bg-white text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none"
                >
                  Resume HD Video
                </Button>
              </div>
            )}

            {/* CALL ROOM GRID (Iframe & Chat Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* VIDEO CALL PANEL (7 columns) */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                  <CardHeader className="border-b-2 border-black p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg font-black uppercase text-foreground">
                          Consultation Room: {roomId}
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                          Adaptive stream resolves parameter switches automatically.
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 text-[10px] font-mono font-black">
                        <span className="px-1.5 py-0.5 border border-black bg-gray-50 dark:bg-[#2A2A2A]">
                          RTT: {latency !== null ? `${latency}ms` : "checking..."}
                        </span>
                        <span className="px-1.5 py-0.5 border border-black bg-gray-50 dark:bg-[#2A2A2A]">
                          Jitter: {jitter}ms
                        </span>
                        <span className="px-1.5 py-0.5 border border-black bg-gray-50 dark:bg-[#2A2A2A]">
                          Loss: {packetLoss}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="relative overflow-hidden">
                      <iframe
                        key={talkyUrl}
                        src={talkyUrl}
                        className={`h-[52svh] min-h-[300px] w-full rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                          localMode === "LOW_VIDEO" ? "blur-[1px] brightness-90 filter grayscale-[20%]" : ""
                        }`}
                        allow="camera; microphone; fullscreen; display-capture"
                        title="Sanjeevni consultation call"
                      />
                      {localMode === "LOW_VIDEO" && (
                        <div className="absolute top-4 left-4 bg-[#FFD166] text-black border-2 border-black font-black text-xs px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          ⚠️ Network Quality Low: Optimizing Stream
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CHAT FALLBACK & SHARING PANEL (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none h-[64svh] flex flex-col">
                  <CardHeader className="border-b-2 border-black p-4">
                    <CardTitle className="text-base font-black uppercase">{t("call.chatTitle")}</CardTitle>
                    <CardDescription className="text-xs font-semibold text-muted-foreground">
                      Chat fallback & document exchange active during calls.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
                    
                    {/* Message Log */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
                      {messages.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic text-center pt-8">
                          No messages sent in this call session.
                        </div>
                      ) : (
                        messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col text-xs max-w-[85%] rounded-none border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              msg.sender === userRole
                                ? "ml-auto bg-[#5C94FF] text-black"
                                : "mr-auto bg-gray-100 dark:bg-[#2A2A2A] text-foreground"
                            }`}
                          >
                            <span className="font-black text-[9px] uppercase opacity-70 mb-0.5">{msg.sender}</span>
                            <span className="font-semibold text-sm">{msg.text}</span>
                            <span className="font-mono text-[8px] mt-1 text-right block opacity-60">{msg.time}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Chat Form */}
                    <form onSubmit={sendChatMessage} className="border-t-2 border-black pt-3 mt-2 flex gap-1.5 items-center">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={t("call.writeMessage")}
                        className="border-2 border-black rounded-none h-9 text-xs font-bold"
                      />
                      <Button
                        type="button"
                        onClick={triggerMockUpload}
                        disabled={isUploading}
                        className="bg-[#FFD166] text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-9 px-2 hover:bg-[#e5bc5c]"
                      >
                        📂
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#A3E635] text-black border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-9 px-3 hover:bg-[#92cf2f]"
                      >
                        {t("call.send")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* SCRIBE & TRANSCRIPTION CARD */}
            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-2 border-black">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-black uppercase text-foreground">
                      {t("call.transcriptLogger")}
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-muted-foreground mt-1">
                      Real-time Speech recognition runs in the background across all video/audio modes.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={toggleTranscription}
                      className={`font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        isTranscribing ? "bg-[#FF8A8A] text-black hover:bg-[#e07b7b]" : "bg-[#FFD166] text-black hover:bg-[#e5bc5c]"
                      }`}
                    >
                      {isTranscribing ? t("call.stopScribe") : t("call.startScribe")}
                    </Button>
                    <Button
                      onClick={simulateDialogue}
                      className="bg-[#A3E635] text-black font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#92cf2f]"
                    >
                      {t("call.simulateDialogue")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="h-60 overflow-y-auto border-2 border-black p-3 bg-gray-50 dark:bg-[#2A2A2A] rounded-none">
                  {transcriptLines.length === 0 ? (
                    <p className="text-sm font-semibold text-muted-foreground italic text-center pt-8">
                      No dialog recorded yet. Turn on the AI Scribe to write transcripts dynamically, or click "Simulate Dialogue" to pre-fill standard medical dialogue.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transcriptLines.map((line, idx) => (
                        <div key={idx} className="text-xs sm:text-sm">
                          <span className="font-mono text-gray-400 mr-2">[{line.timestamp}]</span>
                          <span
                            className={`font-black px-1.5 py-0.5 border border-black mr-2 ${
                              line.speaker === "DOCTOR" ? "bg-[#5C94FF] text-black" : "bg-[#A3E635] text-black"
                            }`}
                          >
                            {line.speaker}
                          </span>
                          <span className="font-bold text-foreground">{line.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {userRole === "DOCTOR" && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={generateAISummary}
                      className="w-full sm:w-auto bg-[#FF8A8A] text-black font-black text-base py-6 border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                      {t("call.endMeeting")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OFFLINE NOTES CARD */}
            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-2 border-black">
                <CardTitle className="text-lg font-black uppercase text-foreground">
                  {t("call.notesTitle")}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground mt-1">
                  Offline ready text block saved in local storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <textarea
                  value={chatFallback}
                  onChange={(event) => setChatFallback(event.target.value)}
                  placeholder="Type symptoms or notes here..."
                  className="h-32 w-full rounded-none border-2 border-black bg-white dark:bg-[#2A2A2A] dark:text-white p-3 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    className="bg-[#A3E635] text-black font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    onClick={() => {
                      localStorage.setItem(storageKey, chatFallback);
                      toast.success("Notes saved locally");
                    }}
                  >
                    {t("call.saveNotes")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* SUMMARY PREVIEW VIEW */
          <div className="space-y-6">
            
            {/* CONTROL PANEL */}
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                className="bg-white dark:bg-[#2A2A2A] text-foreground font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => setViewMode("CALL")}
              >
                {t("nav.backToCall")}
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-[#FFD166] text-black font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {t("call.printReport")}
              </Button>
              {userRole === "DOCTOR" && summary && !summary.isFinalized && (
                <Button
                  onClick={saveEditedSummary}
                  className="bg-[#A3E635] text-black font-black border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  {t("call.approveSummary")}
                </Button>
              )}
            </div>

            {/* PATIENT STATUS INDICATOR */}
            {userRole === "PATIENT" && summary && !summary.isFinalized && (
              <div className="border-4 border-black bg-amber-100 p-4 text-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] print:hidden">
                {t("patient.waitingApproval")}
              </div>
            )}

            {/* STRUCTURED MEDICAL REPORT */}
            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none print:shadow-none print:border-0">
              <CardHeader className="border-b-4 border-black print:border-b-2">
                <CardTitle className="text-2xl font-black uppercase text-foreground">
                  {t("call.reportTitle")}
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground mt-1">
                  {t("call.reportState")}: {summary?.isFinalized ? t("call.approvedFinalized") : t("call.draftReview")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                {/* 1. Demographics */}
                <div className="grid grid-cols-2 gap-4 border-2 border-black p-4 bg-gray-50 dark:bg-[#2A2A2A] rounded-none md:grid-cols-4">
                  <div>
                    <span className="block text-[10px] font-black uppercase text-gray-500">{t("call.patientName")}</span>
                    <span className="font-bold text-sm">{editingSummary?.patientInfo.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-gray-500">{t("call.patientAge")}</span>
                    <span className="font-bold text-sm">{editingSummary?.patientInfo.age}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-gray-500">{t("call.patientGender")}</span>
                    <span className="font-bold text-sm uppercase">{editingSummary?.patientInfo.gender}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase text-gray-500">{t("call.consultDate")}</span>
                    <span className="font-bold text-sm">{editingSummary?.patientInfo.date ? new Date(editingSummary.patientInfo.date).toLocaleDateString() : ""}</span>
                  </div>
                </div>

                {/* 2. Chief Complaint & Symptoms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">{t("call.chiefComplaint")}</Label>
                    <textarea
                      disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                      value={editingSummary?.chiefComplaint || ""}
                      onChange={(e) => editingSummary && setEditingSummary({ ...editingSummary, chiefComplaint: e.target.value })}
                      className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase">{t("call.symptomsDiscussed")}</Label>
                    <textarea
                      disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                      value={editingSummary?.symptomsDiscussed.join(", ") || ""}
                      onChange={(e) => editingSummary && setEditingSummary({ ...editingSummary, symptomsDiscussed: e.target.value.split(",").map(x => x.trim()) })}
                      className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black min-h-[60px]"
                    />
                  </div>
                </div>

                {/* 3. Clinical Findings */}
                <div className="border-2 border-black p-4 space-y-4 rounded-none">
                  <h3 className="font-black text-sm uppercase border-b-2 border-black pb-1">{t("call.findingsTitle")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-500">{t("call.findingsObs")}</Label>
                      <textarea
                        disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                        value={editingSummary?.findings.observations || ""}
                        onChange={(e) => editingSummary && setEditingSummary({
                          ...editingSummary,
                          findings: { ...editingSummary.findings, observations: e.target.value }
                        })}
                        className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-500">{t("call.findingsDiag")}</Label>
                      <textarea
                        disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                        value={editingSummary?.findings.possibleDiagnosis || ""}
                        onChange={(e) => editingSummary && setEditingSummary({
                          ...editingSummary,
                          findings: { ...editingSummary.findings, possibleDiagnosis: e.target.value }
                        })}
                        className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-500">{t("call.findingsIcd")}</Label>
                      <Input
                        disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                        value={editingSummary?.findings.icd10Code || ""}
                        onChange={(e) => editingSummary && setEditingSummary({
                          ...editingSummary,
                          findings: { ...editingSummary.findings, icd10Code: e.target.value }
                        })}
                        className="border-2 border-black font-bold bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-500">{t("call.findingsNotes")}</Label>
                      <Input
                        disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                        value={editingSummary?.findings.notes || ""}
                        onChange={(e) => editingSummary && setEditingSummary({
                          ...editingSummary,
                          findings: { ...editingSummary.findings, notes: e.target.value }
                        })}
                        className="border-2 border-black font-bold bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Medicines Table */}
                <div className="border-2 border-black p-4 space-y-4 rounded-none">
                  <div className="flex justify-between items-center border-b-2 border-black pb-1">
                    <h3 className="font-black text-sm uppercase">{t("call.medsTitle")}</h3>
                    {userRole === "DOCTOR" && summary && !summary.isFinalized && (
                      <Button
                        size="sm"
                        onClick={addMedicineRow}
                        className="bg-[#A3E635] text-black font-black border-2 border-black text-xs px-2 py-0.5 rounded-none"
                      >
                        {t("call.addDrugBtn")}
                      </Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-black bg-gray-50 dark:bg-[#2a2a2a] text-[10px] font-black uppercase">
                          <th className="p-2 border border-black">{t("call.medsName")}</th>
                          <th className="p-2 border border-black">{t("call.medsDosage")}</th>
                          <th className="p-2 border border-black">{t("call.medsFreq")}</th>
                          <th className="p-2 border border-black">{t("call.medsDuration")}</th>
                          <th className="p-2 border border-black">{t("call.medsInstruct")}</th>
                          {userRole === "DOCTOR" && summary && !summary.isFinalized && (
                            <th className="p-2 border border-black text-center">{t("call.medsAction")}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {editingSummary?.medicinesTable.map((med, idx) => (
                          <tr key={idx} className="border-b border-black text-xs font-semibold">
                            <td className="p-1 border border-black">
                              <Input
                                disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                                value={med.name}
                                onChange={(e) => updateMedicineCell(idx, "name", e.target.value)}
                                className="border-0 font-bold text-xs p-1 h-7 rounded-none bg-transparent"
                              />
                            </td>
                            <td className="p-1 border border-black">
                              <Input
                                disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                                value={med.dosage}
                                onChange={(e) => updateMedicineCell(idx, "dosage", e.target.value)}
                                className="border-0 font-bold text-xs p-1 h-7 rounded-none bg-transparent"
                              />
                            </td>
                            <td className="p-1 border border-black">
                              <Input
                                disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                                value={med.frequency}
                                onChange={(e) => updateMedicineCell(idx, "frequency", e.target.value)}
                                className="border-0 font-bold text-xs p-1 h-7 rounded-none bg-transparent"
                              />
                            </td>
                            <td className="p-1 border border-black">
                              <Input
                                disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                                value={med.duration}
                                onChange={(e) => updateMedicineCell(idx, "duration", e.target.value)}
                                className="border-0 font-bold text-xs p-1 h-7 rounded-none bg-transparent"
                              />
                            </td>
                            <td className="p-1 border border-black">
                              <Input
                                disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                                value={med.instructions}
                                onChange={(e) => updateMedicineCell(idx, "instructions", e.target.value)}
                                className="border-0 font-bold text-xs p-1 h-7 rounded-none bg-transparent"
                              />
                            </td>
                            {userRole === "DOCTOR" && summary && !summary.isFinalized && (
                              <td className="p-1 border border-black text-center">
                                <button
                                  onClick={() => removeMedicineRow(idx)}
                                  className="text-red-500 font-bold text-xs hover:underline"
                                >
                                  {t("call.medsDelete")}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Recommended Tests & Lifestyle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 border-2 border-black p-4 rounded-none">
                    <h3 className="font-black text-sm uppercase border-b-2 border-black pb-1">{t("call.labsTitle")}</h3>
                    <textarea
                      disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                      value={editingSummary?.recommendedTests.join(", ") || ""}
                      onChange={(e) => editingSummary && setEditingSummary({ ...editingSummary, recommendedTests: e.target.value.split(",").map(x => x.trim()) })}
                      className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-24"
                    />
                  </div>
                  <div className="space-y-2 border-2 border-black p-4 rounded-none">
                    <h3 className="font-black text-sm uppercase border-b-2 border-black pb-1">{t("call.lifestyleTitle")}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">{t("call.diet")}</span>
                        <Input
                          disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                          value={editingSummary?.lifestyleRecommendations.diet || ""}
                          onChange={(e) => editingSummary && setEditingSummary({
                            ...editingSummary,
                            lifestyleRecommendations: { ...editingSummary.lifestyleRecommendations, diet: e.target.value }
                          })}
                          className="border-2 border-black h-7 p-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase">{t("call.hydration")}</span>
                        <Input
                          disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                          value={editingSummary?.lifestyleRecommendations.hydration || ""}
                          onChange={(e) => editingSummary && setEditingSummary({
                            ...editingSummary,
                            lifestyleRecommendations: { ...editingSummary.lifestyleRecommendations, hydration: e.target.value }
                          })}
                          className="border-2 border-black h-7 p-1"
                        />
                      </div>
                    </div>
                    <div className="pt-2 text-xs font-bold">
                      <span className="text-[10px] text-gray-500 block uppercase">{t("call.precautions")}</span>
                      <Input
                        disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                        value={editingSummary?.lifestyleRecommendations.precautions || ""}
                        onChange={(e) => editingSummary && setEditingSummary({
                          ...editingSummary,
                          lifestyleRecommendations: { ...editingSummary.lifestyleRecommendations, precautions: e.target.value }
                        })}
                        className="border-2 border-black h-7 p-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Text Summary */}
                <div className="space-y-2 border-2 border-black p-4 rounded-none">
                  <h3 className="font-black text-sm uppercase border-b-2 border-black pb-1">{t("call.narrativeTitle")}</h3>
                  <textarea
                    disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                    value={editingSummary?.summaryText || ""}
                    onChange={(e) => editingSummary && setEditingSummary({ ...editingSummary, summaryText: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-28"
                  />
                </div>

                {/* 7. Action Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 border-2 border-black p-4 rounded-none bg-blue-50/30">
                    <h3 className="font-black text-sm uppercase text-blue-800 border-b-2 border-blue-200 pb-1">{t("call.patientActions")}</h3>
                    <textarea
                      disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                      value={editingSummary?.actionItems.patient.join("\n") || ""}
                      onChange={(e) => editingSummary && setEditingSummary({
                        ...editingSummary,
                        actionItems: { ...editingSummary.actionItems, patient: e.target.value.split("\n") }
                      })}
                      className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-24"
                    />
                  </div>
                  <div className="space-y-2 border-2 border-black p-4 rounded-none bg-green-50/30">
                    <h3 className="font-black text-sm uppercase text-green-800 border-b-2 border-green-200 pb-1">{t("call.doctorActions")}</h3>
                    <textarea
                      disabled={userRole !== "DOCTOR" || summary?.isFinalized}
                      value={editingSummary?.actionItems.doctor.join("\n") || ""}
                      onChange={(e) => editingSummary && setEditingSummary({
                        ...editingSummary,
                        actionItems: { ...editingSummary.actionItems, doctor: e.target.value.split("\n") }
                      })}
                      className="w-full border-2 border-black p-2 font-bold text-sm bg-white dark:bg-[#2A2A2A] disabled:bg-gray-100 disabled:text-black h-24"
                    />
                  </div>
                </div>

                {/* Print Signatures */}
                <div className="hidden print:flex justify-between items-end pt-12">
                  <div className="text-center w-48 border-t-2 border-black pt-2 font-bold text-xs">
                    {t("call.patientSign")}
                  </div>
                  <div className="text-center w-48 border-t-2 border-black pt-2 font-bold text-xs">
                    {t("call.doctorSign")}
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        )}

      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printing-container, .printing-container * {
            visibility: visible;
          }
          .printing-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .hidden.print\\:block {
            display: block !important;
          }
          .hidden.print\\:flex {
            display: flex !important;
          }
          textarea, input {
            border: none !important;
            background: transparent !important;
            resize: none !important;
            padding: 0 !important;
            color: black !important;
          }
          table, th, td {
            border: 1px solid black !important;
          }
        }
      `}</style>

    </div>
  );
}
