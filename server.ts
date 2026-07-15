/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MY_")) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Memory database with realistic Swahili and International premium media catalog
let catalog = [
  {
    id: "m-bongo-1",
    title: "Dar es Salaam Usiku",
    description: "Kisa cha kusisimua cha mapenzi, usaliti na tamaa ya madaraka katikati ya jiji la Dar es Salaam. Vijana wawili wanapigania ndoto zao huku usiku ukifunua siri nzito.",
    category: "Movie",
    genres: ["Drama", "Romance", "Suspense"],
    languages: ["Kiswahili"],
    countries: ["Tanzania"],
    releaseYear: 2025,
    duration: "2h 05m",
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    qualities: ["Auto", "480p", "720p", "1080p"],
    audioLanguages: ["Kiswahili"],
    subtitles: ["English", "Kiswahili"],
    rating: 4.8,
    views: 125000,
    isTrending: true,
    isFeatured: true,
    isBongo: true,
    isSwahili: true,
    isPremium: false,
    cast: ["Single Mtambalike", "Wema Sepetu", "Ray Kigosi"],
    director: "Vincent Kigosi"
  },
  {
    id: "m-bongo-2",
    title: "Siri ya Mtungi",
    description: "Hadithi tamu inayohusu familia ya Cheche na changamoto za kimaisha za uswahilini, biashara ya picha, mapenzi na matumaini ya baadae.",
    category: "Movie",
    genres: ["Drama", "Family"],
    languages: ["Kiswahili"],
    countries: ["Tanzania"],
    releaseYear: 2024,
    duration: "1h 50m",
    thumbnail: "https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    qualities: ["Auto", "720p", "1080p"],
    audioLanguages: ["Kiswahili"],
    subtitles: ["English"],
    rating: 4.9,
    views: 89000,
    isTrending: true,
    isFeatured: false,
    isBongo: true,
    isSwahili: true,
    isPremium: false,
    cast: ["Godliver Gordian", "Nisha", "Hemed Suleiman"],
    director: "Jordan Riber"
  },
  {
    id: "m-dub-1",
    title: "The Avengers (Swahili Dub)",
    description: "Mashujaa wakubwa wa dunia wanaungana chini ya uongozi wa Nick Fury ili kumlinda binadamu dhidi ya tishio kubwa la Loki na jeshi lake la ajabu la Chitauri.",
    category: "Movie",
    genres: ["Action", "Sci-Fi", "Fantasy"],
    languages: ["Kiswahili", "English"],
    countries: ["United States"],
    releaseYear: 2023,
    duration: "2h 23m",
    thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    qualities: ["Auto", "480p", "720p", "1080p", "4K"],
    audioLanguages: ["Kiswahili", "English"],
    subtitles: ["Kiswahili"],
    rating: 4.7,
    views: 310000,
    isTrending: true,
    isFeatured: true,
    isBongo: false,
    isSwahili: true,
    isPremium: true,
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
    director: "Joss Whedon (Swahili Luku)"
  },
  {
    id: "tv-series-1",
    title: "Kapuni: Siri ya Nyumba",
    description: "Tamthilia inayofuatilia siri nzito za kijamii, ushindani mkali wa kibiashara, usaliti na mapenzi ya dhati kwenye nyumba kubwa za kifahari.",
    category: "TV Series",
    genres: ["Drama", "Romance"],
    languages: ["Kiswahili"],
    countries: ["Tanzania"],
    releaseYear: 2025,
    duration: "15 Episodes",
    thumbnail: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    qualities: ["Auto", "480p", "720p", "1080p"],
    audioLanguages: ["Kiswahili"],
    subtitles: ["English"],
    rating: 4.6,
    views: 180000,
    isTrending: false,
    isFeatured: false,
    isBongo: true,
    isSwahili: true,
    isPremium: true,
    cast: ["Gabby", "Riyama Ally", "Jb Salim"],
    director: "JB"
  },
  {
    id: "tv-live-1",
    title: "TCN Habari Live",
    description: "Kituo rasmi cha TCN Stream kinachorusha matangazo ya habari za ndani na nje ya Tanzania masaa 24, uchambuzi wa kina na mijadala ya kijamii.",
    category: "Live TV",
    genres: ["News", "Information"],
    languages: ["Kiswahili", "English"],
    countries: ["Tanzania"],
    releaseYear: 2026,
    duration: "Live Stream",
    thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    qualities: ["Auto", "480p", "720p", "1080p"],
    audioLanguages: ["Kiswahili"],
    subtitles: [],
    rating: 4.5,
    views: 45000,
    isTrending: false,
    isFeatured: true,
    isBongo: false,
    isSwahili: true,
    isPremium: false,
    cast: ["TCN Broadcasters"],
    director: "TCN Production"
  },
  {
    id: "tv-live-2",
    title: "Azam Sports HD Live",
    description: "Matangazo ya moja kwa moja ya Ligi Kuu ya NBC Tanzania, kombe la FA, na michezo mingine mbalimbali ya kitaifa na kimataifa.",
    category: "Live TV",
    genres: ["Sports"],
    languages: ["Kiswahili"],
    countries: ["Tanzania"],
    releaseYear: 2026,
    duration: "Live Stream",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    qualities: ["Auto", "720p", "1080p"],
    audioLanguages: ["Kiswahili"],
    subtitles: [],
    rating: 4.9,
    views: 520000,
    isTrending: true,
    isFeatured: true,
    isBongo: false,
    isSwahili: true,
    isPremium: true,
    cast: ["Azam Sports Presenters"],
    director: "Azam Media"
  },
  {
    id: "doc-1",
    title: "Mvuto wa Serengeti",
    description: "Filamu fupi ya utafiti inayochunguza mfumo wa maisha wa wanyama pori Serengeti wakati wa msafara mkubwa wa nyumbu uliotajwa kuwa maajabu ya dunia.",
    category: "Documentary",
    genres: ["Nature", "Adventure"],
    languages: ["English", "Kiswahili"],
    countries: ["Tanzania", "Kenya"],
    releaseYear: 2025,
    duration: "45m",
    thumbnail: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    qualities: ["Auto", "720p", "1080p", "4K"],
    audioLanguages: ["English", "Kiswahili"],
    subtitles: ["English", "Kiswahili"],
    rating: 4.9,
    views: 64000,
    isTrending: false,
    isFeatured: false,
    isBongo: false,
    isSwahili: true,
    isPremium: false,
    cast: ["David Attenborough (Simulated)"],
    director: "TCN Wild"
  },
  {
    id: "kids-1",
    title: "Simba wa Bongo",
    description: "Hadithi ya katuni ya mtoto wa simba aitwaye Jengo anayejifunza ushujaa, ulinzi wa mazingira, na urafiki katika mbuga za Ruaha.",
    category: "Kids",
    genres: ["Animation", "Family"],
    languages: ["Kiswahili", "English"],
    countries: ["Tanzania"],
    releaseYear: 2024,
    duration: "1h 15m",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    qualities: ["Auto", "480p", "720p"],
    audioLanguages: ["Kiswahili", "English"],
    subtitles: ["Kiswahili"],
    rating: 4.6,
    views: 93000,
    isTrending: false,
    isFeatured: false,
    isBongo: true,
    isSwahili: true,
    isPremium: false,
    cast: ["Swahili Voice Over Artists"],
    director: "Bongo Animation Studios"
  },
  {
    id: "radio-1",
    title: "Clouds FM",
    description: "Kituo cha burudani na habari cha Clouds FM Tanzania - Radio ya Watu. Sikiliza vipindi moto moto kama Power Breakfast na XXL popote ulipo.",
    category: "Radio",
    genres: ["Talk", "Music", "Entertainment"],
    languages: ["Kiswahili"],
    countries: ["Tanzania"],
    releaseYear: 2026,
    duration: "Radio Stream",
    thumbnail: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Used for audio background simulation
    qualities: ["Auto"],
    audioLanguages: ["Kiswahili"],
    subtitles: [],
    rating: 4.8,
    views: 110000,
    isTrending: true,
    isFeatured: false,
    isBongo: false,
    isSwahili: true,
    isPremium: false,
    cast: ["Clouds FM Crew"],
    director: "Clouds Media Group"
  },
  {
    id: "m-kor-1",
    title: "Descendants of the Sun (Kiswahili Luku)",
    description: "K-Drama maarufu duniani yenye kisa cha mahaba kati ya kapteni wa jeshi la kulinda amani na daktari mrembo wakipigania maisha vitani.",
    category: "TV Series",
    genres: ["Romance", "Action", "Drama"],
    languages: ["Kiswahili", "Korean"],
    countries: ["South Korea"],
    releaseYear: 2024,
    duration: "16 Episodes",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    qualities: ["Auto", "480p", "720p", "1080p"],
    audioLanguages: ["Kiswahili", "Korean"],
    subtitles: ["Kiswahili", "English"],
    rating: 4.9,
    views: 245000,
    isTrending: true,
    isFeatured: true,
    isBongo: false,
    isSwahili: true,
    isPremium: true,
    cast: ["Song Joong-ki", "Song Hye-kyo"],
    director: "Lee Eung-bok (Swahili Dub)"
  },
  {
    id: "anime-1",
    title: "Kiswahili Ninja: Samurai Ken",
    description: "Mapigano ya kukata na shoka ya kijana Samurai anayeapa kulinda kijiji chake dhidi ya majeshi ya giza ya Shogun mkatili.",
    category: "Anime",
    genres: ["Action", "Adventure", "Fantasy"],
    languages: ["Kiswahili", "Japanese"],
    countries: ["Japan"],
    releaseYear: 2025,
    duration: "24m",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    qualities: ["Auto", "480p", "720p", "1080p"],
    audioLanguages: ["Kiswahili", "Japanese"],
    subtitles: ["Kiswahili"],
    rating: 4.7,
    views: 85000,
    isTrending: false,
    isFeatured: false,
    isBongo: false,
    isSwahili: true,
    isPremium: false,
    cast: ["Swahili Voice Cast"],
    director: "Tokyo Dub Group"
  }
];

// Memory Store for comments
let comments = [
  {
    id: "c-1",
    contentId: "m-bongo-1",
    username: "Juma Chale",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
    content: "Duh, hii filamu ni kiboko! Wema Sepetu amecheza kwa hisia kali sana. Story inapiga hapo hapo uswahilini na mjini.",
    rating: 5,
    timestamp: "Masaa 2 yaliyopita",
    likes: 24
  },
  {
    id: "c-2",
    contentId: "m-bongo-1",
    username: "Amina Kassim",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
    content: "Graphics na sound viko vizuri kuliko filamu za zamani. Hongereni sana TCN kwa kuweka vitu vizuri hivi.",
    rating: 4,
    timestamp: "Siku 1 iliyopita",
    likes: 12
  },
  {
    id: "c-3",
    contentId: "m-dub-1",
    username: "Nixon Lema",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60",
    content: "Ule u-dubbing wa Kiswahili unachekesha na unasisimua sana! Safi kabisa, watoto nao wanaelewa vizuri sasa.",
    rating: 5,
    timestamp: "Siku 2 zilizopita",
    likes: 48
  }
];

// Memory Store for social forums
let forumTopics = [
  {
    id: "f-1",
    title: "Ubora wa Dubbing za Kiswahili (Swahili Luku) kwenye TCN Stream",
    category: "Bongo Movies",
    authorName: "Ally Shabani",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    content: "Jamani mmewahi kuona dubbing ya Avengers na Descendants of the Sun hapa TCN? Mimi naona iko juu sana kulinganisha na wasanii wa mitaani kama DJ Lolipop au DJ Rufufu. TCN wamefanya kazi ya kiprofeshonali sana. Nini maoni yenu?",
    timestamp: "Julai 14, 2026 - Masaa 4 yaliyopita",
    repliesCount: 3,
    views: 450,
    likes: 85,
    tags: ["Dubbing", "Tanzania", "Burudani"]
  },
  {
    id: "f-2",
    title: "NBC Premier League Live Leo - Mbeya City vs Yanga SC",
    category: "Sports & News",
    authorName: "Kelvin Mrema",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60",
    content: "Yanga anafunga goli ngapi leo? Naona matangazo kupitia Azam Sports HD hapa TCN Stream yako imara sana, hakuna buffering kabisa hata kwenye line yangu ya Airtel Money ya 3G.",
    timestamp: "Julai 13, 2026",
    repliesCount: 2,
    views: 920,
    likes: 130,
    tags: ["NBC", "Yanga", "Soka"]
  }
];

let forumReplies = [
  {
    id: "fr-1",
    topicId: "f-1",
    authorName: "Farida Juma",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60",
    content: "Kabisa Farida anakubaliana na wewe Ally. Tafsiri zimezingatia maadili na maneno ni mazuri kabisa kwa familia kusikiliza.",
    timestamp: "Masaa 3 yaliyopita",
    likes: 15
  },
  {
    id: "fr-2",
    topicId: "f-1",
    authorName: "Oscar Joseph",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60",
    content: "Mimi naipenda sauti ya yule msimulizi kwenye K-Drama ya Descendants. Ina mvuto mkubwa sana na inanifanya niangalie tamthilia nzima.",
    timestamp: "Masaa 2 yaliyopita",
    likes: 22
  },
  {
    id: "fr-3",
    topicId: "f-2",
    authorName: "Haji Mayanga",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60",
    content: "Sisi wanazi wa Simba SC tunaombea tu sare au wafungwe ili tupunguze gap haha! Lakini ukweli stream ya soka hapa iko vizuri mno.",
    timestamp: "Siku 1 iliyopita",
    likes: 42
  }
];

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Get Full Catalog
app.get("/api/catalog", (req, res) => {
  res.json(catalog);
});

// API: Upload Media simulated processing
app.post("/api/upload-media", (req, res) => {
  const { title, description, category, genres, releaseYear, isPremium, fileName, isBongo, isSwahili } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: "Title and Category are required." });
  }

  // Simulated metadata extraction and quality encoding
  const cleanFileName = fileName || `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.mp4`;
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const mockQualities = ["Auto", "480p", "720p", "1080p"];
  
  // Simulated thumbnail generator based on category
  let thumb = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  if (category === "Kids") {
    thumb = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60";
  } else if (category === "Live TV") {
    thumb = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60";
  } else if (category === "Sports") {
    thumb = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60";
  } else if (isBongo) {
    thumb = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60";
  }

  const newMedia = {
    id: `m-upload-${Date.now()}`,
    title,
    description: description || `Simulated high-quality video uploaded as ${cleanFileName}. Ready for streaming on TCN Stream.`,
    category,
    genres: genres || ["General"],
    languages: isSwahili ? ["Kiswahili"] : ["English"],
    countries: isBongo ? ["Tanzania"] : ["Global"],
    releaseYear: releaseYear ? parseInt(releaseYear) : 2026,
    duration: "2h 10m",
    thumbnail: thumb,
    banner: thumb,
    videoUrl,
    qualities: mockQualities as any[],
    audioLanguages: isSwahili ? ["Kiswahili"] : ["English"],
    subtitles: ["English", "Kiswahili"],
    rating: 5.0,
    views: 1,
    isTrending: false,
    isFeatured: false,
    isBongo: !!isBongo,
    isSwahili: !!isSwahili,
    isPremium: !!isPremium,
    cast: ["Uploaded User"],
    director: "Independent Creator"
  };

  catalog.unshift(newMedia);
  res.json({ success: true, item: newMedia });
});

// API: Comments for a movie
app.get("/api/comments/:contentId", (req, res) => {
  const filtered = comments.filter(c => c.contentId === req.params.contentId);
  res.json(filtered);
});

// API: Post Comment
app.post("/api/comments", (req, res) => {
  const { contentId, username, content, rating } = req.body;
  if (!contentId || !username || !content) {
    return res.status(400).json({ error: "Missing comment fields." });
  }

  const newComment = {
    id: `c-${Date.now()}`,
    contentId,
    username,
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
    content,
    rating: rating || 5,
    timestamp: "Hivi sasa",
    likes: 0
  };

  comments.unshift(newComment);
  res.json(newComment);
});

// API: Forums Topics
app.get("/api/forums/topics", (req, res) => {
  res.json(forumTopics);
});

// API: Add Forum Topic
app.post("/api/forums/topics", (req, res) => {
  const { title, category, authorName, content, tags } = req.body;
  if (!title || !category || !authorName || !content) {
    return res.status(400).json({ error: "Missing forum fields" });
  }

  const newTopic = {
    id: `f-${Date.now()}`,
    title,
    category,
    authorName,
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
    content,
    timestamp: `Hivi sasa`,
    repliesCount: 0,
    views: 1,
    likes: 0,
    tags: tags || ["General"]
  };

  forumTopics.unshift(newTopic);
  res.json(newTopic);
});

// API: Forum Topic Replies
app.get("/api/forums/replies/:topicId", (req, res) => {
  const filtered = forumReplies.filter(r => r.topicId === req.params.topicId);
  res.json(filtered);
});

// API: Post Forum Reply
app.post("/api/forums/replies", (req, res) => {
  const { topicId, authorName, content } = req.body;
  if (!topicId || !authorName || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newReply = {
    id: `fr-${Date.now()}`,
    topicId,
    authorName,
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
    content,
    timestamp: "Hivi sasa",
    likes: 0
  };

  forumReplies.push(newReply);

  // Update replies count on topic
  const topic = forumTopics.find(t => t.id === topicId);
  if (topic) {
    topic.repliesCount += 1;
  }

  res.json(newReply);
});

// API: AI Movie Recommendations (using Gemini API server-side with fallback)
app.post("/api/gemini/recommend", async (req, res) => {
  const { prompt, userPreferredLanguage, currentCatalogTitles } = req.body;
  const userLang = userPreferredLanguage || "Swahili";

  const fallbackRecommendations = [
    {
      title: "Nyota ya Mapenzi",
      description: "Tamthilia ya kusisimua ya Kiswahili inayohusu binti kutoka kijijini anayepambana kupata ndoto zake za muziki jijini Dar es Salaam.",
      genres: ["Drama", "Romance", "Music"],
      matchScore: "95%"
    },
    {
      title: "Mizungu ya Kiza",
      description: "Filamu ya kusisimua (thriller) iliyojaa mikasa, njama, na misukosuko kuhusu mchunguzi wa polisi anayefichua siri ya ufisadi.",
      genres: ["Action", "Suspense", "Crime"],
      matchScore: "88%"
    },
    {
      title: "Safari ya Ruaha",
      description: "Documentary inayofuatilia urembo usiofahamika wa Hifadhi ya Taifa ya Ruaha, wanyama wa kipekee na asili yetu.",
      genres: ["Nature", "Adventure", "Documentary"],
      matchScore: "82%"
    }
  ];

  const client = getGeminiClient();
  if (!client) {
    // Return mock fallback responses with beautiful design
    return res.json({
      recommendations: fallbackRecommendations,
      aiExplanation: `Hapa kuna filamu zilizopendekezwa mahususi kwako kwa kutumia AI kulingana na mapendeleo yako ya hivi sasa katika lugha ya ${userLang}.`
    });
  }

  try {
    const formattedPrompt = `You are the ultimate TCN Stream AI Movie Recommendation Engine. Based on the user interest or query: "${prompt}". 
    The user prefers language: ${userLang}.
    Please generate 3 custom mock movie ideas that would perfectly match this query and format them as JSON.
    Each movie should have:
    - title (a creative name, preferably Swahili or Swahili Dub theme like "Bongo", "Kiswahili", "K-Drama Dub")
    - description (a compelling 2-sentence synopsis in ${userLang === 'Swahili' ? 'Swahili' : 'English'})
    - genres (an array of strings)
    - matchScore (a percentage string like "98%")
    
    Response must be ONLY valid JSON matching this schema:
    {
      "recommendations": [
         { "title": "...", "description": "...", "genres": ["..."], "matchScore": "..." }
      ],
      "aiExplanation": "A short, engaging explanation in ${userLang === 'Swahili' ? 'Swahili' : 'English'} why these recommendations fit the user request."
    }`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    res.json({
      recommendations: fallbackRecommendations,
      aiExplanation: "Kutokana na tatizo la mtandao, tumetumia algorithms zetu za ndani kukutafutia filamu hizi zinazokufaa zaidi!"
    });
  }
});

// API: AI Streaming Assistant Chatbot (Gemini server-side with fallback)
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, userPreferredLanguage } = req.body;
  const isSwahili = userPreferredLanguage === "Swahili";

  const defaultWelcome = isSwahili 
    ? "Habari! Mimi ni TCN AI Stream Assistant. Naweza kukusaidia kupata Bongo Movies nzuri, Live TV, soka la kibongo au maelezo ya subscription. Unataka kuangalia nini leo?"
    : "Hello! I am your TCN AI Stream Assistant. I can help you find amazing Bongo Movies, Live TV, soka streams, or help with subscriptions. What would you like to watch today?";

  if (!messages || messages.length === 0) {
    return res.json({ reply: defaultWelcome });
  }

  const client = getGeminiClient();
  if (!client) {
    // Handle offline mock chatbot
    const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
    let reply = "";
    if (isSwahili) {
      if (lastUserMsg.includes("bongo") || lastUserMsg.includes("filamu") || lastUserMsg.includes("movie")) {
        reply = "Kwenye maktaba yetu ya Bongo Movies, nakupendekezea uanze na filamu maarufu ya **Dar es Salaam Usiku** iliyoshinda tuzo nyingi, au mfululizo mtamu wa kifamilia **Siri ya Mtungi**. Zote ziko katika HD!";
      } else if (lastUserMsg.includes("live") || lastUserMsg.includes("tv") || lastUserMsg.includes("mpira") || lastUserMsg.includes("soka")) {
        reply = "Tunao vituo vya Moja kwa Moja kama **TCN Habari Live** kwa habari masaa 24, na **Azam Sports HD Live** ili usipitwe na soka la kibabe la Ligi Kuu NBC Tanzania!";
      } else if (lastUserMsg.includes("bei") || lastUserMsg.includes("pesa") || lastUserMsg.includes("pay") || lastUserMsg.includes("sub") || lastUserMsg.includes("kujiunga")) {
        reply = "Tuna vifurushi vya TCN Stream vinavyoanza na **Kifurushi cha Mwezi (TZS 10,000)** na **Kifurushi cha Mwaka (TZS 80,000)** chenye ofa nzuri! Unaweza kulipia kirahisi kupitia **M-Pesa** au **Airtel Money** hapa hapa.";
      } else {
        reply = "Asante kwa ujumbe wako! Mimi kama msaidizi wako wa TCN, nakushauri uangalie **Mvuto wa Serengeti** (Documentary) au **Descendants of the Sun (Swahili Dub)** kwa burudani isiyo na kikomo!";
      }
    } else {
      if (lastUserMsg.includes("bongo") || lastUserMsg.includes("movie") || lastUserMsg.includes("film")) {
        reply = "In our Bongo Movies library, I highly recommend you watch **Dar es Salaam Usiku**, a top-rated blockbuster romance drama, or **Siri ya Mtungi** for beautiful family values.";
      } else if (lastUserMsg.includes("live") || lastUserMsg.includes("tv") || lastUserMsg.includes("sports") || lastUserMsg.includes("football")) {
        reply = "We offer 24/7 channels like **TCN News Live** and **Azam Sports HD Live** so you can stream live soccer matches from the NBC Premier League!";
      } else if (lastUserMsg.includes("price") || lastUserMsg.includes("sub") || lastUserMsg.includes("pay") || lastUserMsg.includes("money")) {
        reply = "Our premium plans are highly affordable: **Monthly Plan for TZS 10,000** ($4.00) or the best-value **Yearly Plan for TZS 80,000** ($32.00). Payments can be made via **M-Pesa, Airtel Money, Stripe, or PayPal**.";
      } else {
        reply = "Fascinating choice! As your TCN assistant, I suggest checking out **Dar es Salaam Usiku** or streaming live sports. Let me know if you need specific category matches!";
      }
    }
    return res.json({ reply });
  }

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Add a system instruction to guide the chat
    const systemInstruction = `You are TCN Stream AI Assistant, a premium, friendly, helpful AI helper integrated into TCN Stream (streaming platform in Tanzania).
    You speak fluently in English and Kiswahili (mix of standard and Tanzanian urban slang is encouraged if Kiswahili is used!).
    Your goals:
    - Help users navigate categories like Bongo Movies, Swahili Dubs, Live TV (TCN Habari, Azam Sports), Kids, Radio, and Documentaries.
    - Give recommendations from our catalog. Mention films like: "Dar es Salaam Usiku" (Starring Wema Sepetu), "Siri ya Mtungi", "The Avengers (Swahili Dub)", "Azam Sports HD Live", "Mvuto wa Serengeti".
    - Explain that they can pay easily using Tanzanian local methods like M-Pesa, Airtel Money, as well as Credit Cards and Stripe.
    - Be concise, direct, and entertaining!`;

    const chatSession = getGeminiClient()?.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction
      }
    });

    if (!chatSession) {
      throw new Error("Chat session creation failed");
    }

    // Since we are doing a single prompt proxy in this simple stateless endpoint, let's just send the last message
    // but pass previous messages if needed, or simply send the last query
    const lastUserMessage = messages[messages.length - 1].content;
    const response = await chatSession.sendMessage({ message: lastUserMessage });
    res.json({ reply: response.text || "Asante kwa swali lako!" });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.json({ reply: "Pole, nahisi kuna hitilafu kidogo kwenye mfumo wangu wa akili mnemba (AI). Naweza kukusaidia kwingine?" });
  }
});

// Serve frontend build and handle Vite dev server mounting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Serve Vite inside Express for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve pre-built static assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TCN STREAM SERVER] Running at http://localhost:${PORT}`);
  });
}

startServer();
