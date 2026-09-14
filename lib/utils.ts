import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '$0';

  const number = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(number)) return '$0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,   // quita los .00
    maximumFractionDigits: 0,
  }).format(number);
}
