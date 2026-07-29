export interface User {
  id: string;
  email: string;
  subscription_tier: "free" | "pro" | "enterprise";
  subscription_expires_at?: string;
  business_count: number;
  created_at: string;
  updated_at: string;
}

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  category: string;
  google_business_url: string;
  location: string;
  created_at: string;
};

export type Review = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  stars: number;
  review_text: string;
  created_at: string;
  businesses?: { name: string } | null;
};

export type PublicReview = {
  id: string;
  customer_name: string;
  stars: number;
  review_text: string;
  created_at: string;
};
