import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        // Check if date is valid
        if (isNaN(d.getTime())) {
            return '-';
        }
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(d);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

export function formatDateTime(date: Date | string): string {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        // Check if date is valid
        if (isNaN(d.getTime())) {
            return '-';
        }
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '-';
    }
}

export function getDaysUntil(date: Date | string): number {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        // Check if date is valid
        if (isNaN(d.getTime())) {
            return 0;
        }
        const now = new Date();
        const diff = d.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch (error) {
        console.error('Error calculating days until:', error);
        return 0;
    }
}
