
import type { ChefOrder, OrderStatus } from "@/store/order-store";

type AnyOrderDto = Record<string, any>;

const fallbackImage = "/images/cake.webp";

const statusCodeToStatus: Record<string, OrderStatus> = {
  "0": "pending",
  "1": "preparing",
  "2": "ready",
  "3": "delivered",
  "4": "cancelled",
};

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

  const normalizedStatus = String(status ?? "").trim();

  return statusCodeToStatus[normalizedStatus] ?? "pending";
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

function mapOneOrder(
  dto: AnyOrderDto,
  item?: AnyOrderDto,
  index = 0,
): ChefOrder {
  const source = item ?? dto;

  return {
    id: source.id ?? source.orderItemId ?? `${dto.id}-${index}`,
    chefId: dto.chefId ?? source.chefId ?? dto.chef?.id ?? "",
    chefName: dto.chefName ?? dto.chef?.name ?? dto.chef?.fullName ?? "",
    customerId: dto.customerId ?? dto.customer?.id ?? "",
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
        source.dish?.imageUrl,
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
    const order = dto as AnyOrderDto;
    const items = order.items ?? order.orderItems;

    if (Array.isArray(items) && items.length > 0) {
      return items.map((item, index) => mapOneOrder(order, item, index));
    }

    return [mapOneOrder(order)];
  });
}