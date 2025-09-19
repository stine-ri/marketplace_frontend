// src/utils/priceUtils.ts - Enhanced price formatting utilities
import { Service } from '../types/types';
export interface PriceRange {
  min: string;
  max: string;
  range: string;
  hasVariation: boolean;
  validPrices: number[];
}

export interface PriceFormatOptions {
  showFreeText?: boolean;
  fallbackText?: string;
  currency?: 'KES' | 'USD';
  locale?: string;
}

export interface PriceWithCategory {
  formatted: string;
  category: 'budget' | 'standard' | 'premium';
  numeric: number;
}

export interface PriceStatistics {
  count: number;
  min: number;
  max: number;
  average: number;
  median: number;
  range: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  numericValue: number | null;
}

// Constants
const DEFAULT_FALLBACK_TEXT = 'Price on request';
const DEFAULT_CURRENCY = 'KES';
const DEFAULT_LOCALE = 'en-KE';
const PRICE_REGEX = /[KSh$\s,]/gi;
const MAX_REASONABLE_PRICE = 10000000;

/**
 * Cleans and parses a price value to a number
 */
// Enhanced price parsing
export const parsePriceToNumber = (price: string | number | null | undefined): number | null => {
  if (price === undefined || price === null || price === '') return null;
  
  if (typeof price === 'number') {
    return isNaN(price) ? null : Math.max(0, price); // Allow 0 prices
  }

  // Handle various string formats
  const cleanPrice = price.toString().replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleanPrice);
  
  return isNaN(parsed) ? null : Math.max(0, parsed); // Allow 0 prices
};

/**
 * Enhanced price formatter with proper Kenyan Shilling formatting
 * @param price - Price as string, number, undefined, or null
 * @param options - Formatting options
 * @returns Formatted price string
 */
export const formatPrice = (
  price: string | number | undefined | null,
  options: PriceFormatOptions = {}
): string => {
  const {
    showFreeText = true, // Default to showing "Free" for 0
    fallbackText = 'Price not set', 
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE
  } = options;
  
 if (price === undefined || price === null || price === '') {
    return fallbackText;
  }
  const numericPrice = parsePriceToNumber(price);

  if (numericPrice === null) {
    return fallbackText;
  }

  if (numericPrice === 0 && showFreeText) {
    return 'Free';
  }

  if (numericPrice === 0) {
    return fallbackText;
  }

  try {
    // Use Intl.NumberFormat for proper localization
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn('NumberFormat error, using fallback:', error);
    const symbol = currency === 'KES' ? 'KSh' : '$';
    return `${symbol} ${numericPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

/**
 * Extract valid prices from services array
 */
const extractValidPrices = (services: any[]): number[] => {
  return services
    .map(service => parsePriceToNumber(service.price))
    .filter((price): price is number => price !== null && price > 0)
    .sort((a, b) => a - b);
};

/**
 * Format price range from an array of services
 * @param services - Array of services with prices
 * @returns Formatted price range information
 */
export const formatPriceRange = (services: Service[] | undefined): string => {
  if (!services || services.length === 0) {
    return 'No services listed';
  }

  // Get valid prices (including 0)
  const validPrices = services
    .map(service => parsePriceToNumber(service.price))
    .filter((price): price is number => price !== null && price >= 0); // Allow 0 prices
  
  if (validPrices.length === 0) {
    return 'Prices not set';
  }
  
  // Check if all prices are 0 (free services)
  if (validPrices.every(price => price === 0)) {
    return 'Free';
  }
  
  // Filter out 0 prices for range calculation (unless all are 0)
  const nonZeroPrices = validPrices.filter(price => price > 0);
  
  if (nonZeroPrices.length === 0) {
    return 'Free services available';
  }
  
  const min = Math.min(...nonZeroPrices);
  const max = Math.max(...nonZeroPrices);
  
  if (min === max) {
    return formatPrice(min);
  } else {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
};

/**
 * Parse price from various formats to a clean number
 * @param price - Price in any format
 * @returns Cleaned numeric price or null if invalid
 */
export const parsePrice = (price: string | number | undefined | null): number | null => {
  return parsePriceToNumber(price);
};

/**
 * Get price category for UI styling
 * @param price - Price value
 * @param allPrices - Array of all prices for comparison
 * @returns Price category
 */
export const getPriceCategory = (
  price: number,
  allPrices: number[]
): 'budget' | 'standard' | 'premium' => {
  if (allPrices.length === 0) return 'standard';
  
  const sortedPrices = [...allPrices].sort((a, b) => a - b);
  const third = Math.floor(sortedPrices.length / 3);
  
  if (third === 0) return 'standard';
  
  if (price <= sortedPrices[third]) return 'budget';
  if (price <= sortedPrices[third * 2]) return 'standard';
  return 'premium';
};

/**
 * Format price with category styling information
 * @param price - Price value
 * @param allPrices - Array of all prices for comparison
 * @returns Formatted price with category
 */
export const formatPriceWithCategory = (
  price: string | number | undefined | null,
  allPrices: number[] = []
): PriceWithCategory => {
  const formattedPrice = formatPrice(price);
  const numericPrice = parsePrice(price);
  
  if (numericPrice === null) {
    return {
      formatted: formattedPrice,
      category: 'standard',
      numeric: 0
    };
  }
  
  return {
    formatted: formattedPrice,
    category: getPriceCategory(numericPrice, allPrices),
    numeric: numericPrice
  };
};

/**
 * Calculate median value from sorted array
 */
const calculateMedian = (sortedPrices: number[]): number => {
  const mid = Math.floor(sortedPrices.length / 2);
  
  return sortedPrices.length % 2 === 0
    ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
    : sortedPrices[mid];
};

/**
 * Get price range statistics
 * @param services - Array of services
 * @returns Price statistics
 */
export const getPriceStatistics = (services: any[] = []): PriceStatistics => {
  const validPrices = extractValidPrices(services);

  if (validPrices.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      range: 0
    };
  }

  const sortedPrices = [...validPrices].sort((a, b) => a - b);
  const sum = validPrices.reduce((acc, price) => acc + price, 0);
  const average = sum / validPrices.length;
  const median = calculateMedian(sortedPrices);

  return {
    count: validPrices.length,
    min: sortedPrices[0],
    max: sortedPrices[sortedPrices.length - 1],
    average: Math.round(average),
    median: Math.round(median),
    range: sortedPrices[sortedPrices.length - 1] - sortedPrices[0]
  };
};

/**
 * Validate price input
 * @param price - Price input to validate
 * @returns Validation result
 */
export const validatePrice = (price: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!price || price.trim() === '') {
    return { isValid: true, errors: [], numericValue: null };
  }
  
  const numericValue = parsePrice(price);
  
  if (numericValue === null) {
    errors.push('Invalid price format');
  } else {
    if (numericValue < 0) {
      errors.push('Price cannot be negative');
    }
    if (numericValue > MAX_REASONABLE_PRICE) {
      errors.push('Price seems unrealistically high');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    numericValue
  };
};

/**
 * Format currency for display in different contexts
 * @param amount - Amount to format
 * @param context - Display context
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  context: 'compact' | 'full' | 'accounting' = 'full'
): string => {
  if (isNaN(amount)) return 'KSh 0';
  
  switch (context) {
    case 'compact':
      if (amount >= 1000000) {
        return `KSh ${(amount / 1000000).toFixed(1)}M`;
      }
      if (amount >= 1000) {
        return `KSh ${(amount / 1000).toFixed(0)}K`;
      }
      return `KSh ${amount.toFixed(0)}`;
      
    case 'accounting':
      return amount < 0 
        ? `(KSh ${Math.abs(amount).toLocaleString()})`
        : `KSh ${amount.toLocaleString()}`;
        
    case 'full':
    default:
      return new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
  }
};