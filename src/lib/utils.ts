import dayjs from "dayjs";

// Format date to Vietnamese format
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
}

// Parse Vietnamese date format to Date
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  const parsed = dayjs(dateString, "DD/MM/YYYY");
  return parsed.isValid() ? parsed.toDate() : null;
}

// Format gender
export function formatGender(gender: number | undefined | null): string {
  if (gender === 0) return "Nam";
  if (gender === 1) return "Nữ";
  return "";
}

// Format price with thousand separators
export function formatPrice(price: string | number | undefined | null): string {
  if (!price) return "";
  const numPrice = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
  if (isNaN(numPrice)) return "";
  return numPrice.toLocaleString("vi-VN");
}

// Parse price string to number
export function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  return parseFloat(priceString.replace(/,/g, "")) || 0;
}

// Generate RefKey for prescription
export function generateRefKey(customerId: number): string {
  const timestamp = Date.now();
  return `PRES${customerId}${timestamp}`;
}

// Generate FamilyKey
export function generateFamilyKey(customerId: number): string {
  return `FAMILY000${customerId}`;
}

// Validate phone number (Vietnamese format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: Date | string): number {
  return dayjs().diff(dayjs(dateOfBirth), "year");
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Debounce function for search
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

