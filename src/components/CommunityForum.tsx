/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Eye,
  Heart,
  Plus,
  Send,
  User,
  Tags,
  Compass,
  ArrowLeft,
  MessageCircle,
  Share2
} from "lucide-react";
import { ForumTopic, ForumReply } from "../types";

interface CommunityForumProps {
  isEnglish: boolean;
  currentUsername: string;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({ isEnglish, currentUsername }) => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);

  // Post forms
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState<"General" | "Bongo Movies" | "Hollywood & Bollywood" | "Korean Drama" | "Sports & News" | "Kids & Anime">("General");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicTags, setNewTopicTags] = useState("");

  const [newReplyContent, setNewReplyContent] = useState("");

  // Filter Category
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/forums/topics");
      const data = await res.json();
      setTopics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReplies = async (topicId: string) => {
    try {
      const res = await fetch(`/api/forums/replies/${topicId}`);
      const data = await res.json();
      setReplies(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTopicClick = (topic: ForumTopic) => {
    setActiveTopic(topic);
    fetchReplies(topic.id);
  };

  const handleCreateTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicContent) return;

    try {
      const res = await fetch("/api/forums/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle,
          category: newTopicCategory,
          authorName: currentUsername || "Anonymous Fan",
          content: newTopicContent,
          tags: newTopicTags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setIsCreatingTopic(false);
        setNewTopicTitle("");
        setNewTopicContent("");
        setNewTopicTags("");
        fetchTopics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent || !activeTopic) return;

    try {
      const res = await fetch("/api/forums/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: activeTopic.id,
          authorName: currentUsername || "Anonymous Fan",
          content: newReplyContent
        })
      });

      if (res.ok) {
        setNewReplyContent("");
        // Reload replies
        fetchReplies(activeTopic.id);
        // Refresh topics to update counts
        fetchTopics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTopics = selectedCategory === "All"
    ? topics
    : topics.filter(t => t.category === selectedCategory);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden text-white font-sans">
      {/* Forum Header Banner */}
      <div className="bg-gradient-to-r from-black/40 via-white/5 to-black/40 p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            {isEnglish ? "TCN Social Community Forums" : "Mijadala ya Kijamii - TCN Forum"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEnglish
              ? "Join discussions, review newest releases, debate football matches, and chat with local streaming fans."
              : "Jiunge na mashabiki wengine kujadili filamu za bongo, soka na tamthilia kali za msimu hapa TCN."}
          </p>
        </div>

        {!activeTopic && !isCreatingTopic && (
          <button
            onClick={() => setIsCreatingTopic(true)}
            className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            {isEnglish ? "New Topic" : "Anzisha Mjadala"}
          </button>
        )}
      </div>

      <div className="p-6">
        {/* VIEW 1: ACTIVE SINGLE TOPIC VIEW (WITH THREAD REPLIES) */}
        {activeTopic ? (
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setActiveTopic(null)}
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-500 font-bold mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? "Back to All Topics" : "Rudi kwenye Mijadala yote"}
            </button>

            {/* Original Topic Post Card */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-3.5 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <img src={activeTopic.authorAvatar} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                  <div>
                    <span className="text-xs font-bold text-white block">{activeTopic.authorName}</span>
                    <span className="text-[10px] text-slate-500">{activeTopic.timestamp}</span>
                  </div>
                </div>
                <span className="bg-orange-500/10 text-orange-400 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase border border-orange-500/20">
                  {activeTopic.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-3 tracking-wide">{activeTopic.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{activeTopic.content}</p>

              {activeTopic.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                  <Tags className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  {activeTopic.tags.map(tag => (
                    <span key={tag} className="bg-white/5 text-slate-400 text-[9px] font-semibold py-0.5 px-2 rounded-full border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Thread Replies List */}
            <div className="flex flex-col gap-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                {isEnglish ? "Replies" : "Majibu ya Wadau"} ({replies.length})
              </h4>

              {replies.length === 0 ? (
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-center text-xs text-slate-500">
                  {isEnglish ? "No replies yet. Be the first to join the debate!" : "Hakuna majibu bado. Changia maoni yako hapa chini!"}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {replies.map(reply => (
                    <div key={reply.id} className="bg-white/5 p-4 rounded-xl border border-white/5 ml-4 md:ml-8 animate-fade-in">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <img src={reply.authorAvatar} alt="" className="w-6.5 h-6.5 rounded-full border border-white/10" />
                          <div>
                            <span className="text-xs font-semibold text-white block">{reply.authorName}</span>
                            <span className="text-[9px] text-slate-500">{reply.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Reply Input Form */}
            <form onSubmit={handleCreateReplySubmit} className="bg-white/5 p-4 rounded-xl border border-white/5 mt-2 flex flex-col gap-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isEnglish ? "Post Your Reply" : "Andika jibu lako katika mjadala"}
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={2}
                  value={newReplyContent}
                  onChange={e => setNewReplyContent(e.target.value)}
                  placeholder={
                    isEnglish
                      ? "Write a respectful, insightful reply..."
                      : "Changia hoja yako ya maana hapa kwa lugha safi..."
                  }
                  className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-lg p-3 text-xs text-white focus:outline-none pr-12 resize-none"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 bottom-3.5 p-1.5 bg-orange-500 hover:bg-orange-600 rounded-lg text-slate-950 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : isCreatingTopic ? (
          /* VIEW 2: CREATE NEW TOPIC FORM */
          <div>
            <button
              onClick={() => setIsCreatingTopic(false)}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-500 font-bold mb-5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEnglish ? "Cancel" : "Ghairi na Rudi Nyuma"}
            </button>

            <form onSubmit={handleCreateTopicSubmit} className="bg-white/5 p-6 rounded-xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                {isEnglish ? "Start a New Discussion Thread" : "Anzisha Mada Mpya ya Mjadala"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Thread Title" : "Jina la Mada (Topic Title)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopicTitle}
                    onChange={e => setNewTopicTitle(e.target.value)}
                    placeholder={isEnglish ? "e.g., Best Bongo movie of 2026?" : "Mf. Filamu gani ya bongo inaongoza mwaka huu?"}
                    className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isEnglish ? "Forum Category" : "Kundi la Mjadala"}
                  </label>
                  <select
                    value={newTopicCategory}
                    onChange={e => setNewTopicCategory(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="General">General Debate</option>
                    <option value="Bongo Movies">Bongo Movies</option>
                    <option value="Hollywood & Bollywood">Hollywood & Bollywood</option>
                    <option value="Korean Drama">Korean Drama</option>
                    <option value="Sports & News">Sports & News</option>
                    <option value="Kids & Anime">Kids & Anime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isEnglish ? "Detailed Content" : "Ufafanuzi wa Hoja Yako"} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  placeholder={
                    isEnglish
                      ? "Write the full context, background information or question here for community debate..."
                      : "Andika maelezo ya kina ya mada yako iti kurahisisha mijadala..."
                  }
                  className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-lg p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isEnglish ? "Tags (comma separated)" : "Lebo (Tenganisha kwa koma)"}
                </label>
                <input
                  type="text"
                  value={newTopicTags}
                  onChange={e => setNewTopicTags(e.target.value)}
                  placeholder="bongo, soka, maoni, nbc"
                  className="w-full bg-black/40 border border-white/10 focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer text-center mt-2 self-end"
              >
                {isEnglish ? "Publish Discussion" : "Rusha Mjadala Live"}
              </button>
            </form>
          </div>
        ) : (
          /* VIEW 3: DISCUSSIONS TOPIC LIST */
          <div className="flex flex-col gap-6">
            {/* Horizontal Categories Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {["All", "General", "Bongo Movies", "Hollywood & Bollywood", "Korean Drama", "Sports & News", "Kids & Anime"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent"
                      : "bg-black/60 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {cat === "All" && (isEnglish ? "All Discussions" : "Mijadala Yote")}
                  {cat !== "All" && cat}
                </button>
              ))}
            </div>

            {/* List Cards */}
            <div className="flex flex-col gap-3">
              {filteredTopics.length === 0 ? (
                <div className="bg-white/5 p-12 rounded-xl text-center border border-white/5">
                  <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium text-xs">
                    {isEnglish ? "No discussions match this category yet." : "Hakuna mijadala kwenye kundi hili kwa sasa."}
                  </p>
                </div>
              ) : (
                filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 transition-all hover:scale-[1.01] hover:border-white/20 cursor-pointer flex justify-between items-center gap-4 shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-black/40 text-slate-400 text-[9px] font-bold py-0.5 px-2 rounded-full border border-white/10">
                          {topic.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{topic.timestamp}</span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-white truncate pr-2 tracking-wide">{topic.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <img src={topic.authorAvatar} alt="" className="w-4 h-4 rounded-full" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {isEnglish ? "Started by" : "Imenzishwa na"} <span className="text-slate-300 font-semibold">{topic.authorName}</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats details */}
                    <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                        {topic.repliesCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        {topic.views}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
