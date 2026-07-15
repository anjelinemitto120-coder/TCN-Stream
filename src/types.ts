/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: "Movie" | "TV Series" | "Live TV" | "Kids" | "Sports" | "News" | "Radio" | "Documentary" | "Anime";
  genres: string[];
  languages: string[];
  countries: string[];
  releaseYear: number;
  duration: string; // e.g., "1h 45m" or "10 Episodes"
  thumbnail: string;
  banner: string;
  videoUrl: string; // URL of video stream
  qualities: ("Auto" | "480p" | "720p" | "1080p" | "4K")[];
  audioLanguages: string[];
  subtitles: string[];
  rating: number; // 0 to 5
  views: number;
  isTrending: boolean;
  isFeatured: boolean;
  isBongo: boolean; // Specially flagged Bongo Movies
  isSwahili: boolean; // Specially flagged Swahili Dubbed or Original
  isPremium: boolean; // Premium locked
  cast: string[];
  director: string;
}

export interface Comment {
  id: string;
  contentId: string;
  username: string;
  userAvatar: string;
  content: string;
  rating: number;
  timestamp: string;
  likes: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: "General" | "Bongo Movies" | "Hollywood & Bollywood" | "Korean Drama" | "Sports & News" | "Kids & Anime";
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  repliesCount: number;
  views: number;
  likes: number;
  tags: string[];
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  parentalControlPin?: string; // 4 digits PIN for adult content access
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceTZS: string;
  priceUSD: string;
  period: "month" | "quarter" | "year" | "one-shot";
  features: string[];
  icon: string;
}

export interface PaymentTransaction {
  id: string;
  username: string;
  planName: string;
  amount: string;
  currency: string;
  paymentMethod: "M-Pesa" | "Airtel Money" | "Stripe" | "PayPal" | "Visa" | "Mastercard";
  status: "Completed" | "Pending" | "Failed";
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  timestamp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface UserDevice {
  id: string;
  deviceName: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
