export function toPersianDigits(value?: string | number | null) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
    .replace(/[٠-٩]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"["٠١٢٣٤٥٦٧٨٩".indexOf(digit)]);
}

export function formatPersianNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "";

  const numberValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numberValue)) {
    return toPersianDigits(value);
  }

  return new Intl.NumberFormat("fa-IR").format(numberValue);
}

export function formatPersianPrice(value?: string | number | null) {
  const formattedValue = formatPersianNumber(value);

  if (!formattedValue) return "";

  return `${formattedValue} تومان`;
}

export function formatPrice(value?: string | number | null) {
  return formatPersianNumber(value);
}