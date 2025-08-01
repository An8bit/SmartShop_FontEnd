// Cập nhật interface để match với API
export interface DiscountItem {
  id: number;
  productId: number;
  productName: string;
  discountPercentage: number;
  startDate: string;        // API trả về startDate
  endDate: string;          // API trả về endDate
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  originalPrice?: number;
  discountedPrice?: number;
  description?: string;
  imageUrl?: string;
}

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