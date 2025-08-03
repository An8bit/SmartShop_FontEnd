import { ProductDto, ProductDiscountedDto, DiscountItemDto } from '../dto/ProductDto';

// Simple mapper without complex automapper library
export const mapper = {
  map: <TSource, TDestination>(
    source: TSource, 
    sourceType: new() => TSource, 
    destinationType: new() => TDestination
  ): TDestination => {
    if (destinationType === ProductDiscountedDto as any) {
      const sourceData = source as any;
      return {
        productId: sourceData.id || sourceData.productId || 0,
        productName: sourceData.name || sourceData.productName || 'Unknown Product',
        description: sourceData.description || '',
        imageUrl: sourceData.imageUrl || "https://via.placeholder.com/150",
        originalPrice: sourceData.price || sourceData.originalPrice || 0,
        discountPercentage: sourceData.discountPercentage || 0,
        discountedPrice: sourceData.discountedPrice || sourceData.price || 0,
        discountStartDate: sourceData.discountStartDate || sourceData.startDate || '',
        discountEndDate: sourceData.discountEndDate || sourceData.endDate || '',
        isActive: sourceData.isActive || false
      } as TDestination;
    }
    
    // Default fallback
    return source as any;
  }
};

// Export mapper để sử dụng trong các service
export default mapper;