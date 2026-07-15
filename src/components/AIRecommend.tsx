/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  Compass,
  Film,
  Zap,
  Globe,
  Smile,
  AlertCircle,
  User
} from "lucide-react";

interface AIRecommendProps {
  isEnglish: boolean;
  currentLanguage: "Swahili" | "English";
}

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
}

interface MovieRecommendation {
  title: string;
  description: string;
  genres: string[];
  matchScore: string;
}

export const AIRecommend: React.FC<AIRecommendProps> = ({ isEnglish, currentLanguage }) => {
  const [activeMode, setActiveMode] = useState<"chat" | "recommend">("recommend");

  // Chatbot Mode states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "wel-1",
      sender: "bot",
      content: currentLanguage === "Swahili"
        ? "Habari! Mimi ni TCN AI Stream Assistant. Naweza kukusaidia kupata Bongo Movies kali, Live TV, michezo au kutoa maelezo ya subscription. Niulize chochote!"
        : "Hello! I am your TCN AI Assistant. I can help you find blockbusters, Bongo movies, Live TV schedule, or explain subscription models. Ask me anything!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recommender Engine Mode states
  const [queryPrompt, setQueryPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [engineLoading, setEngineLoading] = useState(false);

  useEffect(() => {
    // Scroll chats to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: chatInput
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userPreferredLanguage: currentLanguage
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          content: data.reply || "Pole, naona mtandao una shida kidogo!"
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          content: isEnglish
            ? "Network connection issue. Please retry soon!"
            : "Kuna shida ya mtandao. Tafadhali jaribu tena sasa hivi!"
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryPrompt.trim() || engineLoading) return;

    setEngineLoading(true);
    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryPrompt,
          userPreferredLanguage: currentLanguage
        })
      });

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setAiExplanation(data.aiExplanation || "");
    } catch {
      alert("Error reaching recommendation engine.");
    } finally {
      setEngineLoading(false);
    }
  };

  const handleQuickPrompt = (p: string) => {
    setQueryPrompt(p);
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-white shadow-2xl flex flex-col font-sans">
      {/* Tab select mode headers */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="text-orange-400 w-5 h-5 animate-pulse" />
            {isEnglish ? "TCN Smart AI recommendations" : "Akili Mnemba - TCN Smart AI"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEnglish
              ? "Get dynamic movie suggestions or converse directly with our automated AI assistant."
              : "Pata filamu zinazokufaa au zungumza na roboti wetu wa AI kupata muongozo."}
          </p>
        </div>

        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveMode("recommend")}
            className={`py-1.5 px-3.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeMode === "recommend" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            {isEnglish ? "Smart Engine" : "Mtafuta Filamu"}
          </button>
          <button
            onClick={() => setActiveMode("chat")}
            className={`py-1.5 px-3.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeMode === "chat" ? "bg-orange-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            {isEnglish ? "Interactive AI Assistant" : "Zungumza na AI"}
          </button>
        </div>
      </div>

      {/* MODE 1: SMART MOVIE RECOMMENDER ENGINE FORM */}
      {activeMode === "recommend" && (
        <div className="flex flex-col gap-6">
          {/* Engine Input form */}
          <form onSubmit={handleGetRecommendations} className="flex flex-col gap-3.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEnglish
                ? "Describe the perfect movie mood, theme, or genres you want to stream today:"
                : "Eleza kwa lugha ya kawaida aina ya filamu, mada, au mazingira unayotaka kuangalia leo:"}
            </label>

            <div className="relative">
              <input
                type="text"
                required
                value={queryPrompt}
                onChange={e => setQueryPrompt(e.target.value)}
                placeholder={
                  currentLanguage === "Swahili"
                    ? "Mf. Nataka filamu fupi ya kusisimua ya mapenzi iliyoigizwa Dar es Salaam yenye usaliti"
                    : "e.g., A high suspense thriller about safari guides chasing diamond smugglers"
                }
                className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-xl p-3.5 pr-12 text-xs text-white focus:outline-none placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={engineLoading}
                className="absolute right-2 top-1.5 p-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                {engineLoading ? (
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <Sparkles className="w-4.5 h-4.5 text-slate-950" />
                )}
              </button>
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {isEnglish ? "Suggestions:" : "Mifano ya haraka:"}
              </span>
              {[
                currentLanguage === "Swahili" ? "Soka la kibongo na matokeo ya NBC" : "Live Bongo football match NBC",
                currentLanguage === "Swahili" ? "Filamu kali ya mapenzi na usaliti Dar" : "Blockbuster Bongo drama love",
                currentLanguage === "Swahili" ? "Katuni ya wanyama wa Serengeti kwa watoto" : "Serengeti animal cartoon kids",
                currentLanguage === "Swahili" ? "Swahili dub ya filamu ya action" : "Hollywood action movie Swahili dub"
              ].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleQuickPrompt(p)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded py-1 px-2.5 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </form>

          {/* Engine outputs render */}
          {engineLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-orange-500 border-t-transparent animate-spin"></div>
              <p className="text-xs text-orange-400 font-medium animate-pulse">
                {currentLanguage === "Swahili"
                  ? "TCN AI inasoma maelfu ya filamu na kukuandalia mapendekezo bora..."
                  : "TCN AI is parsing thousands of catalogs to curate the optimal recommendations..."}
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex gap-2.5 items-start">
                <Bot className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">TCN AI Analyzer:</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{aiExplanation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <span className="bg-orange-500/10 text-orange-400 font-extrabold text-[10px] py-0.5 px-2 rounded-full border border-orange-500/20">
                          {rec.matchScore} MATCH
                        </span>
                        <Film className="w-4 h-4 text-slate-500" />
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-white mb-2">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-4">{rec.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {rec.genres.map(g => (
                        <span key={g} className="bg-white/10 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center">
              <Compass className="w-10 h-10 text-slate-600 mb-2.5" />
              <p className="text-xs text-slate-400">
                {isEnglish
                  ? "Describe your desired movie above to test our live Gemini-powered recommendation system!"
                  : "Andika maelezo ya filamu hapo juu ili uone maajabu ya mapendekezo ya Akili Mnemba (Gemini) yetu!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: INTERACTIVE CHATBOT MESSENGER */}
      {activeMode === "chat" && (
        <div className="flex flex-col h-[400px]">
          {/* Chat scrolling viewport */}
          <div className="flex-1 overflow-y-auto p-4 bg-black/40 border border-white/5 rounded-xl mb-4 flex flex-col gap-4 scrollbar-thin">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  m.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                {/* Avatar indicator */}
                <div
                  className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shadow flex-shrink-0 ${
                    m.sender === "user" ? "bg-orange-500 text-slate-950" : "bg-white/10 text-orange-400 border border-white/10"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble card */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-orange-500 text-slate-950 rounded-tr-none font-medium"
                      : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="self-start flex gap-2.5 max-w-[85%] items-center">
                <div className="w-7.5 h-7.5 rounded-full bg-white/10 text-orange-400 border border-white/10 flex items-center justify-center shadow">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/5 text-slate-400 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-medium italic animate-pulse">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat typing form input */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              required
              value={chatInput}
              disabled={chatLoading}
              onChange={e => setChatInput(e.target.value)}
              placeholder={
                currentLanguage === "Swahili"
                  ? "Uliza chochote kuhusu soka, tamthilia au bei za vifurushi..."
                  : "Ask anything about soccer, plans, or drama movies..."
              }
              className="flex-1 bg-black/40 border border-white/10 focus:border-orange-500 rounded-xl p-3 text-xs text-white focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
