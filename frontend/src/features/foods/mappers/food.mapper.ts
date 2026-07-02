import type { Food, FoodDto } from "../types/food.types";

const fallbackFoodImage = "/images/cake.webp";

function toText(value: unknown) {
  return String(value ?? "").trim();
}

function firstText(...values: unknown[]) {
  return values.map(toText).find(Boolean) ?? "";
}

function toNumber(value: unknown) {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toIngredientsText(value: FoodDto["ingredients"]) {
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join("، ");
  }

  return toText(value);
}

function toRemainingText(value: FoodDto["remaining"]) {
  if (typeof value === "number") {
    return `${value} باقیمانده`;
  }

  return toText(value);
}

function isFallbackImage(image?: string) {
  return !image || image === fallbackFoodImage;
}

export function mapFoodDtoToFood(dto: FoodDto): Food {
  const location = firstText(
    dto.location,
    dto.address,
    dto.province && dto.city ? `${dto.province}، ${dto.city}` : undefined,
    dto.city,
    dto.province,
  );

  return {
    id: dto.id,
    title: toText(dto.title),
    category: toText(dto.category),
    rating: toNumber(dto.rating),
    remaining: toRemainingText(dto.remaining),
    chef: firstText(
      dto.chef,
      dto.chefName,
      dto.chefDisplayName,
      dto.chefFullName,
    ),
    chefId: dto.chefId ?? "",
    chefUsername: firstText(
      dto.chefUsername,
      dto.chefUserName,
      dto.username,
      dto.userName,
      dto.ownerUsername,
      dto.createdByUsername,
      dto.chefUser?.username,
      dto.chefUser?.userName,
      dto.user?.username,
      dto.user?.userName,
    ),
    location,
    price: toText(dto.price),
    unit: toText(dto.unit) || "تومان",
    image:
      firstText(dto.image, dto.imageUrl, dto.photoUrl) || fallbackFoodImage,
    ingredients: toIngredientsText(dto.ingredients),
    description: toText(dto.description),
  };
}

export function mapFoodDtosToFoods(dtos: FoodDto[]): Food[] {
  return dtos.map(mapFoodDtoToFood);
}

export function mergeFoodWithCompleteFood(
  food: Food,
  completeFood?: Food,
): Food {
  if (!completeFood) {
    return food;
  }

  return {
    ...food,
    title: food.title || completeFood.title,
    category: food.category || completeFood.category,
    rating: food.rating > 0 ? food.rating : completeFood.rating,
    remaining: food.remaining || completeFood.remaining,
    chef: food.chef || completeFood.chef,
    chefId: food.chefId || completeFood.chefId,
    chefUsername: food.chefUsername || completeFood.chefUsername,
    location: food.location || completeFood.location,
    price: food.price || completeFood.price,
    unit: food.unit || completeFood.unit,
    image: isFallbackImage(food.image) ? completeFood.image : food.image,
    ingredients: food.ingredients || completeFood.ingredients,
    description: food.description || completeFood.description,
  };
}