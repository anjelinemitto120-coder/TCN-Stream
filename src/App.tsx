/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Tv,
  Radio,
  FileVideo,
  Settings,
  Bell,
  User,
  Heart,
  Download,
  Flame,
  Star,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Shield,
  Smartphone,
  Check,
  CreditCard,
  LogOut,
  Sliders,
  Play,
  ArrowRight,
  Wifi,
  WifiOff,
  Plus
} from "lucide-react";
import { ContentItem, UserProfile, SubscriptionPlan, PaymentTransaction } from "./types";
import { TCNLogo, BrandingInjector } from "./components/Branding";
import { LivePlayer } from "./components/LivePlayer";
import { AdminPanel } from "./components/AdminPanel";
import { CommunityForum } from "./components/CommunityForum";
import { AIRecommend } from "./components/AIRecommend";

export default function App() {
  // Global App States
  const [isEnglish, setIsEnglish] = useState(false); // Default to Kiswahili!
  const [isOnline, setIsOnline] = useState(true); // Offline mode toggle simulator
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Logged in user email
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Layout Nav States
  const [activeTab, setActiveTab] = useState<"home" | "forums" | "ai" | "admin" | "watchlist">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalog, setCatalog] = useState<ContentItem[]>([]);
  const [activeMovie, setActiveMovie] = useState<ContentItem | null>(null);

  // Auth & Profile switcher states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Parental gate PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pendingProfileSelect, setPendingProfileSelect] = useState<UserProfile | null>(null);
  const [pinError, setPinError] = useState("");

  // Subscription Checkout Panel states
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<"M-Pesa" | "Airtel Money" | "Stripe" | "PayPal" | "Visa" | "Mastercard">("M-Pesa");
  const [phoneCheckout, setPhoneCheckout] = useState("");
  const [cardCheckout, setCardCheckout] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payStatusText, setPayStatusText] = useState("");

  // Content slider indexes
  const [heroIndex, setHeroIndex] = useState(0);

  // Watch history list
  const [watchHistory, setWatchHistory] = useState<string[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  // Sample seed profiles list
  const [profiles, setProfiles] = useState<UserProfile[]>([
    { id: "p-adult", name: "Anjelina Mitto", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60", isKids: false, parentalControlPin: "1234" },
    { id: "p-kids", name: "TCN Kids", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60", isKids: true }
  ]);

  // Subscription plans list
  const plans: SubscriptionPlan[] = [
    { id: "sub-trial", name: "Jaribio la Bure (Free Trial)", priceTZS: "TZS 0", priceUSD: "$0", period: "one-shot", features: [isEnglish ? "SD Streaming quality" : "Ubora wa picha wa kawaida (SD)", "7 Days full access"], icon: "Zap" },
    { id: "sub-month", name: "Kifurushi cha Mwezi (Monthly VIP)", priceTZS: "TZS 10,000", priceUSD: "$4.00", period: "month", features: ["Full HD 1080p", isEnglish ? "Offline downloads enabled" : "Inaruhusu kupakua kwa Offline", "No Ads"], icon: "Flame" },
    { id: "sub-quarter", name: "Miezi Mitatu (Quarterly VIP)", priceTZS: "TZS 25,000", priceUSD: "$10.00", period: "quarter", features: ["Full HD & Ultra HD", "Simultaneous streams: 2 screens", "Premium customer care"], icon: "Star" },
    { id: "sub-year", name: "Mwaka Mmoja (Yearly VIP - Best Value)", priceTZS: "TZS 80,000", priceUSD: "$32.00", period: "year", features: ["4K HDR Stream quality", "Simultaneous streams: 4 screens", isEnglish ? "Full Bongo Movie library" : "Katalogi yote ya filamu za Bongo na tafsiri"], icon: "Sparkles" },
    { id: "sub-family", name: "Kifurushi cha Familia (Family VIP)", priceTZS: "TZS 120,000", priceUSD: "$48.00", period: "year", features: ["4K HDR multi-channel", "Ulinzi wa Parental Control kwa watoto", "All premium TV & radio streams included"], icon: "Shield" }
  ];

  // Load catalog on mount
  useEffect(() => {
    fetchCatalog();
    setWatchlistIds(JSON.parse(localStorage.getItem("tcn_watchlist") || "[]"));

    // Default notifications
    setNotifications([
      { id: "n1", title: "Habari mpya TCN!", message: "Filamu ya kusisimua ya 'Dar es Salaam Usiku' imeongezwa leo!", timestamp: "Muda mfupi uliopita", read: false },
      { id: "n2", title: "Ligi ya NBC Live!", message: "Yanga vs Mbeya City inaruka sasa hivi kupitia Azam Sports HD!", timestamp: "Masaa 2 yaliyopita", read: false }
    ]);
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setCatalog(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSelect = (prof: UserProfile) => {
    if (!prof.isKids && prof.parentalControlPin) {
      setPendingProfileSelect(prof);
      setShowPinModal(true);
      setPinInput("");
      setPinError("");
    } else {
      setActiveProfile(prof);
    }
  };

  const verifyPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingProfileSelect && pinInput === pendingProfileSelect.parentalControlPin) {
      setActiveProfile(pendingProfileSelect);
      setShowPinModal(false);
      setPinError("");
    } else {
      setPinError(isEnglish ? "Invalid Parental PIN! Try again." : "PIN sio sahihi! Jaribu tena.");
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    setPayStatusText(isEnglish ? "Verifying with Payment Gateways..." : "Inawasiliana na mitandao ya simu...");

    setTimeout(() => {
      setPayStatusText(
        isEnglish
          ? `Waiting for ${checkoutMethod} push notification on your device...`
          : `Tafadhali thibitisha muamala kwenye simu yako kupitia ${checkoutMethod}...`
      );
      
      setTimeout(() => {
        setPayStatusText(isEnglish ? "Securing license tokens..." : "Inaandaa hatimiliki za premium...");
        
        setTimeout(() => {
          setIsPaying(false);
          setHasPremium(true);
          setShowCheckout(false);
          alert(
            isEnglish
              ? "Payment Successful! TCN Premium VIP is now active. Enjoy Unlimited Streaming."
              : "Malipo yamekamilika! Kipindi cha TCN Premium kimeanza kufanya kazi sasa. Burudika bila kikomo."
          );
          // Add system notification
          setNotifications(prev => [
            {
              id: `n-${Date.now()}`,
              title: isEnglish ? "VIP Plan Active!" : "Kifurushi cha VIP Kimeamilishwa!",
              message: isEnglish ? "Premium Streaming and Offline Downloads are unlocked." : "Burudani ya HD na kupakua video imefunguliwa sasa.",
              timestamp: "Hivi sasa",
              read: false
            },
            ...prev
          ]);
        }, 1500);
      }, 2500);
    }, 1500);
  };

  // Switch translations
  const currentLanguage = isEnglish ? "English" : "Swahili";

  // Filter content catalog dynamically
  const filteredCatalog = catalog.filter(movie => {
    // 1. Search Query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchDesc = movie.description.toLowerCase().includes(q);
      const matchGenre = movie.genres.some(g => g.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchGenre) return false;
    }

    // 2. Kid filter
    if (activeProfile?.isKids) {
      // Show only Kids category or Animation
      return movie.category === "Kids" || movie.genres.includes("Animation");
    }

    return true;
  });

  const featuredBanners = filteredCatalog.filter(m => m.isFeatured);
  const trendingMovies = filteredCatalog.filter(m => m.isTrending);
  const bongoMovies = filteredCatalog.filter(m => m.isBongo);
  const swahiliMovies = filteredCatalog.filter(m => m.isSwahili && !m.isBongo);
  const liveTv = filteredCatalog.filter(m => m.category === "Live TV");
  const radioStations = filteredCatalog.filter(m => m.category === "Radio");
  const kidsSections = filteredCatalog.filter(m => m.category === "Kids");
  const documentaries = filteredCatalog.filter(m => m.category === "Documentary");
  const animeSections = filteredCatalog.filter(m => m.category === "Anime");

  // Get offline downloaded movies only
  const offlineDownloads = filteredCatalog.filter(m => {
    const saved = JSON.parse(localStorage.getItem("tcn_downloads") || "[]");
    return saved.includes(m.id);
  });

  const nextHero = () => {
    if (featuredBanners.length > 0) {
      setHeroIndex(prev => (prev + 1) % featuredBanners.length);
    }
  };

  const prevHero = () => {
    if (featuredBanners.length > 0) {
      setHeroIndex(prev => (prev - 1 + featuredBanners.length) % featuredBanners.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col justify-between font-sans relative antialiased selection:bg-orange-500 selection:text-slate-950 overflow-x-hidden">
      <BrandingInjector />

      {/* Ambient Glows of Immersive UI Theme */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] bg-orange-600/5 blur-[150px] rounded-full"></div>
      </div>

      {/* Top Header Navigation bar */}
      <header className="sticky top-0 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <TCNLogo className="h-9 cursor-pointer" />

            {/* Navigation Tabs (Only if user has selected a profile) */}
            {activeProfile && (
              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`py-1.5 px-0.5 transition-all cursor-pointer font-bold ${
                    activeTab === "home" ? "text-white border-b-2 border-orange-500 rounded-none" : "hover:text-white"
                  }`}
                >
                  {isEnglish ? "Home" : "Mwanzo"}
                </button>
                <button
                  onClick={() => setActiveTab("forums")}
                  className={`py-1.5 px-0.5 transition-all cursor-pointer font-bold ${
                    activeTab === "forums" ? "text-white border-b-2 border-orange-500 rounded-none" : "hover:text-white"
                  }`}
                >
                  {isEnglish ? "Forums" : "Jamii Forum"}
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`py-1.5 px-0.5 transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    activeTab === "ai" ? "text-white border-b-2 border-orange-500 rounded-none" : "hover:text-white text-orange-400"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isEnglish ? "TCN AI Suggestions" : "Ushauri wa AI"}</span>
                </button>
                <button
                  onClick={() => setActiveTab("watchlist")}
                  className={`py-1.5 px-0.5 transition-all cursor-pointer font-bold ${
                    activeTab === "watchlist" ? "text-white border-b-2 border-orange-500 rounded-none" : "hover:text-white"
                  }`}
                >
                  {isEnglish ? "My Watchlist" : "Vipindi Vyangu"}
                </button>
                {!activeProfile.isKids && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`py-1.5 px-0.5 transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                      activeTab === "admin" ? "text-white border-b-2 border-orange-500 rounded-none" : "hover:text-white text-slate-400"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search inputs */}
            {activeProfile && (
              <div className="relative max-w-[160px] md:max-w-xs hidden sm:block">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-4 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isEnglish ? "Search Movies, Live TV..." : "Tafuta filamu, tamthilia..."}
                  className="bg-white/5 text-slate-100 placeholder-gray-400 text-xs pl-10 pr-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-orange-500 w-full transition-all"
                />
              </div>
            )}

            {/* Offline simulator toggle button */}
            <button
              onClick={() => {
                setIsOnline(!isOnline);
                if (isOnline) {
                  alert(isEnglish ? "You are now simulating Offline Mode! Only downloaded content will stream." : "Umeingia kwenye mfumo wa Offline! Video zilizopakuliwa tu ndio zitacheza.");
                } else {
                  alert(isEnglish ? "Back Online! Live catalogs restored." : "Umerudi Mtandaoni! Vituo vyote viko hai.");
                }
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer relative group border ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
              }`}
            >
              {isOnline ? <Wifi className="w-4.5 h-4.5" /> : <WifiOff className="w-4.5 h-4.5" />}
              <span className="absolute top-11 right-0 scale-0 group-hover:scale-100 transition-all bg-slate-900 border border-slate-800 text-[9px] font-bold text-white py-1 px-2 rounded whitespace-nowrap shadow-xl z-50">
                {isOnline ? "Online (Soma Seva)" : "Offline Mode (Downloaded Only)"}
              </span>
            </button>

            {/* Multilingual Switcher */}
            <button
              onClick={() => setIsEnglish(!isEnglish)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:text-white text-slate-300 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"
            >
              <Globe className="w-4 h-4 text-orange-500" />
              <span>{isEnglish ? "EN" : "SW"}</span>
            </button>

            {/* Notification triggers */}
            {activeProfile && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white cursor-pointer relative"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 w-72 z-50 animate-fade-in flex flex-col gap-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2 mb-1">
                      {isEnglish ? "System Alerts" : "Taarifa Mpya"}
                    </h4>
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs pb-2 border-b border-slate-850 last:border-0 last:pb-0">
                        <h5 className="font-bold text-slate-100">{n.title}</h5>
                        <p className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIP Subscribe premium button */}
            {activeProfile && (
              <button
                onClick={() => {
                  setSelectedPlan(plans[3]); // Default Yearly highlight
                  setShowCheckout(true);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  hasPremium
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 text-slate-950 font-black hover:brightness-110"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hasPremium ? "VIP ACTIVE" : isEnglish ? "UPGRADE TO VIP" : "JIUNGE VIP"}</span>
              </button>
            )}

            {/* Profile Picker indicator / triggers */}
            {activeProfile ? (
              <div className="flex items-center gap-2 border-l border-slate-900 pl-3">
                <button
                  onClick={() => setActiveProfile(null)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <img src={activeProfile.avatar} alt="" className="w-4.5 h-4.5 rounded-full" />
                  <span className="max-w-[70px] truncate hidden md:inline text-slate-200">{activeProfile.name}</span>
                  <LogOut className="w-3 h-3 text-red-400 ml-1" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-orange-500 text-slate-950 hover:bg-orange-600 font-bold text-xs py-1.5 px-4 rounded-lg cursor-pointer flex items-center gap-1 transition-all"
              >
                <User className="w-4 h-4 text-slate-950" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 flex flex-col gap-8">
        
        {/* SCENARIO A: CHOOSE PROFILE SELECTOR VIEW (SPLASH WELCOME SCREEN) */}
        {!activeProfile ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center max-w-xl mx-auto">
            {/* Ambient Logo Sphere */}
            <div className="h-44 w-44 mb-6">
              <TCNLogo showText={false} className="h-full w-full" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-wide uppercase">
              {isEnglish ? "Who is streaming on TCN?" : "Nani anaangalia TCN leo?"}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              {isEnglish
                ? "Select a profile to experience curated local Tanzanian & international films."
                : "Chagua wasifu kuanza kutazama filamu, live TV, katuni na soka ya msimu."}
            </p>

            {/* Multi-user profiles selector grid */}
            <div className="grid grid-cols-2 gap-8 my-8 w-full max-w-md justify-center">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProfileSelect(p)}
                  className="flex flex-col items-center gap-3.5 group cursor-pointer focus:outline-none"
                >
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/10 group-hover:ring-orange-500 group-focus:ring-orange-500 transition-all duration-300 shadow-xl group-hover:scale-105"
                    />
                    {p.isKids && (
                      <span className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-lg">
                        Kids
                      </span>
                    )}
                    {!p.isKids && p.parentalControlPin && (
                      <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> PIN
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-300 group-hover:text-white transition-all uppercase tracking-wider">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-4 w-full">
              {isEnglish
                ? "Switch back or edit accounts anytime by logging out of the profile."
                : "Unaweza kubadilisha wasifu huu au kuongeza PIN ya wazazi baadaye."}
            </div>
          </div>
        ) : (
          /* SCENARIO B: ACTIVE PROFILE CORE FLOWS (HOMEPAGE, CHANNELS, COMMUNITY, ADMIN) */
          <div className="flex flex-col gap-8 animate-fade-in">
            
            {/* HERO SLIDER BLOCK (Homepage tab only & no query) */}
            {activeTab === "home" && searchQuery === "" && featuredBanners.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] border border-white/5 group shadow-2xl">
                <img
                  src={featuredBanners[heroIndex].banner}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-[0.55]"
                />

                {/* Left/Right Slides controls */}
                <button
                  onClick={prevHero}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-orange-500 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextHero}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-orange-500 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Banner Content Details overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 md:p-10 flex flex-col justify-end max-w-xl">
                  <span className="text-[10px] font-black uppercase bg-orange-500 text-slate-950 py-0.5 px-2 rounded-full w-fit tracking-widest border border-orange-400 mb-2">
                    {featuredBanners[heroIndex].category}
                  </span>
                  <h2 className="text-xl md:text-3xl font-black text-white leading-tight uppercase tracking-wider drop-shadow">
                    {featuredBanners[heroIndex].title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed drop-shadow line-clamp-2 md:line-clamp-3">
                    {featuredBanners[heroIndex].description}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        if (!isOnline && !offlineDownloads.some(m => m.id === featuredBanners[heroIndex].id)) {
                          alert(isEnglish ? "This video is not downloaded and you are offline!" : "Video hii haijapakuliwa na hauna mtandao!");
                          return;
                        }
                        setActiveMovie(featuredBanners[heroIndex]);
                      }}
                      className="px-6 py-2.5 bg-white hover:bg-gray-200 text-black font-extrabold text-xs rounded-md flex items-center gap-2 transition-colors shadow-xl cursor-pointer uppercase tracking-wider"
                    >
                      <Play className="w-4 h-4 text-black fill-current" />
                      <span>{isEnglish ? "Play Now" : "Angalia Sasa"}</span>
                    </button>
                    <button
                      onClick={() => {
                        const saved = JSON.parse(localStorage.getItem("tcn_watchlist") || "[]");
                        if (!saved.includes(featuredBanners[heroIndex].id)) {
                          localStorage.setItem("tcn_watchlist", JSON.stringify([...saved, featuredBanners[heroIndex].id]));
                          setWatchlistIds([...saved, featuredBanners[heroIndex].id]);
                          alert(isEnglish ? "Added to watchlist!" : "Imewekwa kwenye vipindi vyako!");
                        }
                      }}
                      className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold text-xs rounded-md flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isEnglish ? "My List" : "Kwenye Orodha"}</span>
                    </button>
                  </div>
                </div>

                {/* Bullet indicator anchors */}
                <div className="absolute bottom-4 right-6 flex gap-2">
                  {featuredBanners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        heroIndex === idx ? "bg-orange-500 w-5" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: HOME VIEW DASHBOARD WITH CONTENT CAROUSELS */}
            {activeTab === "home" && (
              <div className="flex flex-col gap-8">
                
                {/* Simulated Offline Mode warning banner */}
                {!isOnline && (
                  <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <WifiOff className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-semibold">
                      {isEnglish
                        ? "Currently in Offline Mode. We have filtered your local library only. Rest of live catalogues are disabled."
                        : "Uko nje ya mtandao kwa sasa. Tunaonyesha video ulizopakua tu kwenye kifaa chako."}
                    </span>
                  </div>
                )}

                {/* SEARCH RESULTS VIEW */}
                {searchQuery !== "" && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
                      {isEnglish ? "Search Results for" : "Matokeo ya utafiti wa"} "{searchQuery}" ({filteredCatalog.length} found)
                    </h3>
                    {filteredCatalog.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900 rounded-xl border border-slate-850">
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-xs font-medium">
                          {isEnglish ? "No content matches your query." : "Hakuna filamu wala tamthilia inayolingana na ulivyotafuta."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredCatalog.map(movie => (
                          <div
                            key={movie.id}
                            onClick={() => {
                              if (!isOnline && !offlineDownloads.some(m => m.id === movie.id)) {
                                alert("Sio offline video!");
                                return;
                              }
                              setActiveMovie(movie);
                            }}
                            className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden cursor-pointer hover:border-orange-500/50 hover:scale-102 transition-all flex flex-col justify-between"
                          >
                            <img src={movie.thumbnail} alt="" className="aspect-square object-cover w-full" />
                            <div className="p-3">
                              <h4 className="text-xs font-bold text-white line-clamp-1">{movie.title}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">{movie.category} • {movie.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* HOMEPAGE ROW CAROUSELS (Only if search is empty) */}
                {searchQuery === "" && (
                  <>
                    {/* Carousel Generator Helper */}
                    {[
                      { title: isEnglish ? "Premium Featured Blockbusters" : "Vipindi Maalum vya TCN VIP", items: featuredBanners, show: isOnline },
                      { title: isEnglish ? "Offline Playback Library" : "Maktaba ya Offline (Downloaded)", items: offlineDownloads, show: offlineDownloads.length > 0 },
                      { title: isEnglish ? "Bongo Movies & Series" : "Filamu na Tamthilia Kali za Kibongo", items: bongoMovies, show: isOnline },
                      { title: isEnglish ? "Swahili Dubbed Hits (Luku)" : "Filamu Zilizotafsiriwa Kiswahili (Swahili Dub)", items: swahiliMovies, show: isOnline },
                      { title: isEnglish ? "Live TV Channels 24/7" : "Vituo vya Moja kwa Moja (Live TV)", items: liveTv, show: isOnline },
                      { title: isEnglish ? "Radio Stations Live" : "Radio na Podcasts Moja kwa Moja", items: radioStations, show: isOnline },
                      { title: isEnglish ? "TCN Kids Animation Zone" : "Katalogi Salama ya Watoto (TCN Kids)", items: kidsSections, show: true },
                      { title: isEnglish ? "Documentary & Nature" : "Makala za Wanyama na Mazingira", items: documentaries, show: isOnline },
                      { title: isEnglish ? "Anime Swahili Dub" : "Vipindi vya Anime Tafsiri", items: animeSections, show: isOnline }
                    ].map(row => {
                      if (!row.show || row.items.length === 0) return null;

                      return (
                        <div key={row.title} className="flex flex-col gap-3">
                          <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs md:text-sm font-extrabold text-white uppercase tracking-wider border-l-4 border-orange-500 pl-3.5 flex items-center gap-2">
                              {row.title}
                            </h3>
                          </div>

                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                            {row.items.map(movie => (
                              <div
                                key={movie.id}
                                onClick={() => setActiveMovie(movie)}
                                className="min-w-[150px] md:min-w-[180px] max-w-[200px] bg-white/5 border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/50 hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between flex-shrink-0 snap-start shadow-xl"
                              >
                                <div className="relative aspect-video w-full overflow-hidden">
                                  <img src={movie.thumbnail} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                  
                                  {/* Premium label indicator */}
                                  {movie.isPremium && (
                                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow">
                                      VIP
                                    </span>
                                  )}

                                  {/* Rating display */}
                                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-orange-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                    ★ {movie.rating}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <h4 className="text-[11px] font-bold text-white line-clamp-1">{movie.title}</h4>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{movie.category}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{movie.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: FORUMS SOCIAL FORUM MODULE */}
            {activeTab === "forums" && (
              <CommunityForum isEnglish={isEnglish} currentUsername={activeProfile.name} />
            )}

            {/* TAB CONTENT: AI RECOMMENDATION ASSISTANT */}
            {activeTab === "ai" && (
              <AIRecommend isEnglish={isEnglish} currentLanguage={currentLanguage} />
            )}

            {/* TAB CONTENT: WATCHLIST / FAVORITES */}
            {activeTab === "watchlist" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-3">
                  {isEnglish ? "My Personal Watchlist" : "Orodha Yangu ya Vipindi"}
                </h3>
                {watchlistIds.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900 border border-slate-850 rounded-xl">
                    <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-xs">
                      {isEnglish ? "Your list is empty. Add movies using the + List button!" : "Hakuna filamu uliyoiweka bado. Bonyeza kitufe cha + Orodha kwenye kicheza video."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {catalog
                      .filter(m => watchlistIds.includes(m.id))
                      .map(movie => (
                        <div
                          key={movie.id}
                          onClick={() => setActiveMovie(movie)}
                          className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/50 hover:scale-102 transition-all flex flex-col justify-between"
                        >
                          <img src={movie.thumbnail} alt="" className="aspect-video object-cover w-full" />
                          <div className="p-3">
                            <h4 className="text-xs font-bold text-white line-clamp-1">{movie.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-1">{movie.category} • {movie.duration}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ADMIN PANEL CATALOG SYSTEM INGEST */}
            {activeTab === "admin" && !activeProfile.isKids && (
              <AdminPanel onMediaUploaded={fetchCatalog} isEnglish={isEnglish} />
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: INTEGRATED VIDEO PLAYBACK LIGHTBOX WRAPPER */}
      {activeMovie && (
        <LivePlayer
          movie={activeMovie}
          onClose={() => setActiveMovie(null)}
          isPremiumUser={hasPremium}
          onTriggerSubscription={() => {
            setActiveMovie(null);
            setSelectedPlan(plans[1]); // Upgrade Monthly
            setShowCheckout(true);
          }}
        />
      )}

      {/* MODAL 2: PARENTAL PIN CONTROL MODAL GATE */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl animate-fade-in flex flex-col gap-4">
            <div className="text-center">
              <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-full w-fit mx-auto mb-3.5 border border-amber-500/20">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider">Parental Control Lock</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isEnglish ? "Please enter Adult PIN code to switch user profiles (Default: 1234)." : "Weka PIN ya wazazi kudhibiti uingiaji wa wasifu huu (Default: 1234)."}
              </p>
            </div>

            <form onSubmit={verifyPinSubmit} className="flex flex-col gap-4">
              <input
                type="password"
                required
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-3 text-center text-lg font-black font-mono tracking-widest text-white focus:outline-none"
              />

              {pinError && <div className="text-xs text-red-400 font-medium text-center">{pinError}</div>}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg py-2 text-xs font-semibold"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-2 rounded-lg text-xs tracking-wider"
                >
                  Thibitisha (Verify)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBSCRIPTION CHOOSE & PAYMENT GATEWAY FLOW */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full text-white shadow-2xl animate-fade-in flex flex-col gap-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {isEnglish ? "Select TCN Stream Plan" : "Chagua Kifurushi chako cha TCN"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isEnglish ? "Unlock 4K streams, Swahili Dub blockbusters, and direct offline downloads." : "Fungua uwezo wa kuangalia kwa 4K, filamu zote za Bongo na kupakua video bila kikomo."}
                </p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-white text-xs font-bold border border-slate-800 py-1 px-3 rounded bg-slate-950"
              >
                ✕
              </button>
            </div>

            {/* Plans row select cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {plans.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={`border rounded-xl p-3 flex flex-col justify-between text-left transition-all cursor-pointer ${
                    selectedPlan?.id === p.id
                      ? "border-orange-500 bg-orange-500/10 scale-102"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      {p.period === "year" ? "Mwaka" : "Mwezi"}
                    </span>
                    <h4 className="text-[10px] font-extrabold text-white line-clamp-2 mt-0.5">{p.name}</h4>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-black text-orange-400 font-mono">{p.priceTZS}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{p.priceUSD} / {p.period}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Plan Details benefits lists */}
            {selectedPlan && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h5 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-2">
                    Faida za {selectedPlan.name}
                  </h5>
                  <ul className="flex flex-col gap-1.5">
                    {selectedPlan.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Billing details Checkout Forms */}
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-3.5 flex-1 max-w-sm">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                    {isEnglish ? "Select Payment Method" : "Chagua Njia ya Kulipia"}
                  </h5>

                  <div className="grid grid-cols-3 gap-2">
                    {["M-Pesa", "Airtel Money", "Stripe", "PayPal", "Visa", "Mastercard"].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setCheckoutMethod(method as any)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all text-center cursor-pointer ${
                          checkoutMethod === method
                            ? "bg-orange-500 text-slate-950 border-transparent shadow"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic payment input triggers */}
                  {(checkoutMethod === "M-Pesa" || checkoutMethod === "Airtel Money") ? (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {isEnglish ? "Mobile Money Phone Number" : "Namba ya Simu ya Malipo"} (0XXX XXXXXX)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneCheckout}
                        onChange={e => setPhoneCheckout(e.target.value)}
                        placeholder="e.g. 0768 123456"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        {isEnglish ? "Credit Card Details" : "Maelezo ya Kadi"}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardCheckout}
                          onChange={e => setCardCheckout(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      </div>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    {isPaying ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-mono lowercase tracking-normal">{payStatusText}</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>{isEnglish ? "CONFIRM PAYMENT & UNLOCK VIP" : "THIBITISHA MALIPO YA VIP"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding bar */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-8 px-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <TCNLogo className="h-8 mb-2" showText={true} />
            <p className="max-w-md">
              {isEnglish
                ? "TCN Stream - Premium streaming platform with beautiful Swahili local bongo movies & live global TV channels. Inspired by VIPINDI Kenya & NYOTAPLAY."
                : "TCN Stream - Mfumo bora wa kilele wa burudani na filamu kali za kibongo, soka live na tafsiri ya Swahili Luku."}
            </p>
          </div>

          <div className="flex flex-col gap-1 items-center md:items-end">
            <div className="flex gap-4 font-bold text-[11px] text-slate-400">
              <a href="#terms" className="hover:text-orange-400 transition-colors">Sheria na Masharti</a>
              <span>•</span>
              <a href="#privacy" className="hover:text-orange-400 transition-colors">Faragha (Privacy)</a>
              <span>•</span>
              <a href="#faq" className="hover:text-orange-400 transition-colors">Msaada (FAQ)</a>
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">
              © 2026 TCN Stream. All Rights Reserved. Built securely with Gemini AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
