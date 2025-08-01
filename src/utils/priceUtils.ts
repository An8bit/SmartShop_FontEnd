export const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return "0 ₫";
  }
  
  return price.toLocaleString('vi-VN') + ' ₫';
};

export const formatPriceNumber = (price: number | undefined | null): number => {
  if (price === undefined || price === null || isNaN(price)) {
    return 0;
  }
  
  return price;
};

export const calculateDiscount = (originalPrice: number | undefined | null, discountedPrice: number | undefined | null): number => {
  const original = formatPriceNumber(originalPrice);
  const discounted = formatPriceNumber(discountedPrice);
  
  if (original === 0) return 0;
  
  return Math.round(((original - discounted) / original) * 100);
};