export const formatPrice = (price: string | number | undefined | null): string => {
  // Handle undefined/null cases
  if (price === undefined || price === null) {
    console.warn('Undefined or null price value');
    return 'KSh 0.00';
  }

  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Handle NaN cases
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return 'KSh 0.00';
  }

  // Format using Kenya locale and currency
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn('NumberFormat error, using fallback:', error);
    return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

// Alternative simple formatter if you prefer "KSh" prefix consistently
export const formatPriceSimple = (price: string | number | undefined | null): string => {
  // Handle undefined/null cases
  if (price === undefined || price === null) {
    return 'KSh 0.00';
  }

  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Handle NaN cases
  if (isNaN(numericPrice)) {
    return 'KSh 0.00';
  }

  // Format with KSh prefix and comma separators
  return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Utility function to parse price from various formats
export const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') {
    return price;
  }

  // Remove currency symbols and spaces, then parse
  const cleanPrice = price.replace(/[KSh\s,]/g, '');
  const parsed = parseFloat(cleanPrice);
  
  return isNaN(parsed) ? 0 : parsed;
};