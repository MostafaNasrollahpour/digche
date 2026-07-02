export type Food = {
  id: number | string;
  title: string;
  category: string;
  rating: number;
  remaining: string;
  chef: string;
  chefId: number | string;
  chefUsername?: string;
  location: string;
  price: string;
  unit?: string;
  image: string;
  ingredients?: string;
  description: string;
};

export type FoodDto = {
  id: number | string;
  title?: string | null;
  category?: string | null;
  rating?: number | string | null;
  remaining?: number | string | null;
  chef?: string | null;
  chefName?: string | null;
  chefFullName?: string | null;
  chefDisplayName?: string | null;
  chefId?: number | string | null;
  chefUsername?: string | null;
  chefUserName?: string | null;
  username?: string | null;
  userName?: string | null;
  ownerUsername?: string | null;
  createdByUsername?: string | null;
  chefUser?: {
    username?: string | null;
    userName?: string | null;
  } | null;
  user?: {
    username?: string | null;
    userName?: string | null;
  } | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  price?: number | string | null;
  unit?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  photoUrl?: string | null;
  ingredients?: string | string[] | null;
  description?: string | null;
};