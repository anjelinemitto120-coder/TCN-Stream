/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  Download,
  Heart,
  Plus,
  Check,
  ChevronLeft,
  ChevronsRight,
  Globe,
  Gauge,
  Share2,
  Bookmark,
  Smartphone
} from "lucide-react";
import { ContentItem } from "../types";

interface LivePlayerProps {
  movie: ContentItem;
  onClose: () => void;
  isPremiumUser: boolean;
  onTriggerSubscription: () => void;
}

export const LivePlayer: React.FC<LivePlayerProps> = ({
  movie,
  onClose,
  isPremiumUser,
  onTriggerSubscription
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeQuality, setActiveQuality] = useState<string>("1080p");
  const [activeSub, setActiveSub] = useState<string>("Off");
  const [activeAudio, setActiveAudio] = useState<string>("Kiswahili");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDevice, setCastDevice] = useState<string | null>(null);
  
  // Custom smart features
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [isAutoNext, setIsAutoNext] = useState(true);
  const [isPip, setIsPip] = useState(false);
  const [isOfflineDownloaded, setIsOfflineDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Auto-next simulation alert
  const [showNextAlert, setShowNextAlert] = useState(false);

  // Setup mock local state and check premium
  useEffect(() => {
    // Watchlist persistence
    const savedWatchlist = JSON.parse(localStorage.getItem("tcn_watchlist") || "[]");
    setInWatchlist(savedWatchlist.includes(movie.id));

    // Favorites persistence
    const savedFavorites = JSON.parse(localStorage.getItem("tcn_favorites") || "[]");
    setIsFavorite(savedFavorites.includes(movie.id));

    // Check offline downloads list
    const savedDownloads = JSON.parse(localStorage.getItem("tcn_downloads") || "[]");
    setIsOfflineDownloaded(savedDownloads.includes(movie.id));
  }, [movie.id]);

  // Handle controls visibility timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Monitor playback for "Skip Intro" simulation
  useEffect(() => {
    if (currentTime > 5 && currentTime < 20 && !movie.category.includes("Live") && !movie.category.includes("Radio")) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    // Auto next triggers when near the end (simulated at 98% of duration)
    if (duration > 0 && currentTime >= duration - 5) {
      if (isAutoNext && !showNextAlert) {
        setShowNextAlert(true);
      }
    }
  }, [currentTime, duration]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const toggleWatchlist = () => {
    const savedWatchlist = JSON.parse(localStorage.getItem("tcn_watchlist") || "[]");
    let updated;
    if (inWatchlist) {
      updated = savedWatchlist.filter((id: string) => id !== movie.id);
    } else {
      updated = [...savedWatchlist, movie.id];
    }
    localStorage.setItem("tcn_watchlist", JSON.stringify(updated));
    setInWatchlist(!inWatchlist);
  };

  const toggleFavorite = () => {
    const savedFavorites = JSON.parse(localStorage.getItem("tcn_favorites") || "[]");
    let updated;
    if (isFavorite) {
      updated = savedFavorites.filter((id: string) => id !== movie.id);
    } else {
      updated = [...savedFavorites, movie.id];
    }
    localStorage.setItem("tcn_favorites", JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  const handleDownload = () => {
    if (!isPremiumUser) {
      onTriggerSubscription();
      return;
    }

    if (isOfflineDownloaded) {
      // Remove download
      const savedDownloads = JSON.parse(localStorage.getItem("tcn_downloads") || "[]");
      const updated = savedDownloads.filter((id: string) => id !== movie.id);
      localStorage.setItem("tcn_downloads", JSON.stringify(updated));
      setIsOfflineDownloaded(false);
      return;
    }

    // Start download animation
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          const savedDownloads = JSON.parse(localStorage.getItem("tcn_downloads") || "[]");
          localStorage.setItem("tcn_downloads", JSON.stringify([...savedDownloads, movie.id]));
          setIsOfflineDownloaded(true);
          return null;
        }
        return prev + 10;
      });
    }, 400);
  };

  const handleCast = () => {
    if (isCasting) {
      setIsCasting(false);
      setCastDevice(null);
    } else {
      setIsCasting(true);
      setCastDevice("Smart TV (Living Room)");
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 85; // Skip first 85 seconds
      setCurrentTime(85);
      setShowSkipIntro(false);
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else {
        await videoRef.current.requestPictureInPicture();
        setIsPip(true);
      }
    } catch (e) {
      // Fallback virtual PIP simulation
      setIsPip(!isPip);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    const pad = (num: number) => String(num).padStart(2, "0");
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const updateSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Dynamic Background branding bar */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-sky-500 via-emerald-500 to-orange-500 z-50"></div>

      {/* Top Header Back Bar */}
      <div
        className={`absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-6 flex justify-between items-center z-40 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 py-2 px-4 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-sm">Ondoka (Exit)</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide drop-shadow-md">
            {movie.title}
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-tight flex items-center justify-center gap-1.5 mt-0.5">
            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {movie.category}
            </span>
            <span>•</span>
            <span>{movie.duration}</span>
            <span>•</span>
            <span className="text-orange-400">{movie.genres.join(", ")}</span>
          </p>
        </div>

        {/* Media Action Shortcuts */}
        <div className="flex items-center gap-3">
          {/* Casting button */}
          <button
            onClick={handleCast}
            className={`p-2.5 rounded-full transition-all cursor-pointer relative group ${
              isCasting
                ? "bg-sky-500 text-white animate-pulse"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
            }`}
          >
            <Tv className="w-5 h-5" />
            <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
              {isCasting ? `Casting to ${castDevice}` : "Rusha kwenye TV (Cast to TV)"}
            </span>
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className={`p-2.5 rounded-full transition-all cursor-pointer relative group ${
              isOfflineDownloaded
                ? "bg-emerald-500 text-white"
                : downloadProgress !== null
                ? "bg-orange-500 text-white"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
            }`}
          >
            {downloadProgress !== null ? (
              <span className="text-xs font-bold font-mono">{downloadProgress}%</span>
            ) : isOfflineDownloaded ? (
              <Check className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span className="absolute right-0 top-12 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
              {isOfflineDownloaded
                ? "Pakua tayari (Downloaded)"
                : downloadProgress !== null
                ? "Inapakua..."
                : "Pakua kwa Offline (Premium Download)"}
            </span>
          </button>

          {/* Watchlist button */}
          <button
            onClick={toggleWatchlist}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              inWatchlist
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
            }`}
          >
            {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              isFavorite
                ? "bg-red-500/20 text-red-500 border border-red-500/50"
                : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
            }`}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Wrapper */}
      <div
        ref={containerRef}
        className="flex-1 w-full bg-slate-950 flex items-center justify-center relative cursor-none"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={movie.videoUrl}
          className={`w-full max-h-screen object-contain ${
            isPip ? "max-w-[400px] rounded-lg shadow-2xl border-2 border-orange-500/50 absolute bottom-6 right-6 z-50" : ""
          }`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          autoPlay
        />

        {/* Casting Active UI overlay */}
        {isCasting && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-4 text-center p-6 z-20 pointer-events-none">
            <div className="p-6 bg-sky-500/20 rounded-full animate-bounce">
              <Tv className="w-16 h-16 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Inarusha kwenye TV yako</h2>
            <p className="text-slate-400 max-w-sm text-sm">
              Inacheza kwenye <span className="text-sky-400 font-semibold">{castDevice}</span>. Tumia simu yako kudhibiti video.
            </p>
          </div>
        )}

        {/* Skip Intro Overlay Trigger */}
        {showSkipIntro && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkipIntro();
            }}
            className="absolute bottom-24 right-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg shadow-2xl border border-orange-400 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 z-30 animate-pulse"
          >
            <ChevronsRight className="w-5 h-5" />
            Ruka Utangulizi (Skip Intro)
          </button>
        )}

        {/* Subtitles Overlay Render */}
        {activeSub !== "Off" && isPlaying && (
          <div className="absolute bottom-28 inset-x-0 flex justify-center z-30 pointer-events-none px-6 text-center">
            <span className="bg-black/80 text-amber-300 font-semibold text-sm md:text-lg px-4 py-1.5 rounded-md shadow-lg border border-slate-800">
              {activeSub === "Kiswahili" ? (
                <span>[TAFSIRI] Hii ndio siri kuu ya mchezo mzima, lazima tuwe makini!</span>
              ) : (
                <span>[SUBTITLE] This is the core secret of the game, we must be careful!</span>
              )}
            </span>
          </div>
        )}

        {/* Auto Next Alert Notification overlay */}
        {showNextAlert && (
          <div className="absolute top-24 right-8 bg-slate-900 border border-emerald-500/50 rounded-xl p-4 shadow-2xl w-80 text-white z-40 animate-fade-in flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Kipindi Kinachofuata</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNextAlert(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Sura ya pili ya {movie.title} inaanza baada ya sekunde chache...
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNextAlert(false);
                }}
                className="text-[10px] text-slate-400 bg-slate-800 hover:bg-slate-750 py-1.5 px-3 rounded"
              >
                Ghairi (Cancel)
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNextAlert(false);
                  alert("Kipindi cha pili kinafunguliwa sasa hivi!");
                }}
                className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-3 rounded"
              >
                Cheza Sasa (Play Now)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 pb-6 px-6 z-40 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seekbar Slider */}
        <div className="flex items-center gap-3 mb-4 group/seek">
          <span className="text-xs font-mono text-slate-300 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full accent-orange-500 bg-slate-700 h-1.5 rounded-full appearance-none cursor-pointer hover:h-2 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-300 w-12 text-left">
            {formatTime(duration)}
          </span>
        </div>

        {/* Actions Button Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play Pause Button */}
            <button
              onClick={togglePlay}
              className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full transition-transform hover:scale-110 active:scale-90 cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Volume control block */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-emerald-500 bg-slate-700 h-1 rounded-full appearance-none cursor-pointer group-hover/volume:w-24 transition-all"
              />
            </div>

            {/* Live indicator if appropriate */}
            {(movie.category.includes("Live") || movie.category.includes("Radio")) && (
              <span className="flex items-center gap-1.5 bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                MOJA KWA MOJA (LIVE)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* PiP button */}
            <button
              onClick={togglePip}
              className={`p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer relative group ${
                isPip ? "text-orange-400 bg-slate-800" : ""
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                Picha-ndani-Picha (PiP)
              </span>
            </button>

            {/* Custom overlay settings trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer ${
                  showSettings ? "bg-slate-800 text-orange-400 rotate-45" : ""
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Advanced Controls Dropdown Card */}
              {showSettings && (
                <div className="absolute bottom-12 right-0 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 w-64 z-50 flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-1">
                    Mipangilio ya Video
                  </h3>

                  {/* Quality Button Menu */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-orange-400" /> Quality:
                    </span>
                    <select
                      value={activeQuality}
                      onChange={(e) => setActiveQuality(e.target.value)}
                      className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
                    >
                      {movie.qualities.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Audio language menu */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Sauti (Audio):
                    </span>
                    <select
                      value={activeAudio}
                      onChange={(e) => {
                        setActiveAudio(e.target.value);
                        alert(`Lugha ya sauti imebadilishwa kuwa: ${e.target.value}`);
                      }}
                      className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
                    >
                      {movie.audioLanguages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subtitle language menu */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-sky-400" /> Maandishi (Sub):
                    </span>
                    <select
                      value={activeSub}
                      onChange={(e) => setActiveSub(e.target.value)}
                      className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
                    >
                      <option value="Off">Off</option>
                      {movie.subtitles.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Playback speed menu */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" /> Kasi (Speed):
                    </span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => updateSpeed(parseFloat(e.target.value))}
                      className="bg-slate-800 text-white text-xs py-1 px-2.5 rounded border border-slate-700 focus:outline-none focus:border-orange-500"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1.0}>1.0x (Kawaida)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2.0}>2.0x</option>
                    </select>
                  </div>

                  {/* AutoNext Episode Toggle */}
                  <div className="flex justify-between items-center py-1.5 border-t border-slate-850 mt-1">
                    <span className="text-xs font-medium text-slate-400">Cheza inayofuata yenyewe</span>
                    <button
                      onClick={() => setIsAutoNext(!isAutoNext)}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                        isAutoNext ? "bg-emerald-500" : "bg-slate-750"
                      }`}
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform duration-200 ${
                          isAutoNext ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Maximize Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
