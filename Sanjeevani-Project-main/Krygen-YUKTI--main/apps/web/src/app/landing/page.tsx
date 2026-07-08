"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Route } from "next";
import {
  Video,
  ShieldCheck,
  QrCode,
  PackageSearch,
  Activity,
  User,
  ArrowRight,
  Signal,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Heart,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Phone,
  Clock,
  AlertTriangle,
  MapPin,
  HeartPulse,
  Camera,
  Layers
} from "lucide-react";
import { useTranslation } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

const LOCALIZED = {
  en: {
    title: "Sanjeevni",
    tagline: "Simple Healthcare, Close to Home",
    description: "Sanjeevni makes it easy for village residents to speak with verified doctors, get digital prescriptions, and check local medicine availability, even on weak mobile networks.",
    emergencyBtn: "Emergency Help (SOS)",
    consultBtn: "Talk to a Doctor",
    workspaceBtn: "Go to Workspace",
    
    // Bandwidth Banner
    bannerText: "Adaptive Bandwidth System Active: Sanjeevni works smoothly on 2G/3G connections.",
    
    // Top Feature Sections
    mainFeaturesTitle: "Our Key Healthcare Services",
    mainFeaturesSub: "Four primary features built to bring reliable healthcare directly to rural communities.",
    
    services: [
      {
        title: "Easy Doctor Consults",
        desc: "Talk to a doctor via video or audio. If your connection drops, it automatically switches to a voice call so you never lose contact.",
        badge: "Low Internet Ready"
      },
      {
        title: "Offline Prescriptions",
        desc: "Get prescriptions saved as QR codes on your phone. Show the chemist to get medicines, even if your phone has zero internet.",
        badge: "No Internet Needed"
      },
      {
        title: "Village Chemist Stock",
        desc: "Check if the local village shop has your medicines in stock before you walk there. Reserve medicines online so they are kept for you.",
        badge: "Save Travel Time"
      },
      {
        title: "Emergency SOS Alert",
        desc: "One button to alert local emergency outposts, book nearby ICU beds, and direct ambulances directly to your home.",
        badge: "Immediate Action"
      }
    ],

    // All Features Grid (10 Core Platform Capabilities)
    allFeaturesTitle: "Complete Platform Features",
    allFeaturesSub: "A summary of everything Sanjeevni offers to keep your village safe and healthy.",
    
    features: [
      {
        icon: Video,
        title: "Bandwidth-Adaptive Video",
        desc: "Video calls automatically turn to voice-only calls if your signal gets weak, ensuring communication never cuts."
      },
      {
        icon: ShieldCheck,
        title: "100% Verified Doctors",
        desc: "All doctors must submit state medical board certificates, verified by administrators before they can treat you."
      },
      {
        icon: QrCode,
        title: "Safe QR Prescriptions",
        desc: "Doctor prescription QR codes hold complete dosage info, readable offline by pharmacists to prevent errors."
      },
      {
        icon: PackageSearch,
        title: "Pharmacy Transparency",
        desc: "View current stocks of local village chemists, preventing patients from traveling to shops out of medicine."
      },
      {
        icon: Activity,
        title: "ICU & Ambulance Routing",
        desc: "SOS requests automatically route ambulances to nearby hospitals with available ventilators and ICU beds."
      },
      {
        icon: Layers,
        title: "Outpost Proximity Maps",
        desc: "View direct routes, distance, and travel times to regional health outposts and chemists in real-time."
      },
      {
        icon: Heart,
        title: "Blood Bank Availability",
        desc: "Tracks regional blood banks to help patients instantly check availability for critical emergency procedures."
      },
      {
        icon: Camera,
        title: "Chemist QR Scanner Simulator",
        desc: "Fully simulated scanner allows chemists to decode client prescriptions instantly using any camera."
      },
      {
        icon: RefreshCw,
        title: "Offline Sync Center",
        desc: "Uses secure offline storage to queue consult requests and updates, syncing automatically when connection returns."
      },
      {
        icon: User,
        title: "AI-Powered Symptom Check",
        desc: "Simple symptom wizard to help you evaluate your condition and decide if you need routine or emergency care."
      }
    ],

    // Interactive Tour
    tourTitle: "See How It Works (Try It Yourself)",
    tourSub: "Click the buttons below to walk through a simple patient consultation journey.",
    tourStep1: "Step 1: Calling the Doctor (2G Adaptability)",
    tourStep1Text: "Connecting call under weak network signal. The video automatically turns off to ensure high-quality audio remains connected.",
    tourStep2: "Step 2: Consultation & Prescription",
    tourStep2Text: "The doctor speaks with you, diagnoses your condition, and generates a digital prescription QR code.",
    tourStep3: "Step 3: Saved Offline QR Code",
    tourStep3Text: "The QR code prescription is saved on your phone. You do not need internet to show it to the pharmacist.",
    tourStep4: "Step 4: Local Pharmacy Pickup",
    tourStep4Text: "The village chemist scans your QR code offline, gives you the medicines, and updates their stock count.",
    tourNextBtn: "Next Step",
    tourPrevBtn: "Back",
    tourResetBtn: "Restart Tour",
    tourInteractiveMockup: "Interactive Demonstration",

    // Roles
    roleTitle: "Designed for Our Whole Community",
    roleSub: "Sanjeevni connects patients, doctors, and chemists together to keep everyone healthy.",
    patientRole: "For Patients (मरीज़)",
    doctorRole: "For Doctors (डॉक्टर)",
    pharmacyRole: "For Chemists (दवा की दुकान)",
    adminRole: "For Outpost Admins (सहायक/एडमिन)",
    patientDesc: "Speak with doctors from home, save your prescriptions, and see if medicines are available nearby.",
    doctorDesc: "Examine patients, review history, and issue secure QR prescriptions with correct dosage instructions.",
    pharmacyDesc: "Scan patient QR codes offline to verify prescriptions and update medicine stock levels.",
    adminDesc: "Approve local doctors, coordinate village SOS alerts, and monitor regional health outposts.",
    openPortalBtn: "Open Portal",

    // FAQ
    faqTitle: "Common Questions (सवाल और जवाब)",
    faqSub: "Find simple answers to guide you through using the platform.",
    faq1Q: "Does it work without internet?",
    faq1A: "Yes! While you need internet to talk to a doctor, your prescription is saved as a QR code directly on your phone. You can show it to the chemist even if your phone has no internet connection.",
    faq2Q: "How do I know the doctor is real?",
    faq2A: "Every doctor on Sanjeevni must submit their government license. Our team manually checks and approves every doctor before they can write any prescriptions.",
    faq3Q: "Is it free to use?",
    faq3A: "Yes, basic emergency calls and medicine availability checks are completely free for all village residents.",
    faq4Q: "What if there is an emergency?",
    faq4A: "Tap the big red 'Emergency Help (SOS)' button on the top. It will immediately alert the nearest hospital and dispatch an ambulance to your village.",

    // Footer
    footerTitle: "Sanjeevni Telemedicine System",
    copyright: "Designed for simplicity, digital accessibility, and trust. All rights reserved.",
    hotline: "Emergency Support Hotline: 108"
  },
  hi: {
    title: "संजीवनी",
    tagline: "आसान इलाज, आपके घर के पास",
    description: "संजीवनी के द्वारा गाँव के लोग आसानी से डॉक्टरों से बात कर सकते हैं, डिजिटल पर्चे प्राप्त कर सकते हैं, और कमजोर नेटवर्क होने पर भी आस-पास की दुकानों में दवा का स्टॉक देख सकते हैं।",
    emergencyBtn: "आपातकालीन सहायता (SOS)",
    consultBtn: "डॉक्टर से बात करें",
    workspaceBtn: "कार्यक्षेत्र पर जाएं",
    
    // Bandwidth Banner
    bannerText: "कमजोर नेटवर्क मोड सक्रिय: संजीवनी 2G/3G कनेक्शन पर भी सुचारू रूप से काम करती है।",
    
    // Top Feature Sections
    mainFeaturesTitle: "हमारी मुख्य स्वास्थ्य सेवाएं",
    mainFeaturesSub: "ग्रामीण समुदायों तक सीधे विश्वसनीय स्वास्थ्य सेवाएं पहुंचाने के लिए बनी चार प्रमुख विशेषताएं।",
    
    services: [
      {
        title: "आसान डॉक्टर परामर्श",
        desc: "वीडियो या ऑडियो से डॉक्टर से बात करें। नेटवर्क खराब होने पर कॉल खुद आवाज पर आ जाती है ताकि संपर्क कभी न टूटे।",
        badge: "कमजोर इंटरनेट में भी सक्षम"
      },
      {
        title: "ऑफलाइन पर्चा (QR कोड)",
        desc: "दवा का पर्चा फोन पर क्यूआर कोड के रूप में सुरक्षित करें। इंटरनेट न होने पर भी केमिस्ट को दिखाकर दवा ले सकते हैं।",
        badge: "इंटरनेट की जरूरत नहीं"
      },
      {
        title: "गाँव की दुकान का स्टॉक",
        desc: "गाँव की दुकान जाने से पहले घर बैठे जानें कि आपकी दवा स्टॉक में है या नहीं, और दवा ऑनलाइन आरक्षित (बुक) करें।",
        badge: "यात्रा का समय बचाएं"
      },
      {
        title: "आपातकालीन SOS अलर्ट",
        desc: "एक बटन दबाकर नजदीकी अस्पतालों में आईसीयू बेड बुक करें और सीधे अपने घर के लिए एम्बुलेंस बुलाएं।",
        badge: "त्वरित कार्रवाई"
      }
    ],

    // All Features Grid (10 Core Platform Capabilities)
    allFeaturesTitle: "प्लेटफ़ॉर्म की सभी विशेषताएं",
    allFeaturesSub: "संजीवनी द्वारा आपके गाँव को सुरक्षित और स्वस्थ रखने के लिए दी जाने वाली सभी सेवाओं का विवरण।",
    
    features: [
      {
        icon: Video,
        title: "अनुकूलनीय वीडियो कॉल",
        desc: "नेटवर्क कमजोर होने पर वीडियो अपने आप बंद हो जाता है, जिससे केवल आवाज वाली कॉल चालू रहती है और संपर्क नहीं टूटता।"
      },
      {
        icon: ShieldCheck,
        title: "100% सत्यापित डॉक्टर",
        desc: "मरीजों का इलाज करने से पहले सभी डॉक्टरों के मेडिकल बोर्ड लाइसेंस की जांच अधिकारियों द्वारा की जाती है।"
      },
      {
        icon: QrCode,
        title: "सुरक्षित क्यूआर पर्चा",
        desc: "क्यूआर कोड में दवा की पूरी खुराक की जानकारी होती है, जिसे दुकानदार बिना इंटरनेट के भी आसानी से देख सकता है।"
      },
      {
        icon: PackageSearch,
        title: "दुकान स्टॉक की पारदर्शिता",
        desc: "गाँव की दुकान में उपलब्ध दवाओं का स्टॉक देखें, जिससे मरीजों को बिना दवा वाली दुकान तक जाने की परेशानी न हो।"
      },
      {
        icon: Activity,
        title: "एम्बुलेंस व आईसीयू बुकिंग",
        desc: "SOS संदेश भेजते ही एम्बुलेंस को उन नजदीकी अस्पतालों में भेजा जाता है जहाँ वेंटिलेटर और आईसीयू बेड खाली हों।"
      },
      {
        icon: Layers,
        title: "नजदीकी स्वास्थ्य केंद्र नक्शा",
        desc: "अपने गाँव से नजदीकी डॉक्टरों, स्वास्थ्य केंद्रों और दवा की दुकानों की दूरी और वहाँ पहुँचने का समय देखें।"
      },
      {
        icon: Heart,
        title: "ब्लड बैंक ट्रैकर",
        desc: "गंभीर आपातकाल के समय मरीजों के लिए रक्त की उपलब्धता की जानकारी तुरंत देखने में मदद करता है।"
      },
      {
        icon: Camera,
        title: "केमिस्ट क्यूआर स्कैनर",
        desc: "दुकानदारों के लिए सिम्युलेटेड स्कैनर, जिसके जरिए वे फोन के कैमरे से सीधे मरीजों का क्यूआर पर्चा डिकोड कर सकते हैं।"
      },
      {
        icon: RefreshCw,
        title: "ऑफलाइन डेटा सिंक",
        desc: "इंटरनेट न होने पर भी परामर्श अनुरोध सुरक्षित रखता है और इंटरनेट आने पर स्वचालित रूप से डेटा सिंक करता है।"
      },
      {
        icon: User,
        title: "एआई लक्षण जांच",
        desc: "सरल सवालों के जरिए अपनी बीमारी के लक्षणों की जांच करें और जानें कि आपको डॉक्टर के पास जाने की आवश्यकता है या नहीं।"
      }
    ],

    // Interactive Tour
    tourTitle: "देखें यह कैसे काम करता है (खुद आज़माएँ)",
    tourSub: "संजीवनी के काम करने के तरीके को समझने के लिए नीचे दिए गए बटनों पर क्लिक करें।",
    tourStep1: "चरण 1: डॉक्टर को कॉल (2G नेटवर्क)",
    tourStep1Text: "कमजोर इंटरनेट में कॉल कनेक्ट हो रहा है। वीडियो अपने आप बंद हो जाता है ताकि आपकी आवाज बिना रुकावट डॉक्टर तक पहुंचे।",
    tourStep2: "चरण 2: बातचीत और पर्चा",
    tourStep2Text: "डॉक्टर आपसे बात करते हैं, बीमारी की जांच करते हैं और एक सुरक्षित डिजिटल क्यूआर कोड पर्चा तैयार करते हैं।",
    tourStep3: "चरण 3: फोन में सुरक्षित क्यूआर कोड",
    tourStep3Text: "पर्चा (क्यूआर कोड) आपके फोन पर सुरक्षित हो गया है। केमिस्ट को दिखाने के लिए आपको इंटरनेट की आवश्यकता नहीं है।",
    tourStep4: "चरण 4: गाँव की दुकान से दवा उठाना",
    tourStep4Text: "गाँव का दुकानदार आपके फोन से क्यूआर कोड स्कैन करता है, आपको दवा देता है और बची दवाओं का स्टॉक अपडेट करता है।",
    tourNextBtn: "अगला चरण",
    tourPrevBtn: "पीछे",
    tourResetBtn: "शुरू से देखें",
    tourInteractiveMockup: "इंटरैक्टिव प्रदर्शन",

    // Roles
    roleTitle: "हमारे पूरे गाँव के लिए डिज़ाइन किया गया",
    roleSub: "संजीवनी मरीजों, डॉक्टरों और केमिस्टों को आपस में जोड़ती है ताकि सभी स्वस्थ रहें।",
    patientRole: "मरीजों के लिए",
    doctorRole: "डॉक्टरों के लिए",
    pharmacyRole: "दवा की दुकानों के लिए",
    adminRole: "एडमिन/सहायक के लिए",
    patientDesc: "घर बैठे डॉक्टर से बात करें, अपना पर्चा संभालें और आस-पास की दुकानों में उपलब्ध दवाएं देखें।",
    doctorDesc: "मरीजों का इलाज करें, उनका इतिहास देखें और सुरक्षित पर्चे (क्यूआर कोड) जारी करें।",
    pharmacyDesc: "बिना इंटरनेट मरीजों के क्यूआर कोड को स्कैन करें और अपनी दुकान का स्टॉक अपडेट करें।",
    adminDesc: "डॉक्टरों को प्रमाणित करें, गाँव के आपातकालीन अलर्ट का प्रबंधन करें और उप-केंद्रों की निगरानी करें।",
    openPortalBtn: "पोर्टल खोलें",

    // FAQ
    faqTitle: "अक्सर पूछे जाने वाले सवाल (सवाल और जवाब)",
    faqSub: "मंच का उपयोग करने में मदद के लिए सरल उत्तर प्राप्त करें।",
    faq1Q: "क्या यह बिना इंटरनेट के काम करता है?",
    faq1A: "हाँ! डॉक्टर से बात करने के लिए इंटरनेट की आवश्यकता होती है, लेकिन आपका पर्चा सीधे आपके फोन पर क्यूआर कोड के रूप में सुरक्षित रहता है। आप इंटरनेट न होने पर भी इसे केमिस्ट को दिखा सकते हैं।",
    faq2Q: "मुझे कैसे पता चलेगा कि डॉक्टर असली हैं?",
    faq2A: "संजीवनी पर हर डॉक्टर को अपना सरकारी लाइसेंस नंबर देना होता है। हमारी टीम डॉक्टरों को मंजूरी देने से पहले हर विवरण की जांच करती है।",
    faq3Q: "क्या इसका उपयोग करना मुफ्त है?",
    faq3A: "हाँ, गांव के सभी निवासियों के लिए आपातकालीन कॉल और दवा की उपलब्धता की जांच करना पूरी तरह से मुफ्त है।",
    faq4Q: "अगर कोई आपातकालीन स्थिति हो तो क्या करें?",
    faq4A: "सबसे ऊपर दिए गए बड़े लाल 'आपातकालीन सहायता (SOS)' बटन को दबाएं। यह तुरंत नजदीकी अस्पताल को सूचित करेगा और आपके गांव में एम्बुलेंस भेजेगा।",

    // Footer
    footerTitle: "संजीवनी ग्रामीण टेलीमेडिसिन प्रणाली",
    copyright: "सरलता, पहुंच और सुरक्षा के लिए बनाया गया। सर्वाधिकार सुरक्षित।",
    hotline: "आपातकालीन सहायता नंबर: 108"
  }
};

export default function Home() {
  const { language } = useTranslation();
  const isEn = language === "en";
  const content = isEn ? LOCALIZED.en : LOCALIZED.hi;

  const [tourStep, setTourStep] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState("PATIENT");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mockStock, setMockStock] = useState(120);

  // Automatically reset or simulate stock deduction on the last step
  useEffect(() => {
    if (tourStep === 3) {
      const timer = setTimeout(() => {
        setMockStock((prev) => Math.max(90, prev - 10));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tourStep]);

  return (
    <div className="min-h-screen bg-[#F0F7F7] text-slate-850 selection:bg-teal-100 font-sans leading-relaxed">
      
      {/* Sticky Accessible Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="medical-cross">🩺</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl text-teal-800 tracking-tight leading-none">
                {content.title}
              </span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mt-0.5">
                {isEn ? "Rural Health Outpost" : "ग्रामीण आउटपोस्ट"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href={"/login" as Route}>
              <button className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer">
                {content.workspaceBtn}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Network Bandwidth Indicator Banner */}
      <div className="bg-teal-50 border-y border-teal-100 py-2.5 px-4 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-teal-800">
          <Signal className="size-4 text-teal-600 animate-pulse" />
          <span>{content.bannerText}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-16">
        
        {/* Reassuring Hero Section */}
        <section className="grid gap-8 lg:grid-cols-12 items-center pt-4">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>{isEn ? "100% Secure & Government Registered" : "100% सुरक्षित और सरकार द्वारा सत्यापित"}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {content.tagline}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium">
              {content.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href={"/login" as Route} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer">
                  <PhoneCall className="size-5" />
                  <span>{content.consultBtn}</span>
                </button>
              </Link>
              
              <button 
                onClick={() => {
                  alert(isEn 
                    ? "ALERT: SOS distress signal broadcasted! Notifying nearby ambulance and regional hospital HQ." 
                    : "चेतावनी: आपातकालीन SOS सिग्नल भेजा गया है! निकटतम एम्बुलेंस और अस्पताल को सूचित किया जा रहा है।"
                  );
                }}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-lg py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-rose-500"
              >
                <AlertTriangle className="size-5 animate-bounce" />
                <span>{content.emergencyBtn}</span>
              </button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="text-teal-600 text-base">✔</span> {isEn ? "No complex app download required" : "कोई ऐप डाउनलोड करने की आवश्यकता नहीं"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-teal-600 text-base">✔</span> {isEn ? "Direct call to doctor" : "डॉक्टर को सीधी कॉल"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-teal-600 text-base">✔</span> {isEn ? "Works without active internet at chemist" : "दुकान पर बिना इंटरनेट काम करता है"}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Visual Reassuring Support Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-sm w-full space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isEn ? "Status Alert" : "स्थिति"}</span>
                </div>
                <span className="bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {isEn ? "Doctors Online" : "डॉक्टर उपलब्ध हैं"}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-50 text-sky-700 p-2.5 rounded-xl">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{isEn ? "Dr. Sanjeev Kumar" : "डॉक्टर संजीव कुमार"}</h3>
                    <p className="text-xs text-slate-500 font-medium">{isEn ? "General Medicine · Speaks Hindi & English" : "सामान्य चिकित्सा · हिंदी और अंग्रेजीभाषी"}</p>
                    <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                      {isEn ? "Active Now" : "अभी सक्रिय"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#F0F7F7] rounded-2xl flex items-center justify-between text-xs font-bold text-teal-800">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{isEn ? "Avg. Wait Time:" : "औसत प्रतीक्षा समय:"}</span>
                  </div>
                  <span>{isEn ? "Under 5 mins" : "५ मिनट से कम"}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={"/login" as Route} className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 px-5 rounded-xl transition-all">
                  {isEn ? "Check Doctor Directory" : "डॉक्टरों की सूची देखें"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Main Core Services Showcase (4 Columns Grid) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {isEn ? "Primary Offerings" : "मुख्य सेवाएं"}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.mainFeaturesTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
              {content.mainFeaturesSub}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.services.map((svc, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-teal-600 bg-teal-50 size-10 flex items-center justify-center rounded-xl">
                      {i === 0 ? "📞" : i === 1 ? "📄" : i === 2 ? "💊" : "🚨"}
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-850 leading-tight">{svc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {svc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Storyboard Demo (Guided Tour) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.tourTitle}
            </h2>
            <p className="text-sm text-slate-500 font-semibold">
              {content.tourSub}
            </p>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 grid lg:grid-cols-12">
            
            {/* Visual Card Display */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">
                  {isEn ? `Step ${tourStep + 1} of 4` : `चरण ${tourStep + 1} (कुल 4)`}
                </span>

                {tourStep === 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{content.tourStep1}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{content.tourStep1Text}</p>
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-center gap-3 text-teal-900 font-semibold text-xs">
                      <Signal className="size-5 text-teal-600 animate-pulse" />
                      <span>{isEn ? "Weak 2G Network: Switched call mode to Audio only. Live voice connection verified." : "कमजोर 2G नेटवर्क: कॉल मोड ऑडियो पर स्थानांतरित। आवाज संपर्क सुरक्षित है।"}</span>
                    </div>
                  </div>
                )}

                {tourStep === 1 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{content.tourStep2}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{content.tourStep2Text}</p>
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-3 text-sky-900 font-semibold text-xs">
                      <User className="size-5 text-sky-600" />
                      <span>{isEn ? 'Dr. Sanjeev says: "Take 1 Paracetamol twice daily for fever. Generating your recipe."' : 'डॉक्टर: "बुखार के लिए रोज २ बार पैरासिटामोल लें। आपका पर्चा बनाया जा रहा है।"'}</span>
                    </div>
                  </div>
                )}

                {tourStep === 2 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{content.tourStep3}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{content.tourStep3Text}</p>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-900 font-semibold text-xs">
                      <QrCode className="size-5 text-amber-600" />
                      <span>{isEn ? "Offline Receipt Ready: Saved as an image. Access prescription details instantly." : "ऑफ़लाइन पर्चा तैयार: इमेज के रूप में सुरक्षित। विवरण तुरंत देख सकते हैं।"}</span>
                    </div>
                  </div>
                )}

                {tourStep === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{content.tourStep4}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{content.tourStep4Text}</p>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-900 font-semibold text-xs">
                      <CheckCircle className="size-5 text-emerald-600" />
                      <span>{isEn ? "Fulfillment Success: Medicines handed over. Database inventory decremented." : "सफलतापूर्वक दवा प्राप्त हुई। दुकान में दवा का स्टॉक अपडेट कर दिया गया है।"}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                {tourStep > 0 && (
                  <button 
                    onClick={() => setTourStep(prev => prev - 1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-2 px-5 rounded-xl transition-all cursor-pointer"
                  >
                    {content.tourPrevBtn}
                  </button>
                )}
                {tourStep < 3 ? (
                  <button 
                    onClick={() => setTourStep(prev => prev + 1)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm py-2 px-6 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>{content.tourNextBtn}</span>
                    <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => { setTourStep(0); setMockStock(120); }}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm py-2 px-5 rounded-xl transition-all cursor-pointer ml-auto"
                  >
                    {content.tourResetBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Graphic Representation */}
            <div className="lg:col-span-5 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between min-h-[300px] relative text-white border-l border-slate-100">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
              
              <div className="z-10 flex justify-between items-center text-xs text-slate-400 font-semibold">
                <span>{content.tourInteractiveMockup}</span>
                <span className="size-2 bg-teal-400 rounded-full animate-pulse"></span>
              </div>

              <div className="z-10 my-auto flex flex-col items-center justify-center py-6 text-center space-y-4">
                {tourStep === 0 && (
                  <>
                    <div className="relative">
                      <div className="absolute -inset-2 bg-teal-500/20 rounded-full blur-md animate-pulse"></div>
                      <PhoneCall className="size-16 text-teal-400 relative" />
                    </div>
                    <div>
                      <span className="text-xs text-red-400 font-bold block mb-1">{isEn ? "SIGNAL STRENGTH: WEAK" : "सिग्नल स्तर: कमजोर"}</span>
                      <span className="text-sm font-semibold">{isEn ? "Audio consultation starting..." : "ऑडियो परामर्श शुरू हो रहा है..."}</span>
                    </div>
                  </>
                )}

                {tourStep === 1 && (
                  <>
                    <div className="flex items-center gap-6">
                      <User className="size-12 text-teal-400 bg-teal-500/10 p-2 rounded-2xl" />
                      <ArrowRight className="size-5 text-slate-500" />
                      <User className="size-12 text-sky-400 bg-sky-500/10 p-2 rounded-2xl" />
                    </div>
                    <span className="text-sm font-bold">{isEn ? "Dr. Sanjeev Kumar Connected" : "डॉ संजीव कुमार जुड़े हुए हैं"}</span>
                  </>
                )}

                {tourStep === 2 && (
                  <>
                    <div className="bg-white p-3 rounded-2xl shadow-lg">
                      <QrCode className="size-20 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-xs text-amber-400 font-bold block mb-0.5">{isEn ? "SAVED OFFLINE" : "ऑफ़लाइन सुरक्षित"}</span>
                      <span className="text-xs text-slate-400 font-mono">RX: SANJEEVNI-YUKTI-MOCK</span>
                    </div>
                  </>
                )}

                {tourStep === 3 && (
                  <>
                    <CheckCircle className="size-16 text-emerald-400" />
                    <div className="space-y-1.5 w-full">
                      <span className="text-xs text-slate-400 block">{isEn ? "Village Outpost Stock Status:" : "गाँव की दुकान का स्टॉक:"}</span>
                      <div className="bg-slate-900 py-2 px-4 rounded-xl font-mono text-xs flex justify-between items-center max-w-[240px] mx-auto border border-slate-800">
                        <span>Paracetamol 500:</span>
                        <span className="text-emerald-400 font-bold">{mockStock} Units</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="z-10 text-[10px] text-center text-slate-500 font-semibold">
                {isEn ? "Simulated workflow for demonstration" : "प्रदर्शन के लिए सिम्युलेटेड प्रक्रिया"}
              </div>
            </div>

          </div>
        </section>

        {/* 2. Expanded All-Feature Checklist Grid (10 Features) */}
        <section className="space-y-8 bg-white py-12 px-6 sm:px-10 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {isEn ? "Detailed Core Features" : "विस्तृत विशेषता सूची"}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.allFeaturesTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
              {content.allFeaturesSub}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
            {content.features.map((feature, i) => {
              const Icon = isEn ? LOCALIZED.en.features[i].icon : LOCALIZED.hi.features[i].icon;
              return (
                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-teal-50/50 transition-colors">
                  <div className="bg-teal-50 text-teal-700 p-3 rounded-xl shrink-0">
                    <Icon className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-850 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal font-semibold">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Simplified Outpost Roles System */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.roleTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed">
              {content.roleSub}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Patient Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="size-10 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center font-bold">
                  <User className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{content.patientRole}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {content.patientDesc}
                </p>
              </div>
              <Link href={"/login" as Route} className="block w-full">
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                  {content.openPortalBtn}
                </button>
              </Link>
            </div>

            {/* Doctor Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="size-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center font-bold">
                  🩺
                </div>
                <h3 className="text-lg font-bold text-slate-900">{content.doctorRole}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {content.doctorDesc}
                </p>
              </div>
              <Link href={"/login" as Route} className="block w-full">
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                  {content.openPortalBtn}
                </button>
              </Link>
            </div>

            {/* Pharmacy Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="size-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold">
                  <QrCode className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{content.pharmacyRole}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {content.pharmacyDesc}
                </p>
              </div>
              <Link href={"/login" as Route} className="block w-full">
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                  {content.openPortalBtn}
                </button>
              </Link>
            </div>

            {/* Admin Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="size-10 bg-rose-50 text-rose-700 rounded-xl flex items-center justify-center font-bold">
                  <Activity className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{content.adminRole}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {content.adminDesc}
                </p>
              </div>
              <Link href={"/login" as Route} className="block w-full">
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer">
                  {content.openPortalBtn}
                </button>
              </Link>
            </div>

          </div>
        </section>

        {/* Clean Accordion FAQs Section */}
        <section className="space-y-8 bg-white py-10 px-6 sm:px-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {content.faqTitle}
            </h2>
            <p className="text-sm text-slate-500 font-semibold">
              {content.faqSub}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            
            {/* FAQ 1 */}
            <div className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === 0 ? null : 0)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-slate-800 hover:text-teal-700 transition-colors focus:outline-none text-base cursor-pointer"
              >
                <span>{content.faq1Q}</span>
                {expandedFaq === 0 ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </button>
              {expandedFaq === 0 && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-1">
                  {content.faq1A}
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-slate-800 hover:text-teal-700 transition-colors focus:outline-none text-base cursor-pointer"
              >
                <span>{content.faq2Q}</span>
                {expandedFaq === 1 ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </button>
              {expandedFaq === 1 && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-1">
                  {content.faq2A}
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-slate-800 hover:text-teal-700 transition-colors focus:outline-none text-base cursor-pointer"
              >
                <span>{content.faq3Q}</span>
                {expandedFaq === 2 ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </button>
              {expandedFaq === 2 && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-1">
                  {content.faq3A}
                </p>
              )}
            </div>

            {/* FAQ 4 */}
            <div className="border-b border-slate-100 pb-4">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-slate-800 hover:text-teal-700 transition-colors focus:outline-none text-base cursor-pointer"
              >
                <span>{content.faq4Q}</span>
                {expandedFaq === 3 ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </button>
              {expandedFaq === 3 && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-1">
                  {content.faq4A}
                </p>
              )}
            </div>

          </div>
        </section>

        {/* Soothing Reassuring SOS / Call to Action Banner */}
        <section className="bg-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-sm relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-25"></div>
          
          <div className="z-10 relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                {isEn ? "Need Immediate Medical Support?" : "तुरंत चिकित्सा सहायता की आवश्यकता है?"}
              </h2>
              <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                {isEn 
                  ? "Open our patient portal to talk directly with an online doctor, or dial our village helpline to get quick support from local medical teams."
                  : "ऑनलाइन डॉक्टर से बात करने के लिए मरीज़ पोर्टल खोलें, या हमारे आपातकालीन हेल्पलाइन पर कॉल करके तुरंत मदद प्राप्त करें।"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href={"/login" as Route} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer">
                  {isEn ? "Open Patient Portal" : "मरीज़ पोर्टल खोलें"}
                </button>
              </Link>
              <a href="tel:108" className="w-full sm:w-auto block text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-base py-3.5 px-6 rounded-xl transition-all">
                {isEn ? "Call Ambulance (108)" : "एम्बुलेंस को कॉल करें (108)"}
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-16 text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="medical-cross">🩺</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-800 tracking-tight leading-none">
                {content.footerTitle}
              </span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mt-0.5">
                {content.hotline}
              </span>
            </div>
          </div>
          
          <div className="text-center sm:text-right space-y-1">
            <p className="font-semibold text-slate-600">{content.copyright}</p>
            <p>&copy; 2026 Sanjeevni Outposts · Rural Healthcare Network</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
