export const formatPrice = (price: string | number): string => {
  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Handle invalid numbers
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return '$0.00';
  }
  
  // Format with 2 decimal places
  return `$${numericPrice.toFixed(2)}`;
};