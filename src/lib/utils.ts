import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export function formatCurrency(amount: number | null | undefined, currency: string = 'AED'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${currency}0.00`
  }
  return `${currency}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

// Date and time formatting utility
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A'
  }
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Date formatting utility (date only)
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A'
  }
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Time formatting utility (time only)
export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'N/A'
  }
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid Time'
  }
  
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Debounce utility function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

// Capitalize first letter utility
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Truncate text utility
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
