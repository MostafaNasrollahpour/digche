import type { ChefOrder, OrderStatus } from "@/store/order-store";

type OrderRefDto = {
  id?: string | number;
  name?: string;
  fullName?: string;
  phone?: string;
  imageUrl?: string;
};

type OrderDto = {
  id?: string | number;
  orderItemId?: string | number;
  chefId?: string | number;
  chefName?: string;
  customerId?: number;
  customerName?: string;
  customerFullName?: string;
  customerPhone?: string;
  foodId?: string | number;
  dishId?: string | number;
  foodTitle?: string;
  dishName?: string;
  title?: string;
  foodImage?: string;
  dishImage?: string;
  imageUrl?: string;
  quantity?: number | string;
  price?: number | string;
  unitPrice?: number | string;
  totalPrice?: number | string;
  unit?: string;
  status?: unknown;
  orderedAt?: string;
  createdAt?: string;
  orderDate?: string;
  date?: string;
  chef?: OrderRefDto;
  customer?: OrderRefDto;
  dish?: OrderRefDto;
  items?: unknown;
  orderItems?: unknown;
};

const fallbackImage = "/images/cake.webp";

function normalizeStatus(status: unknown): OrderStatus {
  if (
    status === "pending" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "pending";
}

function resolveImageSrc(src?: string) {
  const value = src?.trim();

  if (!value || value === "undefined" || value === "null") {
    return fallbackImage;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `/images/${value}`;
}

function toOrderId(value: string | number | undefined, fallback: number): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function toOptionalNumber(value: string | number | undefined): number | undefined {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function mapOneOrder(dto: OrderDto, item?: OrderDto, index = 0): ChefOrder {
  const source = item ?? dto;

  return {
    id: toOrderId(source.id ?? source.orderItemId, Date.now() + index),
    chefId: dto.chefId ?? source.chefId ?? dto.chef?.id ?? "",
    chefName: dto.chefName ?? dto.chef?.name ?? dto.chef?.fullName ?? "",
    customerId: toOptionalNumber(dto.customerId ?? dto.customer?.id),
    customerName:
      dto.customerName ??
      dto.customerFullName ??
      dto.customer?.name ??
      dto.customer?.fullName ??
      "مشتری دیگچه",
    customerPhone: dto.customerPhone ?? dto.customer?.phone ?? "",
    foodId: source.foodId ?? source.dishId ?? source.dish?.id ?? "",
    foodTitle:
      source.foodTitle ??
      source.dishName ??
      source.dish?.name ??
      source.title ??
      "غذا",
    foodImage: resolveImageSrc(
      source.foodImage ??
        source.dishImage ??
        source.imageUrl ??
        source.dish?.imageUrl
    ),
    quantity: Number(source.quantity ?? 1),
    price: String(source.price ?? source.unitPrice ?? source.totalPrice ?? ""),
    unit: source.unit ?? "تومان",
    status: normalizeStatus(dto.status ?? source.status),
    orderedAt:
      dto.orderedAt ??
      dto.createdAt ??
      dto.orderDate ??
      dto.date ??
      new Date().toISOString(),
  };
}

export function mapOrderDtosToChefOrders(dtos: unknown[]): ChefOrder[] {
  return dtos.flatMap((dto) => {
    const order = dto as OrderDto;
    const items = order.items ?? order.orderItems;

    if (Array.isArray(items) && items.length > 0) {
      return items.map((item, index) => mapOneOrder(order, item as OrderDto, index));
    }

    return [mapOneOrder(order)];
  });
}
