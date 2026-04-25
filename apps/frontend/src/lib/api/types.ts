export interface User {
  id: number;
  email: string;
  nickname: string;
  pfp: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrlItem {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string;
  description: string;
  clickCount: number;
  tags: string[];
  createdAt: string;
}

export interface UrlStats {
  totalClicks: number;
  clicksLast24h: number;
  deviceBreakdown: { type: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export interface AnonymousUrlResult {
  shortCode: string;
  secret: string;
  shortUrl: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiMessage {
  success: true;
  message: string;
}
