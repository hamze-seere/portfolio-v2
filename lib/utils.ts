import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Class-name joiner the Magic UI components expect. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
