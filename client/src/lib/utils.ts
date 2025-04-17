import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function generateOrderId(): string {
  return `ORD${Date.now().toString().slice(-9)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = d.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
  const year = d.getFullYear();
  
  return `${day} ${month}, ${year}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export const statusColors = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  delivered: 'bg-green-500'
};

export const statusNames = {
  pending: 'Pending',
  in_progress: 'In Progress',
  delivered: 'Delivered'
};
