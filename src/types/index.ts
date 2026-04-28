export type Business = {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  category: string;
  address: string;
  created_at: string;
};

export type Review = {
  id: string;
  business_id: string;
  stars: number;
  review_text: string;
  created_at: string;
  businesses?: { name: string } | null;
};
