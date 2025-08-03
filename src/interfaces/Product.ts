export interface Product {
  productId: number;
  name: string;
  categoryName: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  averageRating?: number;
  reviewsCount?: number;
  isNew?: boolean;
  discount?: number;
  description?: string;
  variants?: {
    variantId: number;
    color: string;
    size: string;
    stockQuantity: number;
  }[];
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  // Thêm các properties cần thiết cho ProductDetails
  rating?: number;
  sold?: number;
  stockQuantity?: number;
  categoryId?: string;
}