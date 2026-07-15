/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Upload,
  FolderOpen,
  FileVideo,
  List,
  Users,
  TrendingUp,
  Database,
  Trash2,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  Activity,
  Plus,
  Eye,
  Settings
} from "lucide-react";
import { ContentItem } from "../types";

interface AdminPanelProps {
  onMediaUploaded: () => void;
  isEnglish: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onMediaUploaded, isEnglish }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "catalog" | "users" | "analytics">("upload");
  const [catalogList, setCatalogList] = useState<ContentItem[]>([]);

  // Form states for new upload
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Movie" | "TV Series" | "Live TV" | "Kids" | "Sports" | "News" | "Radio" | "Documentary" | "Anime">("Movie");
  const [genres, setGenres] = useState("Drama, Action");
  const [releaseYear, setReleaseYear] = useState("2026");
  const [isPremium, setIsPremium] = useState(false);
  const [isBongo, setIsBongo] = useState(true);
  const [isSwahili, setIsSwahili] = useState(true);

  // Drag-and-drop & Processing states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingPercent, setProcessingPercent] = useState(0);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setCatalogList(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files) as File[];
      setUploadedFiles(prev => [...prev, ...files]);
      if (title === "") {
        // Auto-extract title from file name
        const nameWithoutExt = files[0].name.split(".")[0].replace(/[_-]/g, " ");
        setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files) as File[];
      setUploadedFiles(prev => [...prev, ...files]);
      if (title === "") {
        const nameWithoutExt = files[0].name.split(".")[0].replace(/[_-]/g, " ");
        setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setAlertMsg({ type: "error", text: isEnglish ? "Please provide a media title." : "Tafadhali weka jina la filamu." });
      return;
    }

    setIsProcessing(true);
    setAlertMsg(null);

    // Simulate multi-stage premium transcoding / metadata extraction worker
    const steps = [
      { text: isEnglish ? "Extracting Video Containers & Metadata..." : "Kusoma taarifa za video (Metadata Extraction)...", duration: 1000 },
      { text: isEnglish ? "Parsing Audio Channels & Audio Languages..." : "Kupanga lugha za sauti na mivumo (Audio Tracking)...", duration: 1200 },
      { text: isEnglish ? "Generating AI Optimal Poster Thumbnails..." : "Kutengeneza picha za jalada la filamu (Auto-generating Thumbnails)...", duration: 1400 },
      { text: isEnglish ? "Transcoding into 480p Adaptive Quality..." : "Kugeuza ubora wa picha kwenda 480p SD...", duration: 800 },
      { text: isEnglish ? "Transcoding into 720p HD Stream Quality..." : "Kugeuza ubora wa picha kwenda 720p HD...", duration: 1000 },
      { text: isEnglish ? "Transcoding into 1080p Full-HD Quality..." : "Kugeuza ubora wa picha kwenda 1080p Full-HD...", duration: 1200 },
      { text: isEnglish ? "Injecting DRM & Encrypted Content Delivery Keys..." : "Kufunga ulinzi wa hakimiliki na funguo za DRM...", duration: 1000 }
    ];

    let currentStepIdx = 0;
    const runSteps = async () => {
      if (currentStepIdx < steps.length) {
        setProcessingStep(steps[currentStepIdx].text);
        setProcessingPercent(Math.floor(((currentStepIdx + 1) / steps.length) * 100));
        setTimeout(() => {
          currentStepIdx++;
          runSteps();
        }, steps[currentStepIdx].duration);
      } else {
        // Trigger server endpoint to save uploaded media
        try {
          const res = await fetch("/api/upload-media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              category,
              genres: genres.split(",").map(g => g.trim()),
              releaseYear,
              isPremium,
              isBongo,
              isSwahili,
              fileName: uploadedFiles[0]?.name || `${title.toLowerCase().replace(/\s+/g, "_")}.mp4`
            })
          });

          if (res.ok) {
            setAlertMsg({
              type: "success",
              text: isEnglish
                ? "Excellent! Media uploaded, fully transcoded, and added to catalogs successfully!"
                : "Hongera! Video imepandishwa, imetafsiriwa kwa ubora tofauti na kuwekwa kwenye maktaba!"
            });
            // Reset form
            setTitle("");
            setDescription("");
            setUploadedFiles([]);
            onMediaUploaded();
            fetchCatalog();
          } else {
            throw new Error();
          }
        } catch {
          setAlertMsg({ type: "error", text: isEnglish ? "Failed to save uploaded media to server catalog." : "Imeshindwa kuhifadhi filamu kwenye seva." });
        } finally {
          setIsProcessing(false);
          setProcessingStep("");
          setProcessingPercent(0);
        }
      }
    };

    runSteps();
  };

  const togglePremiumInCatalog = (id: string, currentPremium: boolean) => {
    // In-memory toggler
    setCatalogList(prev =>
      prev.map(item => (item.id === id ? { ...item, isPremium: !currentPremium } : item))
    );
  };

  const deleteInCatalog = (id: string) => {
    setCatalogList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl p-6 text-white overflow-hidden">
      {/* Header Admin Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500 animate-spin-slow" />
            TCN Stream Admin Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEnglish
              ? "Control system ingest nodes, content libraries, user subscriptions, and check live system statistics."
              : "Dhibiti upandishaji wa video, maktaba ya filamu, vifurushi vya wateja na takwimu za mapato ya TCN."}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "upload" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Ingest (Upload)
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "catalog" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            {isEnglish ? "Catalog" : "Maktaba"}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "users" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {isEnglish ? "Users" : "Watumiaji"}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-1.5 px-4 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-orange-500 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {isEnglish ? "Analytics" : "Mwenendo"}
          </button>
        </div>
      </div>

      {/* ALERT MESSAGE PANEL */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${
            alertMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {alertMsg.type === "success" ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-xs font-medium">{alertMsg.text}</span>
        </div>
      )}

      {/* TAB CONTENT: UPLOAD/INGEST */}
      {activeTab === "upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* File drag selector column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-1">
              <FileVideo className="w-4 h-4 text-orange-400" />
              1. {isEnglish ? "Select Video File / Folder" : "Chagua Video ya Kupandisha"}
            </h3>

            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[220px] transition-all relative overflow-hidden ${
                dragActive
                  ? "border-orange-500 bg-orange-500/10 scale-98"
                  : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
              }`}
            >
              <input
                type="file"
                multiple
                id="admin-file-picker"
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
              />
              <input
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                id="admin-folder-picker"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="p-4 bg-slate-900/80 rounded-full text-orange-400 mb-3 border border-slate-800 shadow-md">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>

              <p className="text-xs text-white font-semibold">
                {isEnglish ? "Drag & Drop video files / folders" : "Buruta video au folda hapa"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {isEnglish ? "Supports MP4, MKV, AVI, MOV up to 50GB" : "Inakubali MP4, MKV, AVI hadi GB 50"}
              </p>

              {/* Action Picker Buttons */}
              <div className="flex gap-2.5 mt-4 z-10">
                <label
                  htmlFor="admin-file-picker"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/60 py-1.5 px-3 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                >
                  <FileVideo className="w-3 h-3 text-emerald-400" />
                  {isEnglish ? "Choose File" : "Chagua Faili"}
                </label>
                <label
                  htmlFor="admin-folder-picker"
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700/60 py-1.5 px-3 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                >
                  <FolderOpen className="w-3 h-3 text-sky-400" />
                  {isEnglish ? "Upload Folder" : "Pakia Folda Nzima"}
                </label>
              </div>
            </div>

            {/* List of uploaded files awaiting action */}
            {uploadedFiles.length > 0 && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 max-h-[160px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isEnglish ? "Queued Files" : "Faili zilizochaguliwa"} ({uploadedFiles.length})
                  </span>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-[10px] text-red-400 hover:underline cursor-pointer"
                  >
                    {isEnglish ? "Clear All" : "Futa Zote"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span className="truncate max-w-[180px]">{f.name}</span>
                      <span className="text-[10px] text-slate-500">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form and metadata input column */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-emerald-400" />
              2. {isEnglish ? "Enter Video Metadata & Qualities" : "Weka Taarifa na Ubora wa Video"}
            </h3>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Media Title" : "Jina la Filamu / Kipindi"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={isEnglish ? "e.g., Siri ya Familia" : "Mf. Kiumbe cha Usiku"}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Streaming Category" : "Kundi (Category)"}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Movie">{isEnglish ? "Movie" : "Filamu"}</option>
                    <option value="TV Series">{isEnglish ? "TV Series" : "Tamthilia"}</option>
                    <option value="Live TV">Live TV</option>
                    <option value="Kids">{isEnglish ? "Kids Section" : "Watoto"}</option>
                    <option value="Sports">{isEnglish ? "Sports" : "Michezo"}</option>
                    <option value="News">{isEnglish ? "News" : "Habari"}</option>
                    <option value="Radio">Radio Station</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Anime">Anime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isEnglish ? "Short Synopsis" : "Maelezo Mafupi (Description)"}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={
                    isEnglish
                      ? "A thrilling Swahili premium drama showing local values..."
                      : "Maelezo ya kusisimua kuhusu filamu hii ili watazamaji wapate hamu..."
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Genres (separated by comma)" : "Aina (Genres - Tenganisha kwa mkato)"}
                  </label>
                  <input
                    type="text"
                    value={genres}
                    onChange={e => setGenres(e.target.value)}
                    placeholder="Drama, Action, Thriller, Romance"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Release Year" : "Mwaka wa Kutoka"}
                  </label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={e => setReleaseYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Flags Checkboxes */}
              <div className="flex flex-wrap gap-5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="accent-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-amber-400 block">PREMIUM ONLY</span>
                    <span className="text-[10px] text-slate-400">{isEnglish ? "Lock behind VIP plan" : "Weka kwa wateja waliojisajili tu"}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBongo}
                    onChange={e => setIsBongo(e.target.checked)}
                    className="accent-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-sky-400 block">BONGO FILM</span>
                    <span className="text-[10px] text-slate-400">{isEnglish ? "Flag as Local Bongo movie" : "Weka alama ya filamu ya kibongo"}</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSwahili}
                    onChange={e => setIsSwahili(e.target.checked)}
                    className="accent-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-400 block">SWAHILI LANGUAGE</span>
                    <span className="text-[10px] text-slate-400">{isEnglish ? "Has original or dubbed Swahili audio" : "Ina sauti au dubu ya Kiswahili"}</span>
                  </div>
                </label>
              </div>

              {/* Ingest action button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm ${
                  isProcessing ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center w-full py-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                      <span className="font-bold text-slate-950">{processingPercent}% - {isEnglish ? "Processing..." : "Inachakata..."}</span>
                    </div>
                    <span className="text-[10px] text-slate-900 font-medium font-mono">{processingStep}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-950" />
                    <span>{isEnglish ? "START DIRECT CLOUD TRANSCODING" : "ANZA KUPANDISHA NA KUENCODE FILAMU"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATALOG LIST */}
      {activeTab === "catalog" && (
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {isEnglish ? "System Live Catalog" : "Maktaba ya Mfumo Sasa"} ({catalogList.length} items)
            </span>
            <button
              onClick={fetchCatalog}
              className="text-[11px] text-orange-400 border border-orange-500/30 rounded py-1 px-3 bg-orange-500/5 hover:bg-orange-500/10 cursor-pointer"
            >
              {isEnglish ? "Refresh Catalog" : "Sasisha"}
            </button>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-2">{isEnglish ? "Cover" : "Picha"}</th>
                <th className="py-3 px-2">{isEnglish ? "Title" : "Jina"}</th>
                <th className="py-3 px-2">{isEnglish ? "Category" : "Kundi"}</th>
                <th className="py-3 px-2">{isEnglish ? "Year" : "Mwaka"}</th>
                <th className="py-3 px-2">{isEnglish ? "Rating" : "Nyota"}</th>
                <th className="py-3 px-2">{isEnglish ? "DRM Premium" : "Malipo"}</th>
                <th className="py-3 px-2 text-right">{isEnglish ? "Action" : "Kitendo"}</th>
              </tr>
            </thead>
            <tbody>
              {catalogList.map(item => (
                <tr key={item.id} className="border-b border-slate-850 hover:bg-slate-950/40 transition-colors">
                  <td className="py-2.5 px-2">
                    <img src={item.thumbnail} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-800 shadow-md" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="font-bold text-white text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono max-w-[150px] truncate">{item.id}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="bg-slate-800/80 text-slate-300 py-0.5 px-1.5 rounded text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">{item.releaseYear}</td>
                  <td className="py-2.5 px-2 font-bold text-orange-400 font-mono">★ {item.rating}</td>
                  <td className="py-2.5 px-2">
                    <button
                      onClick={() => togglePremiumInCatalog(item.id, item.isPremium)}
                      className={`flex items-center gap-1 py-1 px-2 rounded-full cursor-pointer transition-all text-[10px] font-bold ${
                        item.isPremium
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {item.isPremium ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>PREMIUM VIP</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-500" />
                          <span>FREE TO PLAY</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => deleteInCatalog(item.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">{isEnglish ? "Active TCN Subscribers" : "Wateja waliojisajili leo"}</span>
                <span className="text-xl font-bold text-white">4,812 active members</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">{isEnglish ? "Simultaneous Streams" : "Wanaotazama sasa hivi"}</span>
                <span className="text-xl font-bold text-white">1,249 active channels</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Subscription Tier</th>
                  <th className="py-3 px-2">Method</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Expiry</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-850">
                  <td className="py-2.5 px-2 font-bold text-white">Anjelina Mitto</td>
                  <td className="py-2.5 px-2 font-medium text-amber-400">Yearly VIP Family</td>
                  <td className="py-2.5 px-2 font-mono text-emerald-400">M-Pesa</td>
                  <td className="py-2.5 px-2">
                    <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">Active</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">July 14, 2027</td>
                </tr>
                <tr className="border-b border-slate-850">
                  <td className="py-2.5 px-2 font-bold text-white">Haji Athumani</td>
                  <td className="py-2.5 px-2 font-medium text-slate-300">Monthly Basic</td>
                  <td className="py-2.5 px-2 font-mono text-sky-400">Airtel Money</td>
                  <td className="py-2.5 px-2">
                    <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">Active</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">August 12, 2026</td>
                </tr>
                <tr className="border-b border-slate-850">
                  <td className="py-2.5 px-2 font-bold text-white">Kelvin Lema</td>
                  <td className="py-2.5 px-2 font-medium text-slate-400">Free Trial</td>
                  <td className="py-2.5 px-2 font-mono text-slate-400">Mastercard</td>
                  <td className="py-2.5 px-2">
                    <span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">Expiring soon</span>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-slate-300">July 20, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALYTICS & STATS */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Monthly Revenue (TZS)</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">TZS 18,450,000</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                <span className="text-emerald-500">↑ 18.2%</span> from last month
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Streaming Hours</span>
              <span className="text-2xl font-black text-sky-400 font-mono">142,500 hrs</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                <span className="text-sky-500">↑ 8.4%</span> server load stable
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Server Storage Nodes</span>
              <span className="text-2xl font-black text-orange-400 font-mono">8.4 TB / 20 TB</span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 animate-pulse">
                <span className="text-orange-500">● CDN Node Online</span> Dar es Salaam Primary
              </span>
            </div>
          </div>

          {/* Statistical Custom Visual Chart - Highly polished custom SVG representation of data streaming traffic */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-850">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-500" />
              Live Bandwidth & Traffic Consumption (Simulated Real-time CDN monitoring)
            </h4>

            {/* Custom Interactive SVG Graph */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="600" y2="75" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Main Graph Path */}
                <path
                  d="M0 130 Q 50 110, 100 80 T 200 100 T 300 40 T 400 60 T 500 20 T 600 45 L 600 150 L 0 150 Z"
                  fill="url(#chart-grad)"
                />
                <path
                  d="M0 130 Q 50 110, 100 80 T 200 100 T 300 40 T 400 60 T 500 20 T 600 45"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                />

                {/* Scatter highlights */}
                <circle cx="300" cy="40" r="4" fill="#10b981" className="animate-ping" />
                <circle cx="300" cy="40" r="4" fill="#10b981" />
                <circle cx="500" cy="20" r="4" fill="#0284c7" className="animate-ping" />
                <circle cx="500" cy="20" r="4" fill="#0284c7" />
              </svg>

              {/* Chart labels */}
              <div className="absolute top-1 left-2 bg-slate-900/90 text-[9px] font-mono font-bold text-sky-400 border border-slate-800 rounded py-0.5 px-1.5 shadow">
                Peak Traffic: 4.8 Gbps
              </div>
              <div className="absolute top-1 right-2 bg-slate-900/90 text-[9px] font-mono font-bold text-emerald-400 border border-slate-800 rounded py-0.5 px-1.5 shadow">
                CDN Hits: 99.4%
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2.5">
              <span>08:00 (Dar)</span>
              <span>12:00 (Mwanza)</span>
              <span>16:00 (Dodoma)</span>
              <span>20:00 (Arusha)</span>
              <span>24:00 (Zanzibar)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
