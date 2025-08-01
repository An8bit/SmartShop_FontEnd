export interface ProductDiscounted {
  productId: number;
  productName: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  discountStartDate: string;
  discountEndDate: string;
  isActive: boolean;
}