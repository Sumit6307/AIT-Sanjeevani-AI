"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  Phone, 
  Star, 
  Map as MapIcon, 
  List, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Bell, 
  Navigation,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import mockData from "../../data/pharmacy_locator_data.json";
import VectorStreetMap from "./vector-street-map";

interface Medicine {
  medicine_id: string;
  brand_name: string;
  generic_name: string;
  category: string;
  uses: string;
  sideEffects: string;
  dosage: string;
  stock: number;
  price: number;
  batchNumber: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  minThreshold: number;
  mfgDate: string;
  expiryDate: string;
  storageInstructions: string;
}

interface Pharmacy {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  pincode: string;
  contact: string;
  openingHours: string;
  rating: number;
  inventory: Medicine[];
  distance?: number;
  travelTime?: string;
  isOpen?: boolean;
}

interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions: string | null;
}

interface Prescription {
  id: string;
  createdAt: string;
  diagnosis: string;
  symptoms: string;
  notes: string | null;
  followUpDate: string | null;
  qrToken: string;
  doctor: {
    user: {
      name: string;
    };
  };
  items: PrescriptionItem[];
}

interface PharmacyLocatorProps {
  userId: string;
  t: (key: string) => string;
  language: string;
  prescriptions?: Prescription[];
}

// Harvesine formula to calculate distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Mock User coordinates in Prayagraj if GPS fails
const PRAYAGRAJ_CENTER = { lat: 25.4484, lon: 81.8400 };
const CURRENT_DATE = new Date("2026-07-08");

export default function PharmacyLocator({ userId, t, language, prescriptions = [] }: PharmacyLocatorProps) {
  const isEn = language === "en";
  
  // Geolocation & Manual Location States
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [manualInput, setManualInputValue] = useState("");
  const [manualLocationMode, setManualLocationMode] = useState<"none" | "pincode" | "city">("none");

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [trafficCongestion, setTrafficCongestion] = useState<"low" | "medium" | "high">("low");
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [maxDistance, setMaxDistance] = useState<number>(15); // max 15km
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [stockStatusFilter, setStockStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK">("ALL");

  // Selected Detail States
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activePrescriptionId, setActivePrescriptionId] = useState<string>("");

  // Simulated Live Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; type: "info" | "alert" | "success" }>>([
    {
      id: "nt1",
      text: isEn ? "Ganga Medical Hall has updated its daily insulin stock counts." : "गंगा मेडिकल हॉल ने अपने दैनिक इंसुलिन स्टॉक की संख्या को अपडेट किया है।",
      time: "2 mins ago",
      type: "info"
    },
    {
      id: "nt2",
      text: isEn ? "Low Stock Alert: Crocin Pain Relief is running low at Gupta Pharmacy (Civil Lines)." : "कम स्टॉक चेतावनी: गुप्ता फार्मेसी (सिविल लाइन्स) में क्रोसिन पेन रिलीफ की कमी हो रही है।",
      time: "15 mins ago",
      type: "alert"
    },
    {
      id: "nt3",
      text: isEn ? "Arogya Dham Pharmacy is open 24 Hours. Emergency oxygen cylinders refilled." : "आरोग्य धाम फार्मेसी 24 घंटे खुली है। आपातकालीन ऑक्सीजन सिलेंडर फिर से भरे गए।",
      time: "1 hour ago",
      type: "success"
    }
  ]);

  // Request user coordinates
  const detectLocation = () => {
    setLocating(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError(isEn ? "Geolocation is not supported by your browser." : "भू-स्थान आपके ब्राउज़र द्वारा समर्थित नहीं है।");
      setLocating(false);
      // Fallback to center
      setCoords(PRAYAGRAJ_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLocating(false);
        setManualLocationMode("none");
      },
      (error) => {
        let msg = isEn ? "Permission Denied. Please input city/pincode or click on the map." : "अनुमति अस्वीकार कर दी गई। कृपया शहर/पिनकोड दर्ज करें या मानचित्र पर क्लिक करें।";
        if (error.code === error.POSITION_UNAVAILABLE) {
          msg = isEn ? "Position Unavailable. Using fallback city coordinates." : "स्थिति अनुपलब्ध है। बैकअप शहर निर्देशांक का उपयोग कर रहे हैं।";
        }
        setGpsError(msg);
        setLocating(false);
        // Fallback to center
        setCoords(PRAYAGRAJ_CENTER);
      },
      { timeout: 10000 }
    );
  };

  // Run on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Handle manual Pincode/City lookup
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Simulate area finding based on input
    const query = manualInput.trim().toLowerCase();
    
    // Look up in our coordinates mapping
    const match = mockData.pharmacies.find(
      p => p.pincode === query || p.area.toLowerCase().includes(query)
    );

    if (match) {
      setCoords({ lat: match.lat - 0.002, lon: match.lon - 0.003 }); // slightly offset user from the match
      setGpsError(null);
      setManualInputValue("");
    } else {
      // Just mock user location in George Town area for other matches
      setCoords({ lat: 25.4475, lon: 81.8540 });
      setGpsError(isEn ? `Showing results around custom area: "${manualInput}"` : `कस्टम क्षेत्र के आसपास परिणाम दिखा रहा है: "${manualInput}"`);
    }
  };

  // Check store open status based on current time (mocking 10 AM to 10 PM mostly)
  const isStoreOpen = (hoursStr: string): boolean => {
    if (hoursStr.toLowerCase().includes("24 hours")) return true;
    const currentHour = new Date().getHours();
    return currentHour >= 9 && currentHour < 22; // Open from 9 AM to 10 PM
  };

  // Compute distances & status for mock pharmacies list
  const pharmacies = useMemo<Pharmacy[]>(() => {
    if (!coords) return [];
    
    let rawPharmacies = mockData.pharmacies;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("sanjeevni-global-pharmacies");
      if (cached) {
        try {
          rawPharmacies = JSON.parse(cached);
        } catch {
          rawPharmacies = mockData.pharmacies;
        }
      }
    }

    const trafficFactor = trafficCongestion === "low" ? 1.0 : trafficCongestion === "medium" ? 1.5 : 2.4;

    return rawPharmacies.map((item) => {
      const distance = getDistance(coords.lat, coords.lon, item.lat, item.lon);
      const travelMinutes = Math.round(distance * 2.2 * trafficFactor); // approx 25 km/h driving scaled by traffic
      const travelTime = travelMinutes < 1 ? (isEn ? "Under 1 min" : "1 मिनट से कम") : `${travelMinutes} ${isEn ? "mins" : "मिनट"}`;
      const isOpen = isStoreOpen(item.openingHours);

      return {
        ...item,
        distance,
        travelTime,
        isOpen
      } as Pharmacy;
    });
  }, [coords, isEn, trafficCongestion]);

  // Unique therapeutic categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    pharmacies.forEach(p => {
      p.inventory.forEach(m => set.add(m.category));
    });
    return ["ALL", ...Array.from(set)];
  }, [pharmacies]);

  // Filtered pharmacies list
  const filteredPharmacies = useMemo(() => {
    if (!coords) return [];

    return pharmacies
      .map(pharmacy => {
        // Filter medicines inside the inventory
        const filteredInv = pharmacy.inventory.filter(med => {
          // Expiration check (Expired items are hidden from patients)
          const expDate = new Date(med.expiryDate);
          const diffDays = Math.ceil((expDate.getTime() - CURRENT_DATE.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 0) return false;

          // Category check
          if (selectedCategory !== "ALL" && med.category !== selectedCategory) return false;
          
          // Stock check
          if (stockStatusFilter === "IN_STOCK" && med.stock === 0) return false;
          if (stockStatusFilter === "LOW_STOCK" && (med.stock === 0 || med.stock > 20)) return false;

          // Search query check
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
              med.brand_name.toLowerCase().includes(query) ||
              med.generic_name.toLowerCase().includes(query) ||
              med.category.toLowerCase().includes(query)
            );
          }
          return true;
        });

        return {
          ...pharmacy,
          inventory: filteredInv
        };
      })
      // Distance filter
      .filter(p => (p.distance ?? 0) <= maxDistance)
      // Open now filter
      .filter(p => !onlyOpenNow || p.isOpen)
      // Rating filter
      .filter(p => p.rating >= minRating)
      // Only show pharmacies that matched medicines (if search query is active)
      .filter(p => !searchQuery.trim() || p.inventory.length > 0)
      // Sort by nearest
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [pharmacies, coords, searchQuery, selectedCategory, maxDistance, onlyOpenNow, minRating, stockStatusFilter]);

  // Extract medicine stock availability globally
  const medicineGlobalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const resultsMap = new Map<string, { name: string; brand: string; generic: string; category: string; pharmacies: Array<{ name: string; distance: number; stock: number; price: number; isOpen: boolean }> }>();

    pharmacies.forEach(p => {
      p.inventory.forEach(m => {
        const matches = 
          m.brand_name.toLowerCase().includes(query) ||
          m.generic_name.toLowerCase().includes(query);

        if (matches) {
          const key = m.brand_name;
          if (!resultsMap.has(key)) {
            resultsMap.set(key, {
              name: m.brand_name,
              brand: m.brand_name,
              generic: m.generic_name,
              category: m.category,
              pharmacies: []
            });
          }
          resultsMap.get(key)!.pharmacies.push({
            name: p.name,
            distance: p.distance ?? 0,
            stock: m.stock,
            price: m.price,
            isOpen: p.isOpen ?? false
          });
        }
      });
    });

    // Sort pharmacies inside each result by nearest
    resultsMap.forEach(res => {
      res.pharmacies.sort((a, b) => a.distance - b.distance);
    });

    return Array.from(resultsMap.values());
  }, [searchQuery, pharmacies]);

  // Prescription matching logic
  const prescriptionMatchResult = useMemo(() => {
    if (!activePrescriptionId) return null;
    const rx = prescriptions.find(p => p.id === activePrescriptionId);
    if (!rx) return null;

    // For each pharmacy, calculate how many items of the prescription they have in stock
    const pharmacyMatches = pharmacies.map(p => {
      const matches = rx.items.map(item => {
        // Find matching medicine in pharmacy inventory
        const match = p.inventory.find(
          m => m.brand_name.toLowerCase().includes(item.medicineName.toLowerCase()) || 
               m.generic_name.toLowerCase().includes(item.medicineName.toLowerCase())
        );
        return {
          itemName: item.medicineName,
          requiredQty: item.quantity,
          availableQty: match?.stock ?? 0,
          price: match?.price ?? 0,
          status: (match?.stock ?? 0) >= item.quantity ? "IN_STOCK" : (match?.stock ?? 0) > 0 ? "LOW_STOCK" : "OUT_OF_STOCK"
        };
      });

      const allInStock = matches.every(m => m.status === "IN_STOCK");
      const matchedCount = matches.filter(m => m.status !== "OUT_OF_STOCK").length;

      return {
        pharmacyId: p.id,
        pharmacyName: p.name,
        distance: p.distance ?? 0,
        isOpen: p.isOpen,
        matches,
        allInStock,
        matchedCount,
        totalCount: rx.items.length
      };
    });

    // Suggest split combination if no single pharmacy has all items
    let splitCombination: {
      pharmaciesUsed: Array<{ name: string; distance: number; itemsMatched: string[] }>;
      totalPrice: number;
      totalDistance: number;
    } | null = null;

    // Find best combination splits
    const splitMap = new Map<string, { id: string; name: string; distance: number; items: string[]; price: number }>();
    let comboUnmatched = false;

    rx.items.forEach(item => {
      const candidates = pharmacies
        .map(p => {
          const match = p.inventory.find(
            m => (m.brand_name.toLowerCase().includes(item.medicineName.toLowerCase()) || 
                  m.generic_name.toLowerCase().includes(item.medicineName.toLowerCase())) &&
                  m.stock >= item.quantity
          );
          return { p, match };
        })
        .filter(x => x.match !== undefined)
        .sort((a, b) => (a.p.distance ?? 99) - (b.p.distance ?? 99));

      if (candidates.length > 0) {
        const best = candidates[0];
        const storeId = best.p.id;
        if (!splitMap.has(storeId)) {
          splitMap.set(storeId, {
            id: storeId,
            name: best.p.name,
            distance: best.p.distance ?? 0,
            items: [],
            price: 0
          });
        }
        const storeEntry = splitMap.get(storeId)!;
        storeEntry.items.push(item.medicineName);
        storeEntry.price += (best.match?.price ?? 0) * item.quantity;
      } else {
        comboUnmatched = true;
      }
    });

    if (!comboUnmatched && splitMap.size > 1) {
      const arr = Array.from(splitMap.values());
      const totalPrice = arr.reduce((sum, x) => sum + x.price, 0);
      const totalDistance = Number(arr.reduce((sum, x) => sum + x.distance, 0).toFixed(1));
      splitCombination = {
        pharmaciesUsed: arr.map(a => ({
          name: a.name,
          distance: a.distance,
          itemsMatched: a.items
        })),
        totalPrice,
        totalDistance
      };
    }

    // Sort: 1. All in stock first, 2. Max items matched next, 3. Proximity
    pharmacyMatches.sort((a, b) => {
      if (a.allInStock !== b.allInStock) return a.allInStock ? -1 : 1;
      if (a.matchedCount !== b.matchedCount) return b.matchedCount - a.matchedCount;
      return a.distance - b.distance;
    });

    return {
      prescription: rx,
      pharmacyMatches,
      splitCombination
    };
  }, [activePrescriptionId, prescriptions, pharmacies]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setMaxDistance(15);
    setOnlyOpenNow(false);
    setMinRating(0);
    setStockStatusFilter("ALL");
    setActivePrescriptionId("");
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
            🏪 {isEn ? "Smart Pharmacy Locator" : "स्मार्ट फार्मेसी लोकेटर"}
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1">
            {isEn 
              ? "Find nearby pharmacies, check live medicine stock levels, and match prescriptions." 
              : "आसपास की फार्मेसियों को खोजें, लाइव दवा स्टॉक की जांच करें और पर्चे का मिलान करें।"}
          </p>
        </div>

        {/* Locating Trigger Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={detectLocation}
            disabled={locating}
            className="bg-[#A3E635] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-400"
          >
            {locating ? "⏳ ..." : `📍 ${isEn ? "Detect Location" : "लोकेशन जांचें"}`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
            onClick={() => setManualLocationMode(prev => prev === "none" ? "pincode" : "none")}
          >
            {isEn ? "Search Custom Locality" : "कस्टम इलाका खोजें"}
          </Button>
        </div>
      </div>

      {/* LOCATION GPS METADATA BAR */}
      {coords && (
        <div className="bg-[#5C94FF]/10 border-2 border-[#5C94FF] p-3 text-xs font-bold text-foreground flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧭</span>
            <span>
              {isEn ? "Active GPS Location Centered:" : "सक्रिय जीपीएस लोकेशन केंद्रित:"}{" "}
              <span className="font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 border border-black/20 ml-1">
                Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}
              </span>
            </span>
          </div>
          {gpsError && <span className="text-red-600 font-bold">⚠️ {gpsError}</span>}
        </div>
      )}

      {/* MANUAL SEARCH COMPONENT */}
      {manualLocationMode !== "none" && (
        <form onSubmit={handleManualSearch} className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-2">
          <Input
            value={manualInput}
            onChange={(e) => setManualInputValue(e.target.value)}
            placeholder={isEn ? "Enter area name (e.g. Katra, Naini) or Pincode..." : "इलाके का नाम (जैसे कटरा, नैनी) या पिनकोड दर्ज करें..."}
            className="border-2 border-black rounded-none h-10 text-xs font-bold"
          />
          <Button
            type="submit"
            className="bg-[#A3E635] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isEn ? "Go" : "जाएं"}
          </Button>
        </form>
      )}

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-black bg-white dark:bg-[#1E1E1E] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Nearby Stores" : "आसपास की दुकानें"}</div>
          <div className="text-2xl font-black mt-1">{filteredPharmacies.length}</div>
        </Card>
        <Card className="border-2 border-black bg-[#5C94FF]/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Open Now" : "अभी खुली हैं"}</div>
          <div className="text-2xl font-black mt-1">{filteredPharmacies.filter(p => p.isOpen).length}</div>
        </Card>
        <Card className="border-2 border-black bg-[#A3E635]/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Mock Medicines" : "कुल दवाइयां"}</div>
          <div className="text-2xl font-black mt-1">100</div>
        </Card>
        <Card className="border-2 border-black bg-[#FFD166]/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Selected Radius" : "चयनित दायरा"}</div>
          <div className="text-2xl font-black mt-1">{maxDistance} km</div>
        </Card>
      </div>

      {/* SEARCH AND PRESCRIPTION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Medicine Search Bar (7 columns) */}
        <div className="md:col-span-7 relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "🔍 Search 100+ medicines (e.g. Paracetamol, Dolo, Insulin)..." : "🔍 100+ दवाएं खोजें (जैसे पैरासिटामोल, डोलो, इंसुलिन)..."}
            className="border-4 border-black rounded-none h-12 text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pl-4 pr-10 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-x-[2px] focus-visible:translate-y-[2px]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-3 top-3.5 text-gray-500 hover:text-black font-bold text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Prescription Selector (5 columns) */}
        <div className="md:col-span-5">
          <select
            className="h-12 w-full rounded-none border-4 border-black bg-white dark:bg-zinc-900 px-3 text-xs font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none focus:ring-2 focus:ring-primary/20"
            value={activePrescriptionId}
            onChange={(e) => setActivePrescriptionId(e.target.value)}
          >
            <option value="">📋 {isEn ? "Check Stock for a Prescription..." : "पर्चे के लिए स्टॉक जांचें..."}</option>
            {prescriptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.diagnosis} - Dr. {p.doctor.user.name} ({p.items.length} items)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-dashed border-black pb-2">
          <SlidersHorizontal className="size-4" />
          <span className="text-xs font-black uppercase tracking-wider">{isEn ? "Advanced Search Filters" : "उन्नत खोज फ़िल्टर"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Category" : "श्रेणी"}</label>
            <select
              className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? (isEn ? "All Categories" : "सभी श्रेणियां") : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Distance Range */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground">
              <span>{isEn ? "Distance" : "दूरी"}</span>
              <span className="text-primary-foreground bg-primary px-1 font-mono">{maxDistance} km</span>
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

          {/* Minimum Rating */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Min Rating" : "न्यूनतम रेटिंग"}</label>
            <select
              className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value="0">⭐️ {isEn ? "Any Rating" : "कोई भी रेटिंग"}</option>
              <option value="4">⭐️⭐️⭐️⭐️ 4.0+</option>
              <option value="4.5">⭐️⭐️⭐️⭐️½ 4.5+</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Stock Status" : "स्टॉक की स्थिति"}</label>
            <select
              className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
            >
              <option value="ALL">{isEn ? "Show All Stocks" : "सभी स्टॉक दिखाएं"}</option>
              <option value="IN_STOCK">{isEn ? "In Stock Only" : "केवल स्टॉक में"}</option>
              <option value="LOW_STOCK">{isEn ? "Low Stock Only" : "केवल कम स्टॉक"}</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="flex items-end pb-1 gap-4">
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="size-4 rounded-none border-2 border-black accent-black dark:accent-white"
              />
              <span>{isEn ? "Open Now Only" : "केवल अभी खुली"}</span>
            </label>
            {(searchQuery || selectedCategory !== "ALL" || maxDistance !== 15 || onlyOpenNow || minRating !== 0 || stockStatusFilter !== "ALL" || activePrescriptionId) && (
              <button 
                onClick={resetFilters}
                className="text-xs font-black text-red-500 hover:underline ml-auto"
              >
                ✕ {isEn ? "Reset" : "रीसेट"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex justify-between items-center">
        <div className="text-xs font-black uppercase text-muted-foreground">
          {isEn 
            ? `Showing ${filteredPharmacies.length} matched pharmacies` 
            : `मिलान वाली ${filteredPharmacies.length} फार्मेसियां दिखा रहा है`}
        </div>
        <div className="flex border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase transition-colors ${
              viewMode === "list" ? "bg-[#5C94FF] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
            }`}
          >
            <List className="size-3.5" />
            {isEn ? "List" : "सूची"}
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase transition-colors ${
              viewMode === "map" ? "bg-[#5C94FF] text-black" : "bg-white dark:bg-zinc-800 text-foreground"
            }`}
          >
            <MapIcon className="size-3.5" />
            {isEn ? "Radar Map" : "राडार मैप"}
          </button>
        </div>
      </div>

      {/* PRESCRIPTION STOCK OVERVIEW CARD */}
      {prescriptionMatchResult && (
        <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-black pb-2 mb-4">
            <h2 className="text-lg font-black uppercase text-foreground">
              📋 {isEn ? "Prescription Stock Match Matrix" : "पर्चे के लिए स्टॉक मिलान मैट्रिक्स"}
            </h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">
              {isEn ? "Diagnosis:" : "निदान:"} <span className="text-black dark:text-white font-black">{prescriptionMatchResult.prescription.diagnosis}</span> &middot; {isEn ? "Showing stock readiness across nearby pharmacies." : "आसपास की फार्मेसियों में स्टॉक की उपलब्धता।"}
            </p>
          </div>

          <div className="space-y-4">
            {prescriptionMatchResult.pharmacyMatches.slice(0, 3).map((match, idx) => (
              <div key={match.pharmacyId} className={`border-2 border-black p-3 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                match.allInStock ? "bg-[#A3E635]/15 border-[#A3E635]" : "bg-white dark:bg-zinc-900"
              }`}>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">{idx + 1}. {match.pharmacyName}</span>
                    <span className="text-xs font-bold text-muted-foreground">({match.distance} km)</span>
                    <span className={match.isOpen ? "pill-success" : "pill-danger text-[10px]"}>
                      {match.isOpen ? (isEn ? "Open" : "खुली है") : (isEn ? "Closed" : "बंद है")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase px-2 py-0.5 border-2 border-black ${
                      match.allInStock ? "bg-[#A3E635] text-black" : "bg-[#FFD166] text-black"
                    }`}>
                      {match.allInStock 
                        ? (isEn ? "All Items In Stock!" : "सभी दवाएं स्टॉक में हैं!") 
                        : `${match.matchedCount}/${match.totalCount} ${isEn ? "In Stock" : "स्टॉक में"}`}
                    </span>
                  </div>
                </div>

                {/* Individual Medicines status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  {match.matches.map((itemStatus, itemIdx) => (
                    <div key={itemIdx} className="bg-gray-50 dark:bg-zinc-800 p-2 border border-black/20 text-xs font-bold flex justify-between items-center">
                      <div>
                        <div className="font-black">{itemStatus.itemName}</div>
                        <div className="text-[10px] text-gray-500">{isEn ? "Need:" : "चाहिए:"} {itemStatus.requiredQty}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 ${
                        itemStatus.status === "IN_STOCK" ? "text-emerald bg-emerald-light border border-emerald" :
                        itemStatus.status === "LOW_STOCK" ? "text-amber bg-amber-light border border-amber" :
                        "text-red bg-red-light border border-red"
                      }`}>
                        {itemStatus.status === "IN_STOCK" ? (isEn ? "Available" : "उपलब्ध") :
                         itemStatus.status === "LOW_STOCK" ? `${itemStatus.availableQty} ${isEn ? "Left" : "बची"}` : 
                         (isEn ? "Out of Stock" : "स्टॉक नहीं")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Split combination suggestion if available */}
            {prescriptionMatchResult.splitCombination && (
              <div className="border-4 border-black border-dashed p-4 bg-[#5C94FF]/10 rounded-none mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💡</span>
                  <h3 className="font-black text-sm uppercase text-blue-900 dark:text-blue-200">
                    {isEn ? "Optimal Multi-Pharmacy Split Suggestion" : "सर्वोत्तम बहु-फार्मेसी स्टॉक विभाजन सुझाव"}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  {isEn 
                    ? "No single pharmacy contains all prescribed items. Try splitting your purchase across these stores:" 
                    : "किसी एक फार्मेसी में सभी दवाएं उपलब्ध नहीं हैं। अपनी खरीद को इन दुकानों में विभाजित करें:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prescriptionMatchResult.splitCombination.pharmaciesUsed.map((pUsed, pIdx) => (
                    <div key={pIdx} className="bg-white dark:bg-zinc-900 border-2 border-black p-3 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                      <div className="font-black text-foreground">{pUsed.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Proximity: {pUsed.distance} km</div>
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block">{isEn ? "Collect Items:" : "दवाएं प्राप्त करें:"}</span>
                        {pUsed.itemsMatched.map((itName, itIdx) => (
                          <div key={itIdx} className="text-emerald-700 dark:text-emerald-400 font-bold">• {itName}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-black/20 flex justify-between items-center text-xs font-black">
                  <span>🚗 {isEn ? "Combined Proximity" : "संयुक्त दूरी"}: {prescriptionMatchResult.splitCombination.totalDistance} km</span>
                  <span>💰 {isEn ? "Estimated Cost" : "अनुमानित कीमत"}: ₹{prescriptionMatchResult.splitCombination.totalPrice}</span>
                </div>
              </div>
            )}

          </div>
        </Card>
      )}

      {/* NOTIFICATIONS & ALERTS DASHBOARD WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LIST VIEW OR MAP VIEW BLOCK (8 columns) */}
        <div className="lg:col-span-8">
          
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredPharmacies.length === 0 ? (
                <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-4xl">🏪</span>
                  <h3 className="text-lg font-black uppercase mt-3">{isEn ? "No Nearby Pharmacies Found" : "कोई आसपास की फार्मेसी नहीं मिली"}</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {isEn 
                      ? "Try increasing the search radius, changing filters, or using custom pincode search." 
                      : "खोज का दायरा बढ़ाने, फ़िल्टर बदलने या कस्टम पिनकोड का उपयोग करने का प्रयास करें।"}
                  </p>
                  <Button onClick={resetFilters} className="mt-4" size="sm">{isEn ? "Reset Search" : "खोज रीसेट करें"}</Button>
                </div>
              ) : (
                filteredPharmacies.map((pharmacy) => (
                  <Card key={pharmacy.id} className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-black p-4 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800 flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{pharmacy.name}</h2>
                          <span className={pharmacy.isOpen ? "pill-success" : "pill-danger text-[10px]"}>
                            {pharmacy.isOpen ? (isEn ? "Open" : "खुली है") : (isEn ? "Closed" : "बंद है")}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                          📍 {pharmacy.area}, Prayagraj (Pincode: {pharmacy.pincode})
                        </p>
                      </div>

                      {/* Distance Badge */}
                      <div className="text-right">
                        <div className="text-sm font-black text-[#5C94FF]">{pharmacy.distance} km away</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">🚗 {pharmacy.travelTime}</div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-4">
                      {/* Pharmacy Info Rows */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-foreground border-b border-dashed border-black/20 pb-3">
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3.5 text-muted-foreground" />
                          <span>{pharmacy.contact}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span>{pharmacy.openingHours}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="size-3.5 text-amber-500 fill-amber-500" />
                          <span>{pharmacy.rating} / 5.0</span>
                        </div>
                      </div>

                      {/* Medicine inventories snippet */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex justify-between">
                          <span>{isEn ? "Available Stock List" : "उपलब्ध स्टॉक सूची"}</span>
                          <span>{pharmacy.inventory.length} {isEn ? "matched items" : "मिलान दवाएं"}</span>
                        </div>

                        {/* Inventory Grid (horizontal scrolling or responsive layout) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {pharmacy.inventory.slice(0, 6).map((med) => (
                            <div
                              key={med.medicine_id}
                              onClick={() => setSelectedMedicine(med)}
                              className="border border-black/10 bg-gray-50 dark:bg-zinc-800 p-2 text-xs font-bold flex justify-between items-center cursor-pointer transition-colors hover:bg-muted/40"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-sm font-black text-foreground truncate">{med.brand_name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{med.generic_name}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 border ${
                                  med.stock > 20 ? "text-emerald bg-emerald-light border-emerald" :
                                  med.stock > 0 ? "text-amber bg-amber-light border-amber" :
                                  "text-red bg-red-light border-red"
                                }`}>
                                  {med.stock > 20 ? (isEn ? "In Stock" : "स्टॉक में") :
                                   med.stock > 0 ? `${med.stock} ${isEn ? "Left" : "बचे"}` : 
                                   (isEn ? "Out of Stock" : "स्टॉक नहीं")}
                                </span>
                                <div className="text-[10px] font-mono font-black mt-1 text-foreground">₹{med.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {pharmacy.inventory.length > 6 && (
                          <button
                            onClick={() => setSelectedPharmacy(pharmacy)}
                            className="w-full text-center text-xs font-black text-[#5C94FF] uppercase tracking-wide pt-2 hover:underline"
                          >
                            + {isEn ? "View all medicines" : "सभी दवाएं देखें"} ({pharmacy.inventory.length})
                          </button>
                        )}
                      </div>

                      {/* Detail View action footer */}
                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedPharmacy(pharmacy)}
                          className="bg-white text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
                        >
                          {isEn ? "View Store Details" : "दुकान का विवरण देखें"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* MAP RADAR VIEW (Plotting SVG interactive radar) */
            <VectorStreetMap
              userCoords={coords}
              selectedMarkerId={selectedPharmacy?.id ?? null}
              markers={filteredPharmacies.map(p => ({
                id: p.id,
                name: p.name,
                lat: p.lat,
                lon: p.lon,
                type: "pharmacy",
                distance: p.distance
              }))}
              onSelectMarker={(id) => {
                const found = filteredPharmacies.find(p => p.id === id);
                if (found) setSelectedPharmacy(found);
              }}
              trafficCongestion={trafficCongestion}
              setTrafficCongestion={setTrafficCongestion}
              language={language}
            />
          )}

        </div>

        {/* NOTIFICATIONS FEED & GLOBAL MEDICINE INFO CARD (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notifications widget */}
          <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <CardHeader className="border-b-2 border-black p-4 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-zinc-900 dark:to-zinc-800">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-red-500 animate-bounce" />
                <CardTitle className="text-base font-black uppercase text-foreground">{isEn ? "Active Notifications" : "सक्रिय सूचनाएं"}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {notifications.map(nt => (
                <div 
                  key={nt.id} 
                  className={`p-2.5 border-2 border-black text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-2 ${
                    nt.type === "alert" ? "bg-red-50" : nt.type === "success" ? "bg-emerald-50" : "bg-blue-50"
                  }`}
                >
                  <span className="text-sm shrink-0">
                    {nt.type === "alert" ? "⚠️" : nt.type === "success" ? "✅" : "ℹ️"}
                  </span>
                  <div>
                    <p className="text-foreground leading-snug">{nt.text}</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">{nt.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Medicine availability global lookup panel */}
          {searchQuery.trim() && medicineGlobalSearchResults.length > 0 && (
            <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b-2 border-black p-4 bg-[#FFD166]/10">
                <CardTitle className="text-base font-black uppercase">{isEn ? "Availability Matrix" : "उपलब्धता मैट्रिक्स"}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[360px] overflow-y-auto">
                {medicineGlobalSearchResults.map(res => (
                  <div key={res.name} className="border-2 border-black p-3 bg-gray-50 dark:bg-zinc-800 space-y-2">
                    <div className="flex justify-between items-start border-b border-dashed border-black/20 pb-1">
                      <div>
                        <h4 className="font-black text-sm text-foreground">{res.brand}</h4>
                        <span className="text-[10px] text-muted-foreground">{res.generic}</span>
                      </div>
                      <span className="pill-info">{res.category}</span>
                    </div>

                    <div className="space-y-1.5">
                      {res.pharmacies.slice(0, 3).map(ph => (
                        <div key={ph.name} className="text-xs flex justify-between items-center bg-white dark:bg-zinc-900 p-1.5 border border-black/10">
                          <div>
                            <span className="font-bold text-foreground block">{ph.name}</span>
                            <span className="text-[9px] text-gray-500">Distance: {ph.distance} km</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[9px] font-black uppercase px-1 ${
                              ph.stock > 20 ? "text-emerald bg-emerald-light" :
                              ph.stock > 0 ? "text-amber bg-amber-light" : "text-red bg-red-light"
                            }`}>
                              {ph.stock > 0 ? `${ph.stock} ${isEn ? "left" : "बचे"}` : (isEn ? "No stock" : "स्टॉक नहीं")}
                            </span>
                            <span className="block text-[10px] font-black mt-0.5">₹{ph.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* 1. PHARMACY DETAILS DIALOG MODAL */}
      {selectedPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-none border-4 border-black bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[80svh]">
            
            {/* Header */}
            <div className="border-b-4 border-black p-4 bg-[#5C94FF] text-black flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{selectedPharmacy.name}</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-black/75">
                  📍 {selectedPharmacy.area}, Prayagraj &middot; {selectedPharmacy.distance} km away
                </p>
              </div>
              <button 
                onClick={() => setSelectedPharmacy(null)}
                className="size-8 rounded-none border-2 border-black bg-white flex items-center justify-center font-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#121212]">
              {/* Store metadata summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FFFAF0] dark:bg-zinc-900 border-2 border-black p-4 text-xs font-bold text-foreground">
                <div>
                  <span className="text-gray-500 uppercase block text-[9px]">{isEn ? "Pincode" : "पिनकोड"}</span>
                  <span>{selectedPharmacy.pincode}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block text-[9px]">{isEn ? "Store Rating" : "दुकान रेटिंग"}</span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3 text-amber-500 fill-amber-500" />
                    {selectedPharmacy.rating} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase block text-[9px]">{isEn ? "Working Hours" : "काम करने के घंटे"}</span>
                  <span>{selectedPharmacy.openingHours}</span>
                </div>
              </div>

              {/* Inventory items list */}
              <div className="space-y-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground border-b-2 border-dashed border-black pb-1">
                  📦 {isEn ? "Store Stock Catalog" : "दुकान स्टॉक कैटलॉग"}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPharmacy.inventory.map(med => (
                    <div 
                      key={med.medicine_id}
                      onClick={() => {
                        setSelectedMedicine(med);
                      }}
                      className="border-2 border-black p-3 bg-gray-50 dark:bg-zinc-800 text-xs font-bold flex justify-between items-center cursor-pointer transition-transform hover:-translate-y-0.5"
                    >
                      <div>
                        <h4 className="font-black text-sm text-foreground">{med.brand_name}</h4>
                        <span className="text-[10px] text-muted-foreground">{med.generic_name}</span>
                        <div className="text-[9px] text-[#5C94FF] mt-1 uppercase tracking-wide">{med.category}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 border ${
                          med.stock > 20 ? "text-emerald bg-emerald-light border-emerald" :
                          med.stock > 0 ? "text-amber bg-amber-light border-amber" :
                          "text-red bg-red-light border-red"
                        }`}>
                          {med.stock > 20 ? (isEn ? "In Stock" : "स्टॉक में") :
                           med.stock > 0 ? `${med.stock} ${isEn ? "Left" : "बचे"}` : 
                           (isEn ? "Out of Stock" : "स्टॉक नहीं")}
                        </span>
                        <div className="text-sm font-black mt-2 text-foreground">₹{med.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-4 border-black p-4 bg-gray-50 dark:bg-zinc-900 flex justify-between items-center">
              <a href={`tel:${selectedPharmacy.contact}`} className="flex items-center gap-1 text-xs font-black uppercase underline">
                📞 {isEn ? "Call Pharmacy" : "फ़ोन करें"}: {selectedPharmacy.contact}
              </a>
              <Button
                onClick={() => setSelectedPharmacy(null)}
                className="bg-black text-white border-2 border-black font-black"
              >
                {isEn ? "Close" : "बंद करें"}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* 2. MEDICINE DETAILS DIALOG MODAL */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-none border-4 border-black bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="border-b-4 border-black p-4 bg-[#FFD166] text-black flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{selectedMedicine.brand_name}</h2>
                <span className="pill-info bg-white text-xs border-black">{selectedMedicine.category}</span>
              </div>
              <button 
                onClick={() => setSelectedMedicine(null)}
                className="size-8 rounded-none border-2 border-black bg-white flex items-center justify-center font-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-4 text-xs font-bold text-foreground bg-white dark:bg-[#1E1E1E] leading-relaxed">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Generic Formula" : "जेनेरिक नाम"}</span>
                <span className="text-sm font-black text-foreground">{selectedMedicine.generic_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Dosage Guidelines" : "खुराक निर्देश"}</span>
                <p className="text-muted-foreground">{selectedMedicine.dosage}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Recommended Uses" : "दवा के उपयोग"}</span>
                <p className="text-muted-foreground">{selectedMedicine.uses}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Common Side Effects" : "संभावित दुष्प्रभाव"}</span>
                <p className="text-red-500">{selectedMedicine.sideEffects}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-dashed border-black p-4 bg-gray-50 dark:bg-zinc-900 flex justify-end">
              <Button
                onClick={() => setSelectedMedicine(null)}
                className="bg-black text-white border-2 border-black font-black"
              >
                {isEn ? "Back to Search" : "वापस जाएं"}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
