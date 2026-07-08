"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Edit3, 
  Plus, 
  Calendar, 
  IndianRupee, 
  CheckCircle,
  BrainCircuit,
  Search,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import defaultData from "../../data/pharmacy_locator_data.json";

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
}

interface PharmacyInventoryDashboardProps {
  language: string;
  t: (key: string) => string;
}

const CURRENT_DATE = new Date("2026-07-08"); // Fixed anchor date matching mock mfg/exp dates

export default function PharmacyInventoryDashboard({ language, t }: PharmacyInventoryDashboardProps) {
  const isEn = language === "en";

  // List of stores for owner to toggle (demo mode)
  const stores = useMemo(() => defaultData.pharmacies, []);

  const [activeStoreId, setActiveStoreId] = useState<string>("PH001");
  const [localInventory, setLocalInventory] = useState<Medicine[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [alertFilter, setAlertFilter] = useState<"ALL" | "LOW_STOCK" | "EXPIRING" | "EXPIRED">("ALL");

  // Modal edit states
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMedForm, setNewMedForm] = useState<Partial<Medicine>>({
    brand_name: "",
    generic_name: "",
    category: "Pain Relief",
    stock: 50,
    price: 35,
    minThreshold: 15,
    batchNumber: "BCH-2026-NEW",
    manufacturer: "Cipla Ltd",
    dosageForm: "Tablet",
    strength: "500mg",
    expiryDate: "2027-12-31",
    mfgDate: "2026-01-01",
    storageInstructions: "Store below 30°C. Protect from light.",
    uses: "Symptomatic treatment of mild pain and fever",
    sideEffects: "Stomach discomfort",
    dosage: "1 tablet after meals as required"
  });

  // Load inventory from localStorage (enabling real-time sync with patient page)
  useEffect(() => {
    const storageKey = `sanjeevni-inventory-${activeStoreId}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setLocalInventory(JSON.parse(cached));
      } catch {
        // Fallback
        const store = stores.find(s => s.id === activeStoreId) || stores[0];
        setLocalInventory(store.inventory);
      }
    } else {
      const store = stores.find(s => s.id === activeStoreId) || stores[0];
      setLocalInventory(store.inventory);
    }
  }, [activeStoreId, stores]);

  // Save changes to localstorage and sync global locator file
  const saveInventoryState = (updatedInventory: Medicine[]) => {
    setLocalInventory(updatedInventory);
    localStorage.setItem(`sanjeevni-inventory-${activeStoreId}`, JSON.stringify(updatedInventory));
    
    // Write back to mock database localstorage so patients locate correctly
    const globalKey = `sanjeevni-global-pharmacies`;
    const savedGlobal = localStorage.getItem(globalKey);
    let allPharmacies = defaultData.pharmacies;
    if (savedGlobal) {
      try {
        allPharmacies = JSON.parse(savedGlobal);
      } catch {
        allPharmacies = defaultData.pharmacies;
      }
    }

    const updatedGlobal = allPharmacies.map(p => {
      if (p.id === activeStoreId) {
        return { ...p, inventory: updatedInventory };
      }
      return p;
    });

    localStorage.setItem(globalKey, JSON.stringify(updatedGlobal));
  };

  // Sync patient locator component values if they are loaded on the same client
  useEffect(() => {
    // Save initial global pharmacies to storage if not present
    const globalKey = `sanjeevni-global-pharmacies`;
    if (!localStorage.getItem(globalKey)) {
      localStorage.setItem(globalKey, JSON.stringify(defaultData.pharmacies));
    }
  }, []);

  // Compute Active Store info
  const activeStore = useMemo(() => {
    return stores.find(s => s.id === activeStoreId) || stores[0];
  }, [activeStoreId, stores]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    localInventory.forEach(m => set.add(m.category));
    return ["ALL", ...Array.from(set)];
  }, [localInventory]);

  // Calculation helpers
  const stats = useMemo(() => {
    let totalItems = localInventory.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let expiringSoon = 0; // within 60 days
    let expired = 0;
    let totalVal = 0;

    localInventory.forEach(med => {
      const expDate = new Date(med.expiryDate);
      const diffTime = expDate.getTime() - CURRENT_DATE.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isExpired = diffDays <= 0;
      const isExpiringSoon = diffDays > 0 && diffDays <= 60;

      if (isExpired) {
        expired++;
      } else {
        if (isExpiringSoon) expiringSoon++;
        
        // Stock count categorizations
        if (med.stock === 0) {
          outOfStock++;
        } else if (med.stock <= med.minThreshold) {
          lowStock++;
        } else {
          inStock++;
        }
      }

      totalVal += med.price * med.stock;
    });

    // Inventory Health Score calculation (max 100)
    // Decreases with out of stock items, expired items, and low stock warnings
    const stockPenalties = (outOfStock * 3) + (lowStock * 1);
    const expPenalties = (expired * 5) + (expiringSoon * 2);
    const healthScore = Math.max(30, 100 - stockPenalties - expPenalties);

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      expiringSoon,
      expired,
      totalVal,
      healthScore
    };
  }, [localInventory]);

  // Filtered Inventory items
  const filteredInventory = useMemo(() => {
    return localInventory.filter(med => {
      // Search check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          med.brand_name.toLowerCase().includes(query) ||
          med.generic_name.toLowerCase().includes(query) ||
          med.batchNumber.toLowerCase().includes(query) ||
          med.manufacturer.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category check
      if (selectedCategory !== "ALL" && med.category !== selectedCategory) return false;

      // Status filters
      const expDate = new Date(med.expiryDate);
      const diffTime = expDate.getTime() - CURRENT_DATE.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isExpired = diffDays <= 0;
      const isExpiringSoon = diffDays > 0 && diffDays <= 60;

      if (alertFilter === "EXPIRED" && !isExpired) return false;
      if (alertFilter === "EXPIRING" && !isExpiringSoon) return false;
      if (alertFilter === "LOW_STOCK" && (med.stock === 0 || med.stock > med.minThreshold || isExpired)) return false;

      return true;
    });
  }, [localInventory, searchQuery, selectedCategory, alertFilter]);

  // Expiration warnings feed list
  const expirationAlerts = useMemo(() => {
    return localInventory
      .map(med => {
        const expDate = new Date(med.expiryDate);
        const diffTime = expDate.getTime() - CURRENT_DATE.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { med, diffDays };
      })
      .filter(x => x.diffDays <= 60)
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [localInventory]);

  // Edit stock item
  const handleEditClick = (med: Medicine) => {
    setEditingMedicine({ ...med });
  };

  // Submit edit changes
  const saveEditedMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;

    const updated = localInventory.map(med => {
      if (med.medicine_id === editingMedicine.medicine_id) {
        return { ...editingMedicine };
      }
      return med;
    });

    saveInventoryState(updated);
    setEditingMedicine(null);
  };

  // Submit add new item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newId = `MED${String(localInventory.length + 1).padStart(3, "0")}`;
    const newMed: Medicine = {
      ...(newMedForm as Medicine),
      medicine_id: newId,
      stock: Number(newMedForm.stock || 0),
      price: Number(newMedForm.price || 0),
      minThreshold: Number(newMedForm.minThreshold || 0)
    };

    const updated = [newMed, ...localInventory];
    saveInventoryState(updated);
    setIsAddingNew(false);
    // Reset form
    setNewMedForm({
      brand_name: "",
      generic_name: "",
      category: "Pain Relief",
      stock: 50,
      price: 35,
      minThreshold: 15,
      batchNumber: "BCH-2026-NEW",
      manufacturer: "Cipla Ltd",
      dosageForm: "Tablet",
      strength: "500mg",
      expiryDate: "2027-12-31",
      mfgDate: "2026-01-01",
      storageInstructions: "Store below 30°C. Protect from light.",
      uses: "Symptomatic treatment of mild pain and fever",
      sideEffects: "Stomach discomfort",
      dosage: "1 tablet after meals as required"
    });
  };

  // Delete inventory item
  const handleDeleteItem = (id: string) => {
    if (window.confirm(isEn ? "Are you sure you want to remove this medicine from inventory?" : "क्या आप वाकई इस दवा को इन्वेंटरी से हटाना चाहते हैं?")) {
      const updated = localInventory.filter(med => med.medicine_id !== id);
      saveInventoryState(updated);
    }
  };

  // AI insights calculation
  const aiInsights = useMemo(() => {
    // Fast moving (low stock but high initial allocation)
    const fastMoving = localInventory
      .filter(m => m.stock < 20)
      .slice(0, 3)
      .map(m => m.brand_name);

    // Slow moving (heavy stock but low price)
    const slowMoving = localInventory
      .filter(m => m.stock > 100 && m.price < 40)
      .slice(0, 3)
      .map(m => m.brand_name);

    // Reorder advice
    const reorderSuggestions = localInventory
      .filter(m => m.stock <= m.minThreshold)
      .slice(0, 3)
      .map(m => ({
        name: m.brand_name,
        suggested: m.minThreshold * 3 - m.stock,
        depletionDays: Math.max(2, Math.round(m.stock / 2))
      }));

    return {
      fastMoving,
      slowMoving,
      reorderSuggestions
    };
  }, [localInventory]);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH DEMO SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-foreground">
            📦 {isEn ? "Smart Pharmacy Inventory Hub" : "स्मार्ट फार्मेसी इन्वेंटरी हब"}
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-0.5">
            {isEn ? "Manage batches, trace expiries, view AI restocking trends, and monitor thresholds." : "बैच प्रबंधित करें, समाप्ति ट्रैक करें, एआई पुनरारंभ रुझान देखें और सीमाओं की निगरानी करें।"}
          </p>
        </div>

        {/* Demo store selector */}
        <div className="flex items-center gap-2 border-2 border-black p-2 bg-[#FFD166] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xs font-black uppercase text-black">{isEn ? "Demo Pharmacy Selection" : "डेमो फार्मेसी चयन"}:</span>
          <select
            className="bg-white border border-black font-bold text-xs p-1 h-7 rounded-none cursor-pointer outline-none"
            value={activeStoreId}
            onChange={(e) => setActiveStoreId(e.target.value)}
          >
            {stores.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.area})</option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-2 border-black bg-white dark:bg-[#1E1E1E] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "Total Items" : "कुल दवाइयां"}</div>
          <div className="text-xl font-black mt-1">{stats.totalItems}</div>
        </Card>
        
        <Card className="border-2 border-black bg-[#A3E635]/15 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "In Stock" : "स्टॉक में"}</div>
          <div className="text-xl font-black mt-1 text-emerald-600">🟢 {stats.inStock}</div>
        </Card>

        <Card className="border-2 border-black bg-[#FFD166]/15 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "Low Stock Alerts" : "कम स्टॉक चेतावनी"}</div>
          <div className="text-xl font-black mt-1 text-amber-600">🟡 {stats.lowStock}</div>
        </Card>

        <Card className="border-2 border-black bg-[#FF8A8A]/15 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "Out of Stock" : "स्टॉक खत्म"}</div>
          <div className="text-xl font-black mt-1 text-red-600">🔴 {stats.outOfStock}</div>
        </Card>

        <Card className="border-2 border-black bg-orange-100/30 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "Expiring Soon / Expired" : "समाप्ति चेतावनी"}</div>
          <div className="text-xl font-black mt-1 text-orange-600">⚠️ {stats.expiringSoon + stats.expired}</div>
        </Card>

        <Card className="border-2 border-black bg-[#5C94FF]/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 text-center">
          <div className="text-[10px] font-black text-muted-foreground uppercase">{isEn ? "Total Inventory Value" : "कुल स्टॉक मूल्य"}</div>
          <div className="text-xl font-black mt-1">₹{stats.totalVal}</div>
        </Card>
      </div>

      {/* WARNING ALERTS & AI INSIGHTS ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CRITICAL STOCK/EXPIRY ALERTS (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black p-4 bg-orange-50 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-orange-500 animate-pulse" />
                <CardTitle className="text-base font-black uppercase text-foreground">
                  ⚠️ {isEn ? "Urgent Stock & Expiration Warnings" : "तत्काल स्टॉक और समाप्ति चेतावनी"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              
              {/* Expired alert */}
              {localInventory.filter(m => {
                const diff = new Date(m.expiryDate).getTime() - CURRENT_DATE.getTime();
                return diff <= 0;
              }).map(item => (
                <div key={`${item.medicine_id}-exp`} className="bg-red-50 border-2 border-red-400 p-2.5 text-xs font-bold text-red-900 flex justify-between items-center">
                  <div>
                    <span className="font-black">{item.brand_name}</span> ({isEn ? "Batch" : "बैच"}: {item.batchNumber})
                    <div className="text-[10px] text-red-700 mt-0.5">{isEn ? "Expired on:" : "समाप्त तिथि:"} {item.expiryDate}</div>
                  </div>
                  <span className="bg-red-600 text-white font-black px-1.5 py-0.5 text-[9px] uppercase tracking-wider">{isEn ? "EXPIRED" : "समाप्त"}</span>
                </div>
              ))}

              {/* Expiring soon warnings */}
              {expirationAlerts.filter(x => x.diffDays > 0).map(({ med, diffDays }) => (
                <div key={`${med.medicine_id}-exp-soon`} className="bg-orange-50 border-2 border-orange-300 p-2.5 text-xs font-bold text-orange-950 flex justify-between items-center">
                  <div>
                    <span className="font-black">{med.brand_name}</span> &middot; {med.strength} ({isEn ? "Batch" : "बैच"}: {med.batchNumber})
                    <div className="text-[10px] text-orange-800 mt-0.5">
                      ⚠️ {isEn ? `Expires in ${diffDays} days (${med.expiryDate})` : `समाप्ति में ${diffDays} दिन बचे हैं (${med.expiryDate})`}
                    </div>
                  </div>
                  <span className="bg-[#FFD166] text-black border border-black font-black px-1.5 py-0.5 text-[9px] uppercase">{isEn ? "NEAR EXPIRY" : "समाप्ति के करीब"}</span>
                </div>
              ))}

              {/* Low stock threshold warning */}
              {localInventory.filter(m => m.stock > 0 && m.stock <= m.minThreshold).map(item => (
                <div key={`${item.medicine_id}-low`} className="bg-amber-50 border-2 border-amber-300 p-2.5 text-xs font-bold text-amber-950 flex justify-between items-center">
                  <div>
                    <span className="font-black">{item.brand_name}</span> &middot; {item.strength}
                    <div className="text-[10px] text-amber-800 mt-0.5">
                      {isEn ? `Stock: ${item.stock} / Threshold: ${item.minThreshold}` : `स्टॉक: ${item.stock} / सीमा: ${item.minThreshold}`}
                    </div>
                  </div>
                  <span className="bg-[#FFD166] text-black border border-black font-black px-1.5 py-0.5 text-[9px] uppercase">{isEn ? "LOW STOCK" : "कम स्टॉक"}</span>
                </div>
              ))}

              {/* Empty state */}
              {stats.lowStock === 0 && stats.expiringSoon === 0 && stats.expired === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground font-bold">
                  ✅ {isEn ? "All medicines in safe stock parameters." : "सभी दवाएं सुरक्षित स्टॉक मापदंडों में हैं।"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI INSIGHTS CARD (5 columns) */}
        <div className="lg:col-span-5">
          <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="border-b-2 border-black p-4 bg-[#A3E635]/15">
              <div className="flex items-center gap-2">
                <BrainCircuit className="size-5 text-lime-600 animate-pulse" />
                <CardTitle className="text-base font-black uppercase text-foreground">
                  🧠 {isEn ? "Sanjeevni AI Inventory Insights" : "संजीवनी एआई इन्वेंटरी अंतर्दृष्टि"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-bold text-foreground">
              
              {/* Inventory health score gauge */}
              <div className="flex items-center justify-between border-b border-dashed border-black/20 pb-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">{isEn ? "Inventory Health Score" : "इन्वेंटरी स्वास्थ्य स्कोर"}</span>
                  <div className="text-lg font-black mt-0.5 text-foreground">
                    {stats.healthScore} / 100
                  </div>
                </div>
                <div className="w-16 h-8 relative">
                  <div className={`text-center font-black py-0.5 text-[10px] border-2 border-black ${
                    stats.healthScore > 85 ? "bg-[#A3E635]" : stats.healthScore > 70 ? "bg-[#FFD166]" : "bg-[#FF8A8A]"
                  }`}>
                    {stats.healthScore > 85 ? (isEn ? "EXCELLENT" : "उत्कृष्ट") : stats.healthScore > 70 ? (isEn ? "STABLE" : "स्थिर") : (isEn ? "RISK" : "खतरा")}
                  </div>
                </div>
              </div>

              {/* Fast moving alerts */}
              <div>
                <span className="text-[10px] text-[#5C94FF] uppercase block">{isEn ? "Fast-Moving Medicines (Restock Suggested)" : "तेजी से बिकने वाली दवाएं (पुनः स्टॉक का सुझाव)"}</span>
                <p className="text-muted-foreground mt-0.5 font-semibold">
                  ⚡️ {aiInsights.fastMoving.join(", ") || (isEn ? "None currently" : "अभी कोई नहीं")}
                </p>
              </div>

              {/* Slow moving warning */}
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">{isEn ? "Slow-Moving Inventory (Discount Opportunity)" : "धीमी गति से बिकने वाला स्टॉक (छूट का अवसर)"}</span>
                <p className="text-muted-foreground mt-0.5 font-semibold">
                  🐌 {aiInsights.slowMoving.join(", ") || (isEn ? "None currently" : "अभी कोई नहीं")}
                </p>
              </div>

              {/* Auto reorder levels */}
              <div>
                <span className="text-[10px] text-orange-600 uppercase block">{isEn ? "Suggested Refill Orders" : "सुझाए गए रिफिल ऑर्डर"}</span>
                <div className="mt-1 space-y-1 text-[11px]">
                  {aiInsights.reorderSuggestions.map(rec => (
                    <div key={rec.name} className="flex justify-between bg-gray-50 dark:bg-zinc-900 p-1 border border-black/10">
                      <span>{rec.name}</span>
                      <span className="text-emerald-700">+{rec.suggested} units ({isEn ? "depletes in" : "समाप्ति में"} {rec.depletionDays}d)</span>
                    </div>
                  ))}
                  {aiInsights.reorderSuggestions.length === 0 && (
                    <span className="text-muted-foreground font-normal">{isEn ? "No low-stock items requiring refill." : "रिफिल की आवश्यकता वाला कोई कम-स्टॉक आइटम नहीं।"}</span>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* INVENTORY MOVEMENT CHART CARD */}
      <Card className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
        <CardHeader className="p-0 pb-3 mb-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            <CardTitle className="text-base font-black uppercase text-foreground">{isEn ? "Monthly Stock Dispersal Trends" : "मासिक स्टॉक वितरण रुझान"}</CardTitle>
          </div>
        </CardHeader>
        
        {/* Render a beautiful HTML/CSS representation of a monthly stock bar chart */}
        <div className="flex h-36 items-end gap-3 pt-6 border-b border-black">
          {[
            { m: "Jan", val: 1200, color: "bg-[#5C94FF]" },
            { m: "Feb", val: 1800, color: "bg-[#FFD166]" },
            { m: "Mar", val: 1450, color: "bg-[#A3E635]" },
            { m: "Apr", val: 2600, color: "bg-[#FF8A8A]" },
            { m: "May", val: 2100, color: "bg-[#5C94FF]" },
            { m: "Jun", val: 2900, color: "bg-[#A3E635]" },
            { m: "Jul", val: 3200, color: "bg-[#FFD166]" }
          ].map((bar, i) => {
            const pct = (bar.val / 3500) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip value */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] px-1 py-0.5 rounded-none z-10 font-mono">
                  {bar.val} units
                </div>
                
                {/* Bar */}
                <div 
                  className={`w-full ${bar.color} border-2 border-black border-b-0`}
                  style={{ height: `${pct * 0.9}px` }}
                ></div>
                
                {/* Axis Label */}
                <span className="text-[10px] font-black uppercase text-muted-foreground mt-1.5">{bar.m}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* FILTER SEARCH AND ADD NEW MEDICINE ROW */}
      <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
        
        {/* Upper search and add bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "🔍 Search by medicine name, manufacturer, batch..." : "🔍 दवा का नाम, निर्माता, बैच द्वारा खोजें..."}
              className="border-2 border-black rounded-none font-bold text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-500 font-bold text-sm">✕</button>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="bg-[#A3E635] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Plus className="size-4 mr-1" />
            {isEn ? "Add New Stock" : "नया स्टॉक जोड़ें"}
          </Button>
        </div>

        {/* Lower category and alert selection bars */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          
          {/* Category selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 uppercase text-[10px]">{isEn ? "Category" : "श्रेणी"}:</span>
            <select
              className="h-8 border-2 border-black bg-white dark:bg-zinc-800 px-2 outline-none rounded-none text-xs"
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

          {/* Warning filtering */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 uppercase text-[10px]">{isEn ? "Filters" : "फ़िल्टर"}:</span>
            <div className="flex border border-black overflow-hidden rounded-none text-[10px]">
              <button 
                onClick={() => setAlertFilter("ALL")}
                className={`px-2 py-1 border-r border-black font-black ${alertFilter === "ALL" ? "bg-[#5C94FF] text-black" : "bg-white dark:bg-zinc-800"}`}
              >
                {isEn ? "All" : "सभी"}
              </button>
              <button 
                onClick={() => setAlertFilter("LOW_STOCK")}
                className={`px-2 py-1 border-r border-black font-black ${alertFilter === "LOW_STOCK" ? "bg-[#FFD166] text-black" : "bg-white dark:bg-zinc-800"}`}
              >
                {isEn ? "Low Stock" : "कम स्टॉक"}
              </button>
              <button 
                onClick={() => setAlertFilter("EXPIRING")}
                className={`px-2 py-1 border-r border-black font-black ${alertFilter === "EXPIRING" ? "bg-orange-400 text-black" : "bg-white dark:bg-zinc-800"}`}
              >
                {isEn ? "Expiring" : "समाप्त होने वाली"}
              </button>
              <button 
                onClick={() => setAlertFilter("EXPIRED")}
                className={`px-2 py-1 font-black ${alertFilter === "EXPIRED" ? "bg-[#FF8A8A] text-black" : "bg-white dark:bg-zinc-800"}`}
              >
                {isEn ? "Expired" : "समाप्त"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN INVENTORY CATALOG TABLE */}
      <div className="border-4 border-black bg-white dark:bg-[#1E1E1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-4 border-black bg-gray-50 dark:bg-zinc-900 text-xs font-black uppercase">
              <th className="p-3 border-r border-black">{isEn ? "Medicine Details" : "दवा का विवरण"}</th>
              <th className="p-3 border-r border-black">{isEn ? "Batch & Manufacturer" : "बैच और निर्माता"}</th>
              <th className="p-3 border-r border-black text-center">{isEn ? "Expiries" : "समाप्ति तिथि"}</th>
              <th className="p-3 border-r border-black text-center">{isEn ? "Stock / Min" : "स्टॉक / सीमा"}</th>
              <th className="p-3 border-r border-black text-right">{isEn ? "Price" : "कीमत"}</th>
              <th className="p-3 text-center">{isEn ? "Actions" : "कार्रवाई"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              // Calculate status
              const expDate = new Date(item.expiryDate);
              const diffTime = expDate.getTime() - CURRENT_DATE.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isExpired = diffDays <= 0;
              const isLowStock = item.stock <= item.minThreshold && item.stock > 0;

              return (
                <tr key={item.medicine_id} className="border-b-2 border-black hover:bg-muted/10 text-xs font-bold">
                  {/* Name and Formula */}
                  <td className="p-3 border-r border-black min-w-[200px]">
                    <div className="font-black text-sm text-foreground">{item.brand_name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{item.generic_name} &middot; {item.strength}</div>
                    <span className="inline-block bg-sky-100 text-sky-900 px-1.5 py-0.2 mt-1 text-[9px] uppercase border border-sky-300">
                      {item.category}
                    </span>
                  </td>

                  {/* Batch & Manufacturer */}
                  <td className="p-3 border-r border-black">
                    <span className="font-mono bg-gray-100 dark:bg-zinc-800 border px-1 py-0.5">{item.batchNumber}</span>
                    <div className="text-[10px] text-gray-500 mt-1">{item.manufacturer}</div>
                  </td>

                  {/* Expiry Date */}
                  <td className={`p-3 border-r border-black text-center ${
                    isExpired ? "text-red bg-red-light/10" : diffDays <= 60 ? "text-orange bg-orange-100/10" : ""
                  }`}>
                    <div>{item.expiryDate}</div>
                    <div className="text-[9px] text-gray-500 mt-0.5 uppercase font-bold">
                      {isExpired ? `Expired` : diffDays <= 60 ? `${diffDays} days left` : `Safe`}
                    </div>
                  </td>

                  {/* Stock Quantity */}
                  <td className={`p-3 border-r border-black text-center ${
                    item.stock === 0 ? "bg-[#FF8A8A]/10" : isLowStock ? "bg-[#FFD166]/10" : ""
                  }`}>
                    <div className="font-black text-sm">{item.stock}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Min: {item.minThreshold}</div>
                  </td>

                  {/* Price */}
                  <td className="p-3 border-r border-black text-right font-black font-mono">
                    ₹{item.price}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3 text-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1 border border-black bg-white hover:bg-gray-100 text-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.medicine_id)}
                      className="p-1 border border-black bg-[#FF8A8A] hover:bg-red-400 text-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-xs text-muted-foreground font-bold">
                  {isEn ? "No matching medicines found in catalog." : "कैटलॉग में कोई मिलान वाली दवा नहीं मिली।"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MEDICINE DIALOG MODAL */}
      {editingMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form 
            onSubmit={saveEditedMedicine} 
            className="w-full max-w-lg rounded-none border-4 border-black bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b-4 border-black p-4 bg-[#5C94FF] text-black flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {isEn ? "Update Stock Metadata" : "स्टॉक मेटाडेटा अपडेट करें"}
                </h2>
                <p className="text-xs font-bold text-black/75">
                  {editingMedicine.brand_name} &middot; {editingMedicine.medicine_id}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingMedicine(null)}
                className="size-8 rounded-none border-2 border-black bg-white flex items-center justify-center font-black text-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Fields Grid */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-white dark:bg-[#1E1E1E]">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "In Stock Qty" : "स्टॉक मात्रा"}</label>
                  <Input
                    type="number"
                    value={editingMedicine.stock}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, stock: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Min Stock Threshold" : "न्यूनतम स्टॉक सीमा"}</label>
                  <Input
                    type="number"
                    value={editingMedicine.minThreshold}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, minThreshold: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Unit Price (Rs)" : "इकाई कीमत (रु)"}</label>
                  <Input
                    type="number"
                    value={editingMedicine.price}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, price: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Batch Number" : "बैच नंबर"}</label>
                  <Input
                    value={editingMedicine.batchNumber}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, batchNumber: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Manufacturing Date" : "उत्पादन तिथि"}</label>
                  <Input
                    type="date"
                    value={editingMedicine.mfgDate}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, mfgDate: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Expiry Date" : "समाप्ति तिथि"}</label>
                  <Input
                    type="date"
                    value={editingMedicine.expiryDate}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, expiryDate: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Manufacturer" : "निर्माता"}</label>
                <Input
                  value={editingMedicine.manufacturer}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, manufacturer: e.target.value })}
                  className="border-2 border-black rounded-none text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Storage Instructions" : "भंडारण निर्देश"}</label>
                <Input
                  value={editingMedicine.storageInstructions}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, storageInstructions: e.target.value })}
                  className="border-2 border-black rounded-none text-xs font-bold"
                  required
                />
              </div>

            </div>

            {/* Footer */}
            <div className="border-t-4 border-black p-4 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMedicine(null)}
                className="border-2 border-black rounded-none font-bold"
              >
                {isEn ? "Cancel" : "रद्द करें"}
              </Button>
              <Button
                type="submit"
                className="bg-[#A3E635] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {isEn ? "Save Changes" : "परिवर्तन सहेजें"}
              </Button>
            </div>

          </form>
        </div>
      )}

      {/* ADD NEW MEDICINE DIALOG MODAL */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form 
            onSubmit={handleAddNewItem} 
            className="w-full max-w-lg rounded-none border-4 border-black bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b-4 border-black p-4 bg-[#A3E635] text-black flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  ➕ {isEn ? "Add New Stock Entry" : "नया स्टॉक प्रविष्टि जोड़ें"}
                </h2>
                <p className="text-xs font-bold text-black/75">
                  {isEn ? "Create catalog record for a new pharmaceutical batch." : "एक नए दवा बैच के लिए कैटलॉग रिकॉर्ड बनाएं।"}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddingNew(false)}
                className="size-8 rounded-none border-2 border-black bg-white flex items-center justify-center font-black text-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Fields Grid */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto bg-white dark:bg-[#1E1E1E]">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Medicine Brand Name" : "दवा का ब्रांड नाम"}</label>
                  <Input
                    value={newMedForm.brand_name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, brand_name: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    placeholder="e.g. Paracetamol 500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Generic Formula Name" : "जेनेरिक नाम"}</label>
                  <Input
                    value={newMedForm.generic_name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, generic_name: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    placeholder="e.g. Paracetamol"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Category" : "श्रेणी"}</label>
                  <select
                    className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
                    value={newMedForm.category}
                    onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Blood Pressure">Blood Pressure</option>
                    <option value="Allergy">Allergy</option>
                    <option value="Acidity & Digestion">Acidity & Digestion</option>
                    <option value="Cough & Cold">Cough & Cold</option>
                    <option value="Heart & Cholesterol">Heart & Cholesterol</option>
                    <option value="Asthma & COPD">Asthma & COPD</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Dosage Form" : "खुराक रूप"}</label>
                  <select
                    className="h-9 w-full rounded-none border-2 border-black bg-card px-2 text-xs font-bold outline-none"
                    value={newMedForm.dosageForm}
                    onChange={(e) => setNewMedForm({ ...newMedForm, dosageForm: e.target.value })}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Qty" : "मात्रा"}</label>
                  <Input
                    type="number"
                    value={newMedForm.stock}
                    onChange={(e) => setNewMedForm({ ...newMedForm, stock: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Min Threshold" : "न्यूनतम सीमा"}</label>
                  <Input
                    type="number"
                    value={newMedForm.minThreshold}
                    onChange={(e) => setNewMedForm({ ...newMedForm, minThreshold: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Price (Rs)" : "कीमत (रु)"}</label>
                  <Input
                    type="number"
                    value={newMedForm.price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, price: Number(e.target.value) })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Strength" : "शक्ति"}</label>
                  <Input
                    value={newMedForm.strength}
                    onChange={(e) => setNewMedForm({ ...newMedForm, strength: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    placeholder="e.g. 500mg"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Batch Number" : "बैच नंबर"}</label>
                  <Input
                    value={newMedForm.batchNumber}
                    onChange={(e) => setNewMedForm({ ...newMedForm, batchNumber: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "MFG Date" : "उत्पादन तिथि"}</label>
                  <Input
                    type="date"
                    value={newMedForm.mfgDate}
                    onChange={(e) => setNewMedForm({ ...newMedForm, mfgDate: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Expiry Date" : "समाप्ति तिथि"}</label>
                  <Input
                    type="date"
                    value={newMedForm.expiryDate}
                    onChange={(e) => setNewMedForm({ ...newMedForm, expiryDate: e.target.value })}
                    className="border-2 border-black rounded-none text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Manufacturer" : "निर्माता"}</label>
                <Input
                  value={newMedForm.manufacturer}
                  onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                  className="border-2 border-black rounded-none text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">{isEn ? "Storage Instructions" : "भंडारण निर्देश"}</label>
                <Input
                  value={newMedForm.storageInstructions}
                  onChange={(e) => setNewMedForm({ ...newMedForm, storageInstructions: e.target.value })}
                  className="border-2 border-black rounded-none text-xs font-bold"
                  required
                />
              </div>

            </div>

            {/* Footer */}
            <div className="border-t-4 border-black p-4 bg-gray-50 dark:bg-zinc-900 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingNew(false)}
                className="border-2 border-black rounded-none font-bold"
              >
                {isEn ? "Cancel" : "रद्द करें"}
              </Button>
              <Button
                type="submit"
                className="bg-[#A3E635] text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {isEn ? "Add to Catalog" : "कैटलॉग में जोड़ें"}
              </Button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
