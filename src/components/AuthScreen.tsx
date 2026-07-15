/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  Phone, 
  User as UserIcon, 
  Shield, 
  ArrowRight, 
  Globe, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle,
  Smartphone,
  Sparkles,
  Key
} from "lucide-react";
import { TCNLogo } from "./Branding";

interface AuthScreenProps {
  isEnglish: boolean;
  onAuthSuccess: (token: string, user: any) => void;
}

interface Country {
  name: string;
  code: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "India", code: "+91", flag: "🇮🇳" },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ isEnglish, onAuthSuccess }) => {
  // Navigation: "landing" | "login" | "register" | "otp" | "forgot" | "verify"
  const [authStep, setAuthStep] = useState<"landing" | "login" | "register" | "otp" | "forgot" | "verify">("landing");
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "google">("email");
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // Country code selector
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Verification states
  const [otpCode, setOtpCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [simulatedCode, setSimulatedCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-detect country based on timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Nairobi")) {
        setSelectedCountry(COUNTRIES.find(c => c.code === "+254") || COUNTRIES[0]);
      } else if (tz.includes("Kampala")) {
        setSelectedCountry(COUNTRIES.find(c => c.code === "+256") || COUNTRIES[0]);
      } else if (tz.includes("Kigali")) {
        setSelectedCountry(COUNTRIES.find(c => c.code === "+250") || COUNTRIES[0]);
      } else if (tz.includes("Bujumbura")) {
        setSelectedCountry(COUNTRIES.find(c => c.code === "+257") || COUNTRIES[0]);
      } else if (tz.includes("Johannesburg")) {
        setSelectedCountry(COUNTRIES.find(c => c.code === "+27") || COUNTRIES[0]);
      } else {
        // Default is Tanzania
        setSelectedCountry(COUNTRIES.find(c => c.code === "+255") || COUNTRIES[0]);
      }
    } catch (e) {
      console.warn("Timezone country detection failed, defaulting to TZ", e);
    }
  }, []);

  // Timer for resending code
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleActionError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 6000);
  };

  const handleActionSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 6000);
  };

  // Google Sign-In (Simulation)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/google-one-tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "anjelinemitto120@gmail.com", name: "Anjelina Mitto" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Google Sign-In failed");
      
      handleActionSuccess(isEnglish ? "Signed in with Google successfully!" : "Umeingia na Google kikamilifu!");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 1000);
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Register Form (Email/Phone)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!fullName.trim()) {
      return handleActionError(isEnglish ? "Please enter your full name." : "Tafadhali weka jina lako kamili.");
    }
    
    if (authMethod === "email" && !email.trim()) {
      return handleActionError(isEnglish ? "Please enter email address." : "Tafadhali weka barua pepe.");
    }
    
    if (authMethod === "phone" && !phone.trim()) {
      return handleActionError(isEnglish ? "Please enter phone number." : "Tafadhali weka namba ya simu.");
    }
    
    if (password.length < 6) {
      return handleActionError(isEnglish ? "Password must be at least 6 characters." : "Nenosiri lazima liwe na herufi angalau 6.");
    }
    
    if (password !== confirmPassword) {
      return handleActionError(isEnglish ? "Passwords do not match." : "Nenosiri hazilingani.");
    }

    setLoading(true);
    try {
      const signupBody = {
        name: fullName,
        email: authMethod === "email" ? email : undefined,
        phone: authMethod === "phone" ? `${selectedCountry.code}${phone.replace(/^0+/, "")}` : undefined,
        password,
        method: authMethod
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupBody)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      // Trigger verification flow automatically
      if (authMethod === "email") {
        setSimulatedCode(data.simulatedCode);
        setAuthStep("verify");
        handleActionSuccess(isEnglish ? `Verification code sent to ${email}!` : `Kodi ya uthibitisho imetumwa kwenye ${email}!`);
      } else {
        setSimulatedCode(data.simulatedCode);
        setAuthStep("otp");
        handleActionSuccess(isEnglish ? `OTP sent to phone number!` : `OTP imetumwa kwenye namba yako ya simu!`);
      }
      setResendTimer(60);
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Login Form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMethod === "email" && !email.trim()) {
      return handleActionError(isEnglish ? "Please enter email address." : "Tafadhali weka barua pepe.");
    }
    
    if (authMethod === "phone" && !phone.trim()) {
      return handleActionError(isEnglish ? "Please enter phone number." : "Tafadhali weka namba ya simu.");
    }

    if (authMethod === "email" && !password) {
      return handleActionError(isEnglish ? "Please enter password." : "Tafadhali weka nenosiri.");
    }

    setLoading(true);
    try {
      const loginBody = {
        email: authMethod === "email" ? email : undefined,
        phone: authMethod === "phone" ? `${selectedCountry.code}${phone.replace(/^0+/, "")}` : undefined,
        password: authMethod === "email" ? password : undefined,
        method: authMethod
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginBody)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      if (authMethod === "phone") {
        // Phone login always triggers simulated OTP
        setSimulatedCode(data.simulatedCode);
        setAuthStep("otp");
        setResendTimer(60);
        handleActionSuccess(isEnglish ? "OTP sent to your phone!" : "OTP imetumwa kwenye simu yako!");
      } else {
        // Email login check if verification required (mock verified by default for simplicity unless explicitly registering)
        handleActionSuccess(isEnglish ? "Logged in successfully!" : "Umeingia kikamilifu!");
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
        }, 1000);
      }
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP for Phone login/registration
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpCode) {
      return handleActionError(isEnglish ? "Please enter OTP code." : "Tafadhali weka namba ya OTP.");
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.code}${phone.replace(/^0+/, "")}`;
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber, otp: otpCode })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");

      handleActionSuccess(isEnglish ? "Phone verified successfully!" : "Namba ya simu imethibitishwa!");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 1000);
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Email Code
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode) {
      return handleActionError(isEnglish ? "Please enter verification code." : "Tafadhali weka kodi ya uthibitisho.");
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed");

      handleActionSuccess(isEnglish ? "Email verified successfully!" : "Barua pepe imethibitishwa!");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
      }, 1000);
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      return handleActionError(isEnglish ? "Please enter email address." : "Tafadhali weka barua pepe.");
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Password reset failed");

      setSimulatedCode(data.simulatedCode);
      handleActionSuccess(isEnglish ? "Simulated reset instructions sent!" : "Maelekezo ya kufufua nenosiri yametengenezwa!");
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend code trigger
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");

    try {
      let endpoint = "/api/auth/send-otp";
      let payload = {};

      if (authStep === "verify") {
        endpoint = "/api/auth/register";
        payload = { name: fullName, email, password, method: "email" };
      } else {
        const fullPhoneNumber = `${selectedCountry.code}${phone.replace(/^0+/, "")}`;
        payload = { phone: fullPhoneNumber };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resend code");

      setSimulatedCode(data.simulatedCode);
      setResendTimer(60);
      handleActionSuccess(isEnglish ? "New code sent!" : "Kodi mpya imetumwa!");
    } catch (err: any) {
      handleActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between font-sans overflow-x-hidden">
      {/* Immersive background overlay with posters */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=40')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <TCNLogo className="h-10 md:h-12 cursor-pointer" showText={true} textSize="text-xl md:text-2xl" />
        
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs font-semibold hidden md:inline">
            {isEnglish ? "Need Help?" : "Unahitaji msaada?"}
          </span>
          <a href="#help" className="text-xs hover:underline text-slate-300 hidden md:inline mr-2">
            {isEnglish ? "Contact Us" : "Wasiliana Nasi"}
          </a>
        </div>
      </header>

      {/* Notification banner */}
      {simulatedCode && (
        <div className="relative z-20 max-w-md mx-auto w-full px-4 mt-2">
          <div className="bg-orange-500/10 border-2 border-orange-500/55 text-orange-200 px-4 py-3 rounded-xl flex items-start gap-3 shadow-2xl animate-bounce">
            <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold uppercase tracking-wide block text-orange-400">
                [TCN Simu/Sms Gateway Simulator]
              </span>
              <p className="mt-1">
                {isEnglish 
                  ? `Your simulated verification code is: ` 
                  : `Kodi yako ya uthibitisho ni: `}
                <strong className="text-white text-sm font-black font-mono select-all bg-orange-500/30 px-1.5 py-0.5 rounded">{simulatedCode}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error & Success States */}
      <div className="relative z-20 max-w-md mx-auto w-full px-4 mt-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{success}</span>
          </div>
        )}
      </div>

      {/* Main Card Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-black/65 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          
          {/* STEP 1: LANDING OVERVIEW */}
          {authStep === "landing" && (
            <div className="flex flex-col gap-6 text-center animate-fade-in">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase leading-tight">
                  {isEnglish ? "Unlimited Bongo Movies & Live TV" : "Burudani Bila Kikomo ya Kibongo & Soka Live"}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {isEnglish 
                    ? "Join today. Watch Swahili blockbusters and live leagues anywhere, anytime."
                    : "Jiunge leo. Tazama filamu zote kali za kibongo na soka ya NBC Premier League popote ulipo."}
                </p>
              </div>

              {/* Login option triggers */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setAuthMethod("email");
                    setAuthStep("login");
                  }}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-98 transition-all text-slate-950 font-extrabold text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Mail className="w-4 h-4 text-slate-950" />
                  <span>{isEnglish ? "Continue with Email Address" : "Endelea na Barua Pepe"}</span>
                </button>

                <button
                  onClick={() => {
                    setAuthMethod("phone");
                    setAuthStep("login");
                  }}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-98 transition-all text-white font-extrabold text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>{isEnglish ? "Continue with Phone Number" : "Endelea na Namba ya Simu"}</span>
                </button>

                <div className="flex items-center gap-4 my-2 text-slate-600 text-xs font-bold uppercase tracking-widest justify-center">
                  <span className="h-[1px] bg-slate-800 flex-1"></span>
                  <span>{isEnglish ? "or" : "au"}</span>
                  <span className="h-[1px] bg-slate-800 flex-1"></span>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black hover:bg-gray-100 active:scale-98 transition-all font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                >
                  {/* Google Custom G Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isEnglish ? "Continue with Google" : "Endelea na Google"}</span>
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-white/5">
                {isEnglish ? "Already have a TCN account?" : "Tayari unayo akaunti?"}{" "}
                <button
                  onClick={() => setAuthStep("login")}
                  className="text-orange-400 font-extrabold hover:underline"
                >
                  {isEnglish ? "Log In" : "Ingia Sasa"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOGIN FORM */}
          {authStep === "login" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold tracking-wide uppercase">
                  {isEnglish ? "Sign In" : "Ingia"}
                </h3>
                <button
                  onClick={() => setAuthStep("landing")}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toggle Email vs Phone within Login */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setAuthMethod("email")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    authMethod === "email" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isEnglish ? "Email Address" : "Barua Pepe"}
                </button>
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    authMethod === "phone" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isEnglish ? "Phone Number" : "Namba ya Simu"}
                </button>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {authMethod === "email" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Email Address" : "Anwani ya Barua Pepe"}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. anjelinemitto120@gmail.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Phone Number" : "Namba ya Simu"}
                    </label>
                    <div className="flex gap-2">
                      {/* Country Select */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-xs px-3 rounded-xl flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span className="font-mono text-slate-300">{selectedCountry.code}</span>
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute top-12 left-0 w-44 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                            {COUNTRIES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span className="truncate">{c.name}</span>
                                <span className="font-mono text-slate-400 text-[10px]">{c.flag} {c.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="768 123 456"
                          className="w-full h-11 bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none font-mono placeholder-slate-600 transition-colors"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                  </div>
                )}

                {authMethod === "email" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {isEnglish ? "Password" : "Nenosiri"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthStep("forgot")}
                        className="text-[10px] font-semibold text-orange-400 hover:underline"
                      >
                        {isEnglish ? "Forgot Password?" : "Umesahau nenosiri?"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                )}

                {/* Remember Me and Check options */}
                <div className="flex items-center justify-between text-xs my-1">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="accent-orange-500 rounded cursor-pointer"
                    />
                    <span>{isEnglish ? "Remember Me" : "Nikumbuke"}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-98 transition-all text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{authMethod === "phone" ? (isEnglish ? "Send OTP Code" : "Tuma kodi ya OTP") : (isEnglish ? "Sign In" : "Ingia")}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              {/* One Tap Simulation banner */}
              {authMethod === "email" && (
                <div className="bg-slate-900/30 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-slate-300 font-medium">Google One-Tap Enabled</span>
                  </div>
                  <button 
                    onClick={handleGoogleSignIn}
                    className="text-[10px] font-bold text-orange-400 hover:underline cursor-pointer"
                  >
                    {isEnglish ? "Sign in as Anjelina" : "Ingia kama Anjelina"}
                  </button>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-white/5">
                {isEnglish ? "New to TCN Stream?" : "Mgeni katika TCN Stream?"}{" "}
                <button
                  onClick={() => setAuthStep("register")}
                  className="text-orange-400 font-extrabold hover:underline"
                >
                  {isEnglish ? "Sign Up Now" : "Sajili Akaunti Mpya"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REGISTER FORM */}
          {authStep === "register" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold tracking-wide uppercase">
                  {isEnglish ? "Create Account" : "Sajili Akaunti"}
                </h3>
                <button
                  onClick={() => setAuthStep("landing")}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Register method toggle */}
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setAuthMethod("email")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    authMethod === "email" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isEnglish ? "Register with Email" : "Sajili na Barua Pepe"}
                </button>
                <button
                  onClick={() => setAuthMethod("phone")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                    authMethod === "phone" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isEnglish ? "Register with Phone" : "Sajili na Namba"}
                </button>
              </div>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Full name (Required for both) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {isEnglish ? "Full Name" : "Jina Kamili"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Anjelina Mitto"
                      className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                    />
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {authMethod === "email" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Email Address" : "Barua Pepe"}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="anjelinemitto120@gmail.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Phone Number" : "Namba ya Simu"}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-xs px-3 rounded-xl flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span className="font-mono text-slate-300">{selectedCountry.code}</span>
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute top-12 left-0 w-44 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                            {COUNTRIES.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span className="truncate">{c.name}</span>
                                <span className="font-mono text-slate-400 text-[10px]">{c.flag} {c.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="768 123 456"
                          className="w-full h-11 bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none font-mono placeholder-slate-600 transition-colors"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Password" : "Nenosiri"}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {isEnglish ? "Confirm" : "Thibitisha"}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  {isEnglish 
                    ? "By clicking create account, you agree to TCN Stream's Term of Service and Privacy Policy. An SMS OTP or email verification link will be created."
                    : "Kwa kubonyeza sajili akaunti, unakubaliana na vigezo, sheria na faragha za TCN Stream. Utapokea kodi ya OTP au barua pepe."}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-98 transition-all text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isEnglish ? "Create Account" : "Sajili Akaunti"}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-white/5">
                {isEnglish ? "Already have a TCN account?" : "Tayari unayo akaunti ya TCN?"}{" "}
                <button
                  onClick={() => setAuthStep("login")}
                  className="text-orange-400 font-extrabold hover:underline"
                >
                  {isEnglish ? "Log In" : "Ingia Sasa"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: OTP VERIFICATION (PHONE METHOD) */}
          {authStep === "otp" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-1 text-center">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-wider">
                  {isEnglish ? "Verify Phone" : "Thibitisha Simu"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isEnglish 
                    ? `Enter the 6-digit OTP code sent to ${selectedCountry.code} ${phone}`
                    : `Weka namba 6 za siri za OTP zilizotumwa kwenye ${selectedCountry.code} ${phone}`}
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
                    {isEnglish ? "OTP Security PIN" : "Kodi ya siri ya OTP"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 text-center text-lg font-black font-mono tracking-widest text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-98 transition-all text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isEnglish ? "Verify & Log In" : "Thibitisha na Ingia"}</span>
                      <Check className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-white/5 flex flex-col gap-2">
                <p>
                  {isEnglish ? "Didn't receive code?" : "Hujapokea kodi?"}{" "}
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="text-orange-400 font-extrabold hover:underline disabled:text-slate-600 disabled:no-underline"
                  >
                    {resendTimer > 0 
                      ? `${isEnglish ? "Resend in" : "Tuma tena baada ya"} ${resendTimer}s`
                      : (isEnglish ? "Resend OTP" : "Tuma upya OTP")}
                  </button>
                </p>
                <button
                  onClick={() => setAuthStep("login")}
                  className="text-slate-400 hover:text-white text-[10px] underline"
                >
                  {isEnglish ? "Back to Login" : "Rudi Nyuma"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: EMAIL VERIFICATION GATE */}
          {authStep === "verify" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-1 text-center">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-wider">
                  {isEnglish ? "Verify Email" : "Thibitisha Barua Pepe"}
                </h3>
                <p className="text-xs text-slate-400">
                  {isEnglish 
                    ? `Enter the 6-digit confirmation code sent to ${email}`
                    : `Weka namba 6 za uthibitisho zilizotumwa kwenye ${email}`}
                </p>
              </div>

              <form onSubmit={handleVerifyEmail} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
                    {isEnglish ? "Confirmation Code" : "Kodi ya Uthibitisho"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 text-center text-lg font-black font-mono tracking-widest text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-98 transition-all text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isEnglish ? "Thibitisha Barua Pepe" : "Verify & Complete"}</span>
                      <Check className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-white/5 flex flex-col gap-2">
                <p>
                  {isEnglish ? "Didn't receive code?" : "Hujapokea kodi?"}{" "}
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="text-orange-400 font-extrabold hover:underline disabled:text-slate-600 disabled:no-underline"
                  >
                    {resendTimer > 0 
                      ? `${isEnglish ? "Resend in" : "Tuma tena baada ya"} ${resendTimer}s`
                      : (isEnglish ? "Resend Code" : "Tuma upya kodi")}
                  </button>
                </p>
                <button
                  onClick={() => setAuthStep("register")}
                  className="text-slate-400 hover:text-white text-[10px] underline"
                >
                  {isEnglish ? "Change Email" : "Badilisha Barua Pepe"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: FORGOT PASSWORD FORM */}
          {authStep === "forgot" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold tracking-wide uppercase">
                  {isEnglish ? "Reset Password" : "Fungua Nenosiri"}
                </h3>
                <button
                  onClick={() => setAuthStep("login")}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isEnglish 
                  ? "Enter your email address below and we will simulate sending you a secure link or OTP reset code to restore your account."
                  : "Weka barua pepe yako hapa chini na tutatuma kodi na maelekezo ya kufungua nenosiri lako."}
              </p>

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {isEnglish ? "Email Address" : "Barua Pepe"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="anjelinemitto120@gmail.com"
                      className="w-full bg-white/5 border border-white/10 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-98 transition-all text-slate-950 font-black text-xs tracking-wider rounded-xl uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isEnglish ? "Generate Reset Code" : "Tengeneza Kodi ya Kufufua"}</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-3 border-t border-white/5">
                <button
                  onClick={() => setAuthStep("login")}
                  className="text-orange-400 font-extrabold hover:underline"
                >
                  {isEnglish ? "Back to Login" : "Rudi kwenye Kuingia"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 bg-black/80 border-t border-white/5 py-6 px-4 text-center text-xs text-slate-600 font-mono">
        <p className="max-w-md mx-auto">
          {isEnglish 
            ? "TCN Stream Tanzania. Secure JWT session encryption. Multiple devices authorized." 
            : "TCN Stream Tanzania. Ulinzi imara wa encryption ya JWT. Vifaa vingi vinaruhusiwa kuingia."}
        </p>
        <p className="mt-2 text-[10px] text-slate-700">
          © 2026 TCN Stream. All Rights Reserved. Inspired by Netflix, Showmax & Disney+ architectures.
        </p>
      </footer>
    </div>
  );
};
