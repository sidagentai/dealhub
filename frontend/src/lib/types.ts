export interface UserSummary {
  id: number;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  isPoster: boolean;
  followerCount: number;
}

export interface UserProfile extends UserSummary {
  bio: string | null;
}

export interface Deal {
  id: number;
  title: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  retailer: string;
  postedAt: string;
  expiresAt: string | null;
  clickCount: number;
  saveCount: number;
  poster: UserSummary;
}

export interface PricePoint {
  price: number;
  recordedAt: string;
}

export interface DealDetail {
  deal: Deal;
  priceHistory: PricePoint[];
}

export interface Page<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

export interface CategoryNode {
  id: number;
  name: string;
  subcategories: CategoryNode[];
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface DealStats {
  dealId: number;
  title: string;
  clicks: number;
  saves: number;
  shares: number;
}

export interface StatsResponse {
  totalClicks: number;
  totalSaves: number;
  totalShares: number;
  clicksLast7Days: number;
  dealCount: number;
  topDeals: DealStats[];
}
