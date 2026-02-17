import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 * @param  {...any} inputs - Class names to merge
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diff = now - then;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Get status color class
 * @param {string} status - Status value
 * @returns {string} Tailwind color class
 */
export function getStatusColor(status) {
    switch (status?.toUpperCase()) {
        case 'NORMAL':
            return 'status-normal';
        case 'UNDER_OBSERVATION':
            return 'status-observation';
        case 'CRIMINAL':
            return 'status-criminal';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

/**
 * Get risk level color class
 * @param {string} level - Risk level
 * @returns {string} Tailwind color class
 */
export function getRiskColor(level) {
    switch (level?.toUpperCase()) {
        case 'LOW':
            return 'risk-low';
        case 'MEDIUM':
            return 'risk-medium';
        case 'HIGH':
            return 'risk-high';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

/**
 * Get claim status badge color
 * @param {string} status - Claim status
 * @returns {string} Tailwind color classes
 */
export function getClaimStatusColor(status) {
    switch (status?.toUpperCase()) {
        case 'PENDING':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'APPROVED':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'REJECTED':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format confidence percentage
 * @param {number} confidence - Confidence value (0-100 or 0-1)
 * @returns {string} Formatted percentage
 */
export function formatConfidence(confidence) {
    if (confidence === null || confidence === undefined) return '0%';
    // Handle both 0-1 and 0-100 ranges
    const value = confidence > 1 ? confidence : confidence * 100;
    return `${value.toFixed(1)}%`;
}

/**
 * Get image URL with fallback
 * @param {string} url - Image URL
 * @returns {string} Full image URL or placeholder
 */
export function getImageUrl(url) {
    if (!url) return '/placeholder-avatar.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) {
        return `http://localhost:5000${url}`;
    }
    return url;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
