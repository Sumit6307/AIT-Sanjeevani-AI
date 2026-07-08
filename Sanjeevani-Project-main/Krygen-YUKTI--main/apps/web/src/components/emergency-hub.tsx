"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  AlertOctagon, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  Phone, 
  Star, 
  Map as MapIcon, 
  List, 
  X, 
  HeartHandshake, 
  Truck, 
  CheckCircle,
  Activity,
  Compass,
  ArrowRight,
  ShieldAlert,
  Droplet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import defaultMockData from "../../data/emergency_mock_data.json";
import VectorStreetMap from "./vector-street-map";

interface BloodGroupStock {
  blood_group: string;
  units: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  last_updated: string;
}

interface BloodBank {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  contact: string;
  operatingHours: string;
  emergencyContact: string;
  lastUpdated: string;
  inventory: BloodGroupStock[];
  distance?: number;
}

interface Ambulance {
  id: string;
  driverName: string;
  vehicleNumber: string;
  contact: string;
  type: string;
  lat: number;
  lon: number;
  status: "AVAILABLE" | "BUSY";
  distance?: number;
  eta?: number;
}

interface Hospital {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  contact: string;
  emergencyAvailability: "LOW" | "NORMAL" | "FULL";
  isOpen: boolean;
  distance?: number;
  totalIcuBeds: number;
  availableIcuBeds: number;
  totalVentilators: number;
  availableVentilators: number;
  erWaitingTime: number;
}

interface EmergencyHubProps {
  userId: string;
  t: (key: string) => string;
  language: string;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PRAYAGRAJ_CENTER = { lat: 25.4484, lon: 81.8400 };

export default function EmergencyHub({ userId, t, language }: EmergencyHubProps) {
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState<"ambulance" | "bloodbank" | "hospitals">("ambulance");

  // Geolocation states
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // --- REAL-TIME EMERGENCY DATABASE STATE ---
  const [emergencyData, setEmergencyData] = useState<{
    hospitals: Hospital[];
    bloodBanks: BloodBank[];
    ambulances: Ambulance[];
  }>({ hospitals: [], bloodBanks: [], ambulances: [] });

  // Load from localStorage or default
  useEffect(() => {
    const key = "sanjeevni-global-emergency";
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        setEmergencyData(JSON.parse(cached));
      } catch {
        setEmergencyData(defaultMockData as any);
      }
    } else {
      localStorage.setItem(key, JSON.stringify(defaultMockData));
      setEmergencyData(defaultMockData as any);
    }
  }, []);

  const saveEmergencyState = (updatedData: typeof emergencyData) => {
    setEmergencyData(updatedData);
    localStorage.setItem("sanjeevni-global-emergency", JSON.stringify(updatedData));
  };

  // --- AMBULANCE BOOKING & TRACKING STATES ---
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [emergencyType, setEmergencyType] = useState("CARDIAC");
  const [destinationHospitalId, setDestinationHospitalId] = useState("");
  const [routingLog, setRoutingLog] = useState<string | null>(null);
  const [trafficCongestion, setTrafficCongestion] = useState<"low" | "medium" | "high">("low");
  
  const [activeBooking, setActiveBooking] = useState<{
    bookingId: string;
    ambulance: Ambulance;
    patientName: string;
    emergencyType: string;
    hospital: Hospital | null;
    status: "PENDING" | "ASSIGNED" | "EN_ROUTE" | "ARRIVED" | "PICKED_UP" | "COMPLETED";
    eta: number;
    ambLat: number;
    ambLon: number;
  } | null>(null);

  // --- BLOOD BANK SEARCH STATES ---
  const [bloodSearchQuery, setBloodSearchQuery] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("ALL");
  const [maxDistance, setMaxDistance] = useState(15);
  const [bloodViewMode, setBloodViewMode] = useState<"list" | "map">("list");
  const [selectedBloodBank, setSelectedBloodBank] = useState<BloodBank | null>(null);

  // Set default coordinates on mount
  useEffect(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocating(false);
        },
        () => {
          setCoords(PRAYAGRAJ_CENTER);
          setLocating(false);
        }
      );
    } else {
      setCoords(PRAYAGRAJ_CENTER);
      setLocating(false);
    }
  }, []);

  // Compute Nearby Entities with distance calculations
  const hospitals = useMemo<Hospital[]>(() => {
    if (!coords || !emergencyData.hospitals?.length) return [];
    return emergencyData.hospitals.map(h => ({
      ...h,
      distance: getDistance(coords.lat, coords.lon, h.lat, h.lon)
    })).sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
  }, [coords, emergencyData.hospitals]);

  const bloodBanks = useMemo<BloodBank[]>(() => {
    if (!coords || !emergencyData.bloodBanks?.length) return [];
    return emergencyData.bloodBanks.map(b => ({
      ...b,
      inventory: b.inventory.map(group => ({
        ...group,
        status: group.status as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
      })),
      distance: getDistance(coords.lat, coords.lon, b.lat, b.lon)
    })).sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
  }, [coords, emergencyData.bloodBanks]);

  const ambulances = useMemo<Ambulance[]>(() => {
    if (!coords || !emergencyData.ambulances?.length) return [];
    return emergencyData.ambulances.map(a => {
      const distance = getDistance(coords.lat, coords.lon, a.lat, a.lon);
      return {
        ...a,
        status: a.status as "AVAILABLE" | "BUSY",
        distance,
        eta: Math.max(1, Math.round(distance * 2.2))
      };
    }).sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));
  }, [coords, emergencyData.ambulances]);

  // AI First aid tips database based on emergency category
  const firstAidTips = useMemo(() => {
    const database: Record<string, { title: string; titleHi: string; steps: string[]; stepsHi: string[] }> = {
      CARDIAC: {
        title: "Cardiac Emergency First-Aid",
        titleHi: "हृदय आपातकालीन प्राथमिक चिकित्सा",
        steps: [
          "Check responsiveness: Shake patient and ask loudly 'Are you okay?'.",
          "If unresponsive, call emergency ambulance immediately.",
          "Check for breathing: If not breathing normally, begin CPR immediately.",
          "Perform Chest Compressions: Push hard and fast in the center of the chest (100-120 per minute).",
          "If an Automated External Defibrillator (AED) is available, turn it on and follow voice instructions."
        ],
        stepsHi: [
          "प्रतिक्रिया की जांच करें: मरीज को हिलाएं और जोर से पूछें 'क्या आप ठीक हैं?।'।",
          "यदि कोई जवाब न मिले, तो तुरंत आपातकालीन एम्बुलेंस को कॉल करें।",
          "सांस की जांच करें: यदि सामान्य रूप से सांस नहीं ले रहे हैं, तो तुरंत सीपीआर (CPR) शुरू करें।",
          "छाती को दबाएं (Chest Compressions): छाती के बीच में जोर से और तेजी से दबाएं (प्रति मिनट 100-120 बार)।",
          "यदि ऑटोमेटेड एक्सटर्नल डिफाइब्रिलेटर (AED) उपलब्ध है, तो उसे चालू करें और निर्देशों का पालन करें।"
        ]
      },
      TRAUMA: {
        title: "Severe Trauma / Bleeding First-Aid",
        titleHi: "गंभीर आघात / रक्तस्राव प्राथमिक चिकित्सा",
        steps: [
          "Apply direct pressure to the wound with a clean cloth or bandage.",
          "Do not remove the cloth if it gets soaked; add another layer on top and keep pressing.",
          "Elevate the injured limb above heart level if possible to reduce blood flow.",
          "Keep the patient warm and lying flat to prevent medical shock.",
          "Do not wash severe wounds; wait for medical professionals."
        ],
        stepsHi: [
          "साफ कपड़े या पट्टी से घाव पर सीधा दबाव डालें।",
          "कपड़ा भीग जाने पर उसे न हटाएं; उसके ऊपर एक और परत जोड़ें और दबाते रहें।",
          "रक्त प्रवाह को कम करने के लिए यदि संभव हो तो घायल अंग को हृदय के स्तर से ऊपर उठाएं।",
          "शॉक (सदमे) से बचाने के लिए रोगी को गर्म रखें और सीधा लिटाएं।",
          "गंभीर घावों को न धोएं; चिकित्सा पेशेवरों की प्रतीक्षा करें।"
        ]
      },
      ACCIDENT: {
        title: "Accident / Fracture Care",
        titleHi: "दुर्घटना / फ्रैक्चर प्राथमिक चिकित्सा",
        steps: [
          "Do not move the injured person unless there is immediate danger (e.g. fire).",
          "Keep the neck and spine immobilized if head or neck trauma is suspected.",
          "If there is a broken bone, try to keep the limb still. Do not try to realign it.",
          "Apply cold packs wrapped in cloth to reduce swelling.",
          "Check for breathing and bleeding; address bleeding first."
        ],
        stepsHi: [
          "घायल व्यक्ति को तब तक न हिलाएं जब तक कि कोई तत्काल खतरा (जैसे आग) न हो।",
          "यदि सिर या गर्दन में चोट की आशंका हो, तो रीढ़ और गर्दन को स्थिर रखें।",
          "यदि हड्डी टूट गई है, तो अंग को स्थिर रखने का प्रयास करें। इसे सीधा करने की कोशिश न करें।",
          "सूजन कम करने के लिए कपड़े में लपेटकर बर्फ लगाएं।",
          "सांस और रक्तस्राव की जांच करें; पहले रक्तस्राव को रोकें।"
        ]
      },
      STROKE: {
        title: "Stroke Alert (FAST Protocol)",
        titleHi: "स्ट्रोक चेतावनी (FAST प्रोटोकॉल)",
        steps: [
          "FACE: Ask the person to smile. Does one side of the face droop?",
          "ARMS: Ask them to raise both arms. Does one arm drift downward?",
          "SPEECH: Ask them to repeat a simple phrase. Is their speech slurred?",
          "TIME: If you observe any of these signs, note the time and request ALS ambulance immediately.",
          "Keep the patient calm, lying on their side to keep the airway open."
        ],
        stepsHi: [
          "FACE (चेहरा): व्यक्ति को मुस्कुराने के लिए कहें। क्या चेहरा एक तरफ लटक रहा है?",
          "ARMS (हाथ): उन्हें दोनों हाथ उठाने को कहें। क्या एक हाथ नीचे की ओर गिरता है?",
          "SPEECH (आवाज): उन्हें एक सरल वाक्य दोहराने को कहें। क्या उनकी आवाज लड़खड़ा रही है?",
          "TIME (समय): यदि आपको इनमें से कोई भी लक्षण दिखे, तो समय नोट करें और तुरंत एम्बुलेंस बुलाएं।",
          "मरीज को शांत रखें, हवा का रास्ता खुला रखने के लिए उन्हें करवट लेकर लिटाएं।"
        ]
      },
      BREATHING: {
        title: "Breathing Difficulty Support",
        titleHi: "सांस लेने में कठिनाई सहायता",
        steps: [
          "Help the patient sit in an upright, comfortable position. Do not let them lie down.",
          "Loosen any tight clothing around the neck, chest, or waist.",
          "If the patient has prescribed asthma medication or inhaler, assist them in using it.",
          "Keep the room well-ventilated; open windows to let fresh air in.",
          "Keep patient calm. Panic increases oxygen demand."
        ],
        stepsHi: [
          "रोगी को सीधे, आरामदायक बैठने की स्थिति में मदद करें। उन्हें लेटने न दें।",
          "गर्दन, छाती या कमर के आसपास के तंग कपड़ों को ढीला करें।",
          "यदि रोगी के पास अस्थमा की दवा या इनहेलर है, तो उसका उपयोग करने में उनकी सहायता करें।",
          "कमरे को हवादार रखें; ताजी हवा आने देने के लिए खिड़कियां खोलें।",
          "रोगी को शांत रखें। घबराहट से ऑक्सीजन की मांग बढ़ जाती है।"
        ]
      },
      PREGNANCY: {
        title: "Pregnancy / Labor Emergencies",
        titleHi: "गर्भावस्था / प्रसव आपातकाल",
        steps: [
          "Help the mother lie down on her left side. This optimizes blood flow to the baby.",
          "Keep her calm and take slow, deep breaths.",
          "Note down the frequency and duration of contractions.",
          "Prepare clean sheets and warm blankets.",
          "In case of heavy bleeding or sudden severe headache, request an ALS or ICU ambulance."
        ],
        stepsHi: [
          "मां को उसकी बाईं करवट लेटने में मदद करें। यह बच्चे के लिए रक्त प्रवाह को बेहतर बनाता है।",
          "उन्हें शांत रखें और धीमी, गहरी सांसें लेने को कहें।",
          "संकुचन (contractions) की आवृत्ति और अवधि को नोट करें।",
          "साफ चादरें और गर्म कंबल तैयार रखें।",
          "भारी रक्तस्राव या अचानक तेज सिरदर्द के मामले में, तुरंत एम्बुलेंस का अनुरोध करें।"
        ]
      },
      OTHER: {
        title: "General Emergency Protocols",
        titleHi: "सामान्य आपातकालीन प्रोटोकॉल",
        steps: [
          "Ensure the scene is safe for you and the patient.",
          "Call emergency ambulance services immediately and state your location clearly.",
          "Keep the patient calm and comfortable. Do not give them anything to eat or drink.",
          "Monitor patient's responsiveness and breathing continuously until help arrives.",
          "If they lose consciousness, place them in the recovery position (on their side)."
        ],
        stepsHi: [
          "सुनिश्चित करें कि घटनास्थल आपके और मरीज के लिए सुरक्षित है।",
          "तुरंत आपातकालीन एम्बुलेंस सेवाओं को कॉल करें और अपना स्थान स्पष्ट रूप से बताएं।",
          "रोगी को शांत और आरामदायक रखें। उन्हें खाने या पीने के लिए कुछ न दें।",
          "मदद आने तक रोगी की प्रतिक्रिया और सांस की लगातार निगरानी करें।",
          "यदि वे होश खो देते हैं, तो उन्हें रिकवरी पोजीशन (करवट लेकर) में रखें।"
        ]
      }
    };
    return database[emergencyType] || database.OTHER;
  }, [emergencyType]);

  // Filtered Blood Banks
  const filteredBloodBanks = useMemo(() => {
    if (!coords) return [];

    return bloodBanks
      .map(bank => {
        const matchedInventory = bank.inventory.filter(group => {
          if (selectedBloodGroup !== "ALL" && group.blood_group !== selectedBloodGroup) return false;
          
          if (bloodSearchQuery.trim()) {
            const query = bloodSearchQuery.toLowerCase();
            return (
              group.blood_group.toLowerCase().includes(query) ||
              bank.name.toLowerCase().includes(query) ||
              bank.area.toLowerCase().includes(query)
            );
          }
          return true;
        });

        return {
          ...bank,
          inventory: matchedInventory
        };
      })
      .filter(b => (b.distance ?? 0) <= maxDistance)
      .filter(b => b.inventory.length > 0);
  }, [bloodBanks, coords, selectedBloodGroup, bloodSearchQuery, maxDistance]);

  // --- AMBULANCE BOOKING DISPATCH SIMULATOR ---
  const handleAmbulanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) return;

    const availableAmbs = ambulances.filter(a => a.status === "AVAILABLE");
    const selectedAmb = availableAmbs.length > 0 ? availableAmbs[0] : ambulances[0];

    let selectedHosp: Hospital | null = null;
    let logMsg = "";
    const isCritical = ["CARDIAC", "TRAUMA", "STROKE", "BREATHING", "PREGNANCY"].includes(emergencyType);

    if (destinationHospitalId) {
      selectedHosp = hospitals.find(h => h.id === destinationHospitalId) || null;
      if (selectedHosp) {
        logMsg = isEn 
          ? `Manual routing selected: Dispatched to ${selectedHosp.name} (${selectedHosp.distance} km).`
          : `मैनुअल रूटिंग का चयन: ${selectedHosp.name} (${selectedHosp.distance} किमी) के लिए रवाना किया गया।`;
      }
    } else {
      let candidates = hospitals.filter(h => h.availableIcuBeds > 0);
      if (isCritical) {
        candidates = candidates.filter(h => h.availableVentilators > 0);
      }

      if (candidates.length > 0) {
        const scored = candidates.map(h => ({
          hospital: h,
          score: (h.distance ?? 5) * 2 + h.erWaitingTime * 0.5
        })).sort((a, b) => a.score - b.score);

        selectedHosp = scored[0].hospital;

        const closerBypassed = hospitals.filter(h => (h.distance ?? 99) < (selectedHosp?.distance ?? 0));
        if (closerBypassed.length > 0) {
          const bypassReasons = closerBypassed.map(h => {
            if (h.availableIcuBeds === 0) return `${h.name} (${isEn ? "0 ICU beds" : "0 आईसीयू बेड"})`;
            if (isCritical && h.availableVentilators === 0) return `${h.name} (${isEn ? "0 ventilators" : "0 वेंटलेटर"})`;
            return `${h.name} (${isEn ? "high ER wait time" : "लंबा प्रतीक्षा समय"})`;
          }).join(", ");
          
          logMsg = isEn
            ? `Smart Auto-Route: Selected ${selectedHosp.name} (${selectedHosp.distance} km, ${selectedHosp.erWaitingTime} min wait). Bypassed closer options due to capacity limits: ${bypassReasons}.`
            : `स्मार्ट ऑटो-रूट: ${selectedHosp.name} (${selectedHosp.distance} किमी, ${selectedHosp.erWaitingTime} मिनट प्रतीक्षा) का चयन। क्षमता सीमाओं के कारण निकटतम विकल्पों को बाईपास किया गया: ${bypassReasons}।`;
        } else {
          logMsg = isEn
            ? `Smart Auto-Route: Selected ${selectedHosp.name} (${selectedHosp.distance} km, ${selectedHosp.erWaitingTime} min wait). This is the optimal nearby care facility.`
            : `स्मार्ट ऑटो-रूट: ${selectedHosp.name} (${selectedHosp.distance} किमी, ${selectedHosp.erWaitingTime} मिनट प्रतीक्षा) का चयन। यह निकटतम सर्वोत्तम चिकित्सा सुविधा है।`;
        }
      } else {
        selectedHosp = hospitals[0] || null;
        logMsg = isEn
          ? `CRITICAL ALERT: All nearby hospitals are at 100% ICU capacity. Routing to closest facility: ${selectedHosp?.name} (${selectedHosp?.distance} km).`
          : `गंभीर चेतावनी: सभी निकटतम अस्पतालों में आईसीयू क्षमता 100% भरी है। निकटतम सुविधा के लिए प्रेषित: ${selectedHosp?.name} (${selectedHosp?.distance} किमी)।`;
      }
    }

    if (selectedHosp) {
      const hospitalId = selectedHosp.id;
      const updatedHospitals = emergencyData.hospitals.map(h => {
        if (h.id === hospitalId) {
          return {
            ...h,
            availableIcuBeds: Math.max(0, h.availableIcuBeds - 1),
            availableVentilators: isCritical ? Math.max(0, h.availableVentilators - 1) : h.availableVentilators
          };
        }
        return h;
      });
      saveEmergencyState({ ...emergencyData, hospitals: updatedHospitals });
    }

    setRoutingLog(logMsg);

    const trafficFactor = trafficCongestion === "low" ? 1.0 : trafficCongestion === "medium" ? 1.5 : 2.4;
    const initialEta = Math.round((selectedAmb.eta ?? 5) * trafficFactor);

    setActiveBooking({
      bookingId: `BK-${Math.floor(Math.random() * 900000 + 100000)}`,
      ambulance: selectedAmb,
      patientName,
      emergencyType,
      hospital: selectedHosp,
      status: "ASSIGNED",
      eta: initialEta,
      ambLat: selectedAmb.lat,
      ambLon: selectedAmb.lon
    });
  };

  // Live ambulance coordinate simulation loops
  useEffect(() => {
    if (!activeBooking || !coords) return;
    if (activeBooking.status === "COMPLETED") return;

    const timer = setInterval(() => {
      setActiveBooking(prev => {
        if (!prev) return null;
        
        let nextStatus = prev.status;
        let nextEta = prev.eta;
        let nextLat = prev.ambLat;
        let nextLon = prev.ambLon;

        const speedFactor = trafficCongestion === "low" ? 0.45 : trafficCongestion === "medium" ? 0.28 : 0.15;
        const etaReduction = trafficCongestion === "low" ? 2 : trafficCongestion === "medium" ? 1 : 0.5;

        // Progress booking states every tick
        if (prev.status === "ASSIGNED") {
          nextStatus = "EN_ROUTE";
        } else if (prev.status === "EN_ROUTE") {
          nextLat = prev.ambLat + (coords.lat - prev.ambLat) * speedFactor;
          nextLon = prev.ambLon + (coords.lon - prev.ambLon) * speedFactor;
          nextEta = Math.max(1, Number((prev.eta - etaReduction).toFixed(1)));

          if (Math.abs(nextLat - coords.lat) < 0.003 && Math.abs(nextLon - coords.lon) < 0.003) {
            nextStatus = "ARRIVED";
            nextEta = 0;
            nextLat = coords.lat;
            nextLon = coords.lon;
          }
        } else if (prev.status === "ARRIVED") {
          nextStatus = "PICKED_UP";
          const trafficFactor = trafficCongestion === "low" ? 1.0 : trafficCongestion === "medium" ? 1.5 : 2.4;
          nextEta = prev.hospital ? Math.round((prev.hospital.distance ?? 5) * 2 * trafficFactor) : 10;
        } else if (prev.status === "PICKED_UP") {
          const destLat = prev.hospital?.lat ?? PRAYAGRAJ_CENTER.lat;
          const destLon = prev.hospital?.lon ?? PRAYAGRAJ_CENTER.lon;
          
          nextLat = prev.ambLat + (destLat - prev.ambLat) * speedFactor;
          nextLon = prev.ambLon + (destLon - prev.ambLon) * speedFactor;
          nextEta = Math.max(0, Number((prev.eta - etaReduction).toFixed(1)));

          if (nextEta === 0 || (Math.abs(nextLat - destLat) < 0.003 && Math.abs(nextLon - destLon) < 0.003)) {
            nextStatus = "COMPLETED";
            nextLat = destLat;
            nextLon = destLon;
          }
        }

        return {
          ...prev,
          status: nextStatus,
          eta: nextEta,
          ambLat: nextLat,
          ambLon: nextLon
        };
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBooking, coords, trafficCongestion]);

  const cancelBooking = () => {
    if (activeBooking && activeBooking.hospital) {
      const isCritical = ["CARDIAC", "TRAUMA", "STROKE", "BREATHING", "PREGNANCY"].includes(activeBooking.emergencyType);
      const hospitalId = activeBooking.hospital.id;
      
      const updatedHospitals = emergencyData.hospitals.map(h => {
        if (h.id === hospitalId) {
          return {
            ...h,
            availableIcuBeds: Math.min(h.totalIcuBeds, h.availableIcuBeds + 1),
            availableVentilators: isCritical ? Math.min(h.totalVentilators, h.availableVentilators + 1) : h.availableVentilators
          };
        }
        return h;
      });
      saveEmergencyState({ ...emergencyData, hospitals: updatedHospitals });
    }
    setActiveBooking(null);
    setPatientName("");
    setPatientPhone("");
    setRoutingLog(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            🚨 {isEn ? "Emergency Medical Dispatch" : "आपातकालीन चिकित्सा प्रेषण"}
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-0.5">
            {isEn 
              ? "Book nearby ambulances with live GPS tracking, check blood bank reserves, and access AI first-aid."
              : "लाइव जीपीएस ट्रैकिंग के साथ एम्बुलेंस बुक करें, रक्त बैंकों की उपलब्धता जांचें और एआई प्राथमिक चिकित्सा पाएं।"}
          </p>
        </div>

        <div className="flex border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
          <button
            onClick={() => setActiveTab("ambulance")}
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-sm ${
              activeTab === "ambulance" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
            }`}
          >
            <Truck className="size-4" />
            {isEn ? "Ambulance" : "एम्बुलेंस"}
          </button>
          <button
            onClick={() => setActiveTab("bloodbank")}
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-sm ${
              activeTab === "bloodbank" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
            }`}
          >
            <Droplet className="size-4" />
            {isEn ? "Blood Search" : "रक्त खोज"}
          </button>
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-sm ${
              activeTab === "hospitals" ? "bg-[#FFD166] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
            }`}
          >
            <Activity className="size-4" />
            {isEn ? "Hospital Capacity" : "अस्पताल क्षमता"}
          </button>
        </div>
      </div>

      {coords && (
        <div className="bg-[#FF8A8A]/10 border-2 border-[#FF8A8A] p-3 text-xs font-bold text-foreground flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm animate-pulse text-red-600">🚨</span>
            <span>
              {isEn ? "Emergency GPS Beacon Coordinates:" : "आपातकालीन जीपीएस बीकन निर्देशांक:"}{" "}
              <span className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 border border-black/20 ml-1">
                Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}
              </span>
            </span>
          </div>
          <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider">
            {isEn ? "ONLINE MONITORING" : "ऑनलाइन निगरानी"}
          </span>
        </div>
      )}

      {activeTab === "ambulance" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            
            {!activeBooking ? (
              <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-2 border-black p-4 bg-[#FF8A8A]/10">
                  <CardTitle className="text-lg font-black uppercase text-red-600">
                    🚨 {isEn ? "Request Emergency Ambulance Dispatch" : "आपातकालीन एम्बुलेंस सेवा का अनुरोध करें"}
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold mt-1">
                    {isEn ? "Auto-coordinates detected. Specify patient details for immediate assignment." : "स्वचालित निर्देशांकों का पता लगाया गया। तत्काल असाइनमेंट के लिए विवरण निर्दिष्ट करें।"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleAmbulanceSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-muted-foreground">{isEn ? "Patient Full Name" : "मरीज का पूरा नाम"}</label>
                        <Input
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder={isEn ? "Enter patient's name..." : "मरीज का नाम दर्ज करें..."}
                          className="border-2 border-black rounded-none text-xs font-bold"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-muted-foreground">{isEn ? "Emergency Phone Number" : "आपातकालीन संपर्क नंबर"}</label>
                        <Input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="e.g. +91 9876543210"
                          className="border-2 border-black rounded-none text-xs font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-muted-foreground">{isEn ? "Emergency Classification" : "आपातकालीन वर्गीकरण"}</label>
                        <select
                          value={emergencyType}
                          onChange={(e) => setEmergencyType(e.target.value)}
                          className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
                        >
                          <option value="CARDIAC">🫀 {isEn ? "Cardiac Emergency (Heart Pain)" : "कार्डिएक आपातकाल (छाती में दर्द)"}</option>
                          <option value="ACCIDENT">🚗 {isEn ? "Road Traffic Accident" : "सड़क दुर्घटना"}</option>
                          <option value="TRAUMA">🩹 {isEn ? "Severe Trauma / Hemorrhage" : "गंभीर चोट / भारी रक्तस्राव"}</option>
                          <option value="STROKE">🧠 {isEn ? "Stroke Symptoms (Numbness/FAST)" : "स्ट्रोक के लक्षण (बेहोशी / कमजोरी)"}</option>
                          <option value="BREATHING">🫁 {isEn ? "Severe Breathing Difficulty" : "सांस लेने में गंभीर कठिनाई"}</option>
                          <option value="PREGNANCY">👶 {isEn ? "Pregnancy / Labor Complications" : "गर्भावस्था / प्रसव समस्या"}</option>
                          <option value="OTHER">⚠️ {isEn ? "Other Medical Emergencies" : "अन्य चिकित्सा आपातकाल"}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-muted-foreground">{isEn ? "Preferred Destination Hospital" : "पसंदीदा गंतव्य अस्पताल"}</label>
                        <select
                          value={destinationHospitalId}
                          onChange={(e) => setDestinationHospitalId(e.target.value)}
                          className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
                        >
                          <option value="">🏥 {isEn ? "Closest Available (Recommended)" : "निकटतम उपलब्ध अस्पताल (अनुशंसित)"}</option>
                          {hospitals.map(h => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.distance} km) - {h.emergencyAvailability} Emergency
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-[#FF8A8A] text-black border-4 border-black py-6 rounded-none font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                      >
                        🚨 {isEn ? "DISPATCH EMERGENCY AMBULANCE" : "आपातकालीन एम्बुलेंस रवाना करें"}
                      </Button>
                    </div>

                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <CardHeader className="border-b-4 border-black p-4 bg-[#FF8A8A] text-black">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight">
                        📟 {isEn ? "Live Ambulance GPS Tracking" : "लाइव एम्बुलेंस जीपीएस ट्रैकिंग"}
                      </CardTitle>
                      <p className="text-xs font-bold text-black/75 mt-0.5">
                        {isEn ? "Booking Reference ID:" : "आरक्षण संदर्भ संख्या:"} {activeBooking.bookingId}
                      </p>
                    </div>
                    <Button 
                      size="xs"
                      onClick={cancelBooking}
                      className="bg-white border-2 border-black text-black font-black"
                    >
                      {isEn ? "Cancel Booking" : "रद्द करें"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  
                  <div className="grid grid-cols-5 text-center text-[9px] font-black uppercase border-b-2 border-black pb-3">
                    <div className={activeBooking.status === "ASSIGNED" ? "text-red" : "text-gray-400"}>
                      📌 {isEn ? "Assigned" : "असाइन किया"}
                    </div>
                    <div className={activeBooking.status === "EN_ROUTE" ? "text-amber-500" : "text-gray-400"}>
                      🚗 {isEn ? "En Route" : "रास्ते में"}
                    </div>
                    <div className={activeBooking.status === "ARRIVED" ? "text-lime-600" : "text-gray-400"}>
                      🏁 {isEn ? "Arrived" : "पहुंच गई"}
                    </div>
                    <div className={activeBooking.status === "PICKED_UP" ? "text-[#5C94FF]" : "text-gray-400"}>
                      🏥 {isEn ? "Transit" : "अस्पताल मार्ग"}
                    </div>
                    <div className={activeBooking.status === "COMPLETED" ? "text-emerald" : "text-gray-400"}>
                      ✅ {isEn ? "Finished" : "पूर्ण"}
                    </div>
                  </div>

                  {routingLog && (
                    <div className="bg-[#5C94FF]/10 border-2 border-[#5C94FF] p-3 text-[10px] font-bold text-blue-900 dark:text-blue-200">
                      ℹ️ <strong>{isEn ? "Smart Auto-Routing Log:" : "स्मार्ट ऑटो-रूटिंग लॉग:"}</strong> {routingLog}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900 border-2 border-black p-4 text-xs font-bold">
                    <div className="space-y-1 text-foreground">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Assigned Driver" : "सौंपे गए चालक"}</span>
                        <span>{activeBooking.ambulance.driverName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Ambulance Vehicle Number" : "एम्बुलेंस वाहन संख्या"}</span>
                        <span className="font-mono bg-white dark:bg-zinc-800 border px-1 py-0.5 border-black/25">{activeBooking.ambulance.vehicleNumber}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-foreground text-right sm:text-right">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "ETA to Patient" : "मरीज तक पहुंचने का समय"}</span>
                        <span className="text-lg font-black text-red-600">
                          {activeBooking.status === "COMPLETED" ? "0" : activeBooking.eta} {isEn ? "mins" : "मिनट"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Ambulance Category" : "एम्बुलेंस श्रेणी"}</span>
                        <span className="pill-success">{activeBooking.ambulance.type} {isEn ? "Ambulance" : "एम्बुलेंस"}</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG RADAR TRACKING SCREEN */}
                  <VectorStreetMap
                    userCoords={coords}
                    selectedMarkerId={activeBooking.ambulance.id}
                    markers={[
                      {
                        id: activeBooking.ambulance.id,
                        name: `${activeBooking.ambulance.driverName} (${isEn ? "Driver" : "चालक"})`,
                        lat: activeBooking.ambLat,
                        lon: activeBooking.ambLon,
                        type: "ambulance",
                        distance: Number((activeBooking.eta / 2.2).toFixed(1))
                      }
                    ]}
                    onSelectMarker={() => {}}
                    trafficCongestion={trafficCongestion}
                    setTrafficCongestion={setTrafficCongestion}
                    language={language}
                    activeRouteOnly={true}
                  />

                  <div className="flex justify-between items-center text-xs font-bold pt-2">
                    <a href={`tel:${activeBooking.ambulance.contact}`} className="flex items-center gap-1 text-red-600 underline">
                      📞 {isEn ? "Call Driver" : "चालक को कॉल करें"}: {activeBooking.ambulance.contact}
                    </a>
                    {activeBooking.status === "COMPLETED" && (
                      <span className="text-emerald font-black uppercase text-sm">
                        ✅ {isEn ? "SUCCESSFULLY ARRIVED AT HOSPITAL" : "सफलतापूर्वक अस्पताल पहुंचे"}
                      </span>
                    )}
                  </div>

                </CardContent>
              </Card>
            )}

            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-2 border-black p-4">
                <CardTitle className="text-base font-black uppercase text-foreground">
                  🏥 {isEn ? "Nearby Hospitals & Emergency Departments" : "आसपास के अस्पताल और आपातकालीन विभाग"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {hospitals.map(h => (
                  <div key={h.id} className="border-2 border-black p-3 bg-gray-50 dark:bg-zinc-900 flex justify-between items-center text-xs font-bold">
                    <div>
                      <h4 className="font-black text-sm text-foreground">{h.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">📍 {h.area} &middot; {h.distance} km away</p>
                      <span className={`inline-block mt-2 px-1.5 py-0.5 text-[9px] uppercase border ${
                        h.emergencyAvailability === "FULL" ? "bg-red-100 border-red-300 text-red-900" :
                        h.emergencyAvailability === "NORMAL" ? "bg-blue-100 border-blue-300 text-blue-900" :
                        "bg-emerald-100 border-emerald-300 text-emerald-900"
                      }`}>
                        {isEn ? "Emergency Beds Availability:" : "आपातकालीन बिस्तरों की उपलब्धता:"} {h.emergencyAvailability}
                      </span>
                    </div>
                    <a href={`tel:${h.contact}`} className="p-2 border-2 border-black bg-white hover:bg-gray-100 text-black">
                      📞 {isEn ? "Call ER" : "कॉल"}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          <div className="lg:col-span-5">
            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none sticky top-4">
              <CardHeader className="border-b-4 border-black p-4 bg-[#FFD166] text-black">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="size-5" />
                  <CardTitle className="text-base font-black uppercase">
                    🤖 {isEn ? "AI Emergency First-Aid Assistant" : "एआई आपातकालीन प्राथमिक चिकित्सा"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-[#FFD166]/10 border-2 border-[#FFD166] p-3 text-xs font-bold text-foreground">
                  <h4 className="font-black uppercase text-yellow-900 dark:text-yellow-200">
                    {isEn ? firstAidTips.title : firstAidTips.titleHi}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                    {isEn 
                      ? "Instructions provided by AI triage guidelines. Administer immediate care while waiting."
                      : "एआई प्राथमिक चिकित्सा दिशानिर्देश। एम्बुलेंस आने तक तत्काल देखभाल प्रदान करें।"}
                  </p>
                </div>

                <div className="space-y-3 text-xs font-bold text-foreground">
                  {isEn ? (
                    firstAidTips.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start border-b border-dashed border-black/10 pb-2">
                        <span className="bg-black text-white size-5 rounded-none flex items-center justify-center shrink-0 text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <p className="text-muted-foreground leading-relaxed">{step}</p>
                      </div>
                    ))
                  ) : (
                    firstAidTips.stepsHi.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start border-b border-dashed border-black/10 pb-2">
                        <span className="bg-black text-white size-5 rounded-none flex items-center justify-center shrink-0 text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <p className="text-muted-foreground leading-relaxed">{step}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-orange-50 dark:bg-zinc-900 p-3 border border-orange-300 text-[10px] text-orange-800 leading-snug">
                  ⚠️ <strong>{isEn ? "DISCLAIMER" : "अस्वीकरण"}:</strong> {isEn 
                    ? "These first-aid steps are guidelines. Prioritize safety and always wait for the trained paramedics."
                    : "ये प्राथमिक चिकित्सा निर्देश केवल आपातकालीन सहायता के लिए हैं। हमेशा प्रशिक्षित पैरामेडिक्स की सलाह को प्राथमिकता दें।"}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      ) : activeTab === "bloodbank" ? (
        <div className="space-y-6">
          
          <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Search Blood Bank / Location" : "ब्लड बैंक / स्थान खोजें"}</label>
              <Input
                value={bloodSearchQuery}
                onChange={(e) => setBloodSearchQuery(e.target.value)}
                placeholder={isEn ? "e.g. Red Cross, Civil Lines..." : "जैसे रेड क्रॉस, सिविल लाइन्स..."}
                className="border-2 border-black rounded-none text-xs font-bold h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Required Blood Group" : "आवश्यक रक्त समूह"}</label>
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
              >
                <option value="ALL">{isEn ? "All Blood Groups" : "सभी रक्त समूह"}</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
                <span>{isEn ? "Max Proximity Radius" : "अधिकतम निकटता दूरी"}</span>
                <span className="bg-[#FF8A8A] text-black px-1 border border-black font-mono">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-black dark:accent-white h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>

            <div className="flex items-end pb-1 justify-end">
              <div className="flex border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <button
                  onClick={() => setBloodViewMode("list")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-black uppercase ${
                    bloodViewMode === "list" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
                  }`}
                >
                  <List className="size-3" />
                  {isEn ? "List" : "सूची"}
                </button>
                <button
                  onClick={() => setBloodViewMode("map")}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-black uppercase ${
                    bloodViewMode === "map" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
                  }`}
                >
                  <MapIcon className="size-3" />
                  {isEn ? "Map Radar" : "नक्शा"}
                </button>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8">
              
              {bloodViewMode === "list" ? (
                <div className="space-y-4">
                  {filteredBloodBanks.map(bank => (
                    <Card key={bank.id} className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                      <div className="border-b-2 border-black p-4 bg-gray-50 dark:bg-zinc-900 flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="text-lg font-black uppercase text-foreground">{bank.name}</h3>
                          <span className="text-xs font-bold text-muted-foreground mt-0.5">
                            📍 {bank.area} &middot; Pincode: {bank.id} &middot; {bank.distance} km away
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="pill-success text-[10px]">{bank.operatingHours}</span>
                          <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{isEn ? "Refreshed today" : "आज ही अपडेट किया"}</div>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground block">
                            🩸 {isEn ? "Blood Stocks Availability Log" : "रक्त स्टॉक उपलब्धता लॉग"}
                          </span>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {bank.inventory.map(group => (
                              <div key={group.blood_group} className="border border-black/20 p-2 bg-gray-50 dark:bg-zinc-800 text-xs font-bold flex justify-between items-center">
                                <span className="font-black text-sm">{group.blood_group}</span>
                                <div className="text-right">
                                  <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 border ${
                                    group.status === "IN_STOCK" ? "text-emerald bg-emerald-light border-emerald" :
                                    group.status === "LOW_STOCK" ? "text-amber bg-amber-light border-amber" :
                                    "text-red bg-red-light border-red"
                                  }`}>
                                    {group.units} {isEn ? "Units" : "यूनिट"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-dashed border-black/15 text-xs font-bold">
                          <a href={`tel:${bank.contact}`} className="underline text-foreground">
                            📞 {isEn ? "General Enquiry" : "सामान्य पूछताछ"}: {bank.contact}
                          </a>
                          <a href={`tel:${bank.emergencyContact}`} className="underline text-red-600 font-black">
                            🚨 {isEn ? "ER Dispatch Hotline" : "आपातकालीन हॉटलाइन"}: {bank.emergencyContact}
                          </a>
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                  {filteredBloodBanks.length === 0 && (
                    <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-4xl">🩸</span>
                      <h3 className="text-lg font-black uppercase mt-3">{isEn ? "No Blood Stock Matches Found" : "कोई मिलान वाला रक्त स्टॉक नहीं मिला"}</h3>
                      <p className="text-xs text-muted-foreground font-semibold mt-1">
                        {isEn ? "Try widening the search radius or selecting all blood groups." : "खोज का दायरा बढ़ाने या सभी रक्त समूहों का चयन करने का प्रयास करें।"}
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <VectorStreetMap
                  userCoords={coords}
                  selectedMarkerId={selectedBloodBank?.id ?? null}
                  markers={filteredBloodBanks.map(b => ({
                    id: b.id,
                    name: b.name,
                    lat: b.lat,
                    lon: b.lon,
                    type: "bloodbank",
                    distance: b.distance
                  }))}
                  onSelectMarker={(id) => {
                    const found = filteredBloodBanks.find(b => b.id === id);
                    if (found) setSelectedBloodBank(found);
                  }}
                  trafficCongestion={trafficCongestion}
                  setTrafficCongestion={setTrafficCongestion}
                  language={language}
                />
              )}

            </div>

            <div className="lg:col-span-4">
              
              {selectedBloodBank ? (
                <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none sticky top-4">
                  <CardHeader className="border-b-4 border-black p-4 bg-[#FF8A8A] text-black">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-black uppercase tracking-tight">{selectedBloodBank.name}</CardTitle>
                        <span className="text-[10px] font-bold text-black/85">📍 {selectedBloodBank.area} ({selectedBloodBank.distance} km)</span>
                      </div>
                      <button onClick={() => setSelectedBloodBank(null)} className="text-black font-black text-sm">✕</button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs font-bold">
                    
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "General Hotline" : "सामान्य हॉटलाइन"}</span>
                      <span>{selectedBloodBank.contact}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Emergency Hotline" : "आपातकालीन हॉटलाइन"}</span>
                      <span className="text-red-600 font-black">{selectedBloodBank.emergencyContact}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Operating Hours" : "कार्य समय"}</span>
                      <span>{selectedBloodBank.operatingHours}</span>
                    </div>

                    <div className="border-t border-dashed border-black/20 pt-3">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-2">{isEn ? "Detailed Blood Group Registry" : "विस्तृत रक्त समूह रजिस्ट्री"}</span>
                      <div className="space-y-1">
                        {selectedBloodBank.inventory.map(group => (
                          <div key={group.blood_group} className="flex justify-between p-1 bg-gray-50 dark:bg-zinc-800 border">
                            <span>{group.blood_group}</span>
                            <span className={group.units > 0 ? "text-emerald-700" : "text-red-600"}>
                              {group.units} {isEn ? "Units" : "यूनिट"} ({group.status})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ) : (
                <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                  <CardHeader className="border-b-2 border-black p-4 bg-gray-50 dark:bg-zinc-900">
                    <CardTitle className="text-base font-black uppercase text-foreground">
                      💡 {isEn ? "Blood Transfusion Guide" : "रक्त आधान गाइड"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs font-semibold text-muted-foreground leading-relaxed">
                    <p>
                      {isEn 
                        ? "O- negative blood is the universal donor group. A patient with O- negative blood can donate to any other blood type." 
                        : "O- (ओ नेगेटिव) रक्त सार्वभौमिक दाता (Universal Donor) समूह है। ओ नेगेटिव रक्त वाला व्यक्ति किसी भी अन्य ब्लड ग्रुप को रक्तदान कर सकता है।"}
                    </p>
                    <p>
                      {isEn 
                        ? "AB+ positive blood is the universal recipient group. A patient with AB+ positive blood can receive any other blood type safely."
                        : "AB+ (एबी पॉजिटिव) रक्त सार्वभौमिक प्राप्तकर्ता (Universal Recipient) समूह है। एबी पॉजिटिव रक्त वाला व्यक्ति किसी भी अन्य ब्लड ग्रुप से सुरक्षित रूप से रक्त ले सकता है।"}
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>

          </div>

        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase text-foreground">
              🏥 {isEn ? "Live Hospital ICU Bed & Ventilator Manager" : "लाइव अस्पताल आईसीयू बेड और वेंटिलेटर प्रबंधक"}
            </h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">
              {isEn 
                ? "Simulate direct capacity adjustments for Prayagraj hospitals. Watch routing updates change instantly." 
                : "प्रयागराज अस्पतालों के लिए लाइव क्षमता को समायोजित करें। स्वचालित रूटिंग बदलावों को तुरंत लाइव देखें।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyData.hospitals.map(hosp => {
              const handleBedChange = (val: number) => {
                const updated = emergencyData.hospitals.map(h => {
                  if (h.id === hosp.id) {
                    return {
                      ...h,
                      availableIcuBeds: val,
                      emergencyAvailability: val === 0 ? "FULL" : val < 3 ? "LOW" : "NORMAL" as any
                    };
                  }
                  return h;
                });
                saveEmergencyState({ ...emergencyData, hospitals: updated });
              };

              const handleVentChange = (val: number) => {
                const updated = emergencyData.hospitals.map(h => {
                  if (h.id === hosp.id) {
                    return { ...h, availableVentilators: val };
                  }
                  return h;
                });
                saveEmergencyState({ ...emergencyData, hospitals: updated });
              };

              const handleWaitChange = (val: number) => {
                const updated = emergencyData.hospitals.map(h => {
                  if (h.id === hosp.id) {
                    return { ...h, erWaitingTime: val };
                  }
                  return h;
                });
                saveEmergencyState({ ...emergencyData, hospitals: updated });
              };

              return (
                <Card key={hosp.id} className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-foreground">{hosp.name}</h3>
                    <p className="text-[10px] text-muted-foreground">📍 {hosp.area} &middot; {hosp.distance} km</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>🛏️ {isEn ? "Available ICU Beds" : "उपलब्ध आईसीयू बेड"}</span>
                      <span className="font-mono">{hosp.availableIcuBeds} / {hosp.totalIcuBeds}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={hosp.totalIcuBeds}
                      value={hosp.availableIcuBeds}
                      onChange={(e) => handleBedChange(Number(e.target.value))}
                      className="w-full accent-black dark:accent-white h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>💨 {isEn ? "Available Ventilators" : "उपलब्ध वेंटिलेटर"}</span>
                      <span className="font-mono">{hosp.availableVentilators} / {hosp.totalVentilators}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={hosp.totalVentilators}
                      value={hosp.availableVentilators}
                      onChange={(e) => handleVentChange(Number(e.target.value))}
                      className="w-full accent-black dark:accent-white h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span>⏱️ {isEn ? "ER Waiting Time" : "ER प्रतीक्षा समय"}</span>
                      <span className="font-mono text-red-600">{hosp.erWaitingTime} {isEn ? "mins" : "मिनट"}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={hosp.erWaitingTime}
                      onChange={(e) => handleWaitChange(Number(e.target.value))}
                      className="w-full accent-black dark:accent-white h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-dashed border-black/10 flex justify-between items-center text-[10px] font-bold">
                    <span>{isEn ? "Status" : "स्थिति"}:</span>
                    <span className={`px-2 py-0.5 uppercase border ${
                      hosp.availableIcuBeds === 0 ? "bg-red-100 border-red-300 text-red-950" : "bg-emerald-100 border-emerald-300 text-emerald-950"
                    }`}>
                      {hosp.availableIcuBeds === 0 ? (isEn ? "ICU FULL" : "आईसीयू भरा हुआ है") : (isEn ? "SLOTS AVAILABLE" : "स्थान उपलब्ध हैं")}
                    </span>
                  </div>

                </Card>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
