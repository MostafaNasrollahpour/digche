export type ChefDashboardStats = {
  monthlyIncome: number;
  totalOrdersCount: number;
  customerRating: number;
  activeFoodsCount: number;
};

export type ChefDashboardData = {
  chefName: string;
  chefAvatar: string;
  stats: ChefDashboardStats;
};

export type ChefDashboardDto = {
  chefName?: string | null;
  chefAvatar?: string | null;
  totalOrders?: number | string | null;
  currentMonthRevenue?: number | string | null;
  activeDishes?: number | string | null;
  customerRatingAverage?: number | string | null;
  stats?: {
    monthlyIncome?: number | string | null;
    totalOrdersCount?: number | string | null;
    todayOrdersCount?: number | string | null;
    customerRating?: number | string | null;
    activeFoodsCount?: number | string | null;
  } | null;
};