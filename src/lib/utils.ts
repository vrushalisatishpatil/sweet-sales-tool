import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateDDMMYYYY(value: string | Date | null | undefined): string {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const day = String(value.getDate()).padStart(2, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const year = value.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const trimmed = value.trim();
  if (!trimmed) return "";

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}-${month}-${year}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
}

// Convert DD-MM-YYYY to YYYY-MM-DD for storage/comparison
export function convertDDMMYYYYtoISO(value: string): string {
  if (!value) return "";
  const ddmmyyyyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }
  return value;
}

// Convert YYYY-MM-DD to DD-MM-YYYY for display
export function convertISOtoDDMMYYYY(value: string): string {
  if (!value) return "";
  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}-${month}-${year}`;
  }
  return value;
}
