import type {
  ChefDashboardData,
  ChefDashboardDto,
} from "../types/chef-dashboard.types";

const defaultChefAvatar = "/images/chef.webp";

function toText(value: unknown) {
  return String(value ?? "").trim();
}

function toNumber(value: unknown) {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function mapChefDashboardDtoToData(
  dto: ChefDashboardDto,
): ChefDashboardData {
  return {
    chefName: toText(dto.chefName) || "آشپز دیگچه",
    chefAvatar: toText(dto.chefAvatar) || defaultChefAvatar,
    stats: {
      monthlyIncome: toNumber(
        dto.currentMonthRevenue ?? dto.stats?.monthlyIncome,
      ),
      totalOrdersCount: toNumber(
        dto.totalOrders ??
          dto.stats?.totalOrdersCount ??
          dto.stats?.todayOrdersCount,
      ),
      customerRating: toNumber(
        dto.customerRatingAverage ?? dto.stats?.customerRating,
      ),
      activeFoodsCount: toNumber(
        dto.activeDishes ?? dto.stats?.activeFoodsCount,
      ),
    },
  };
}