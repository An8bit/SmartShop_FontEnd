export class ProductDto {
  id!: number;
  productId!: number;
  name!: string;
  productName!: string;
  description!: string;
  price!: number;
  imageUrl!: string;
}

export class ProductDiscountedDto {
  productId!: number;
  productName!: string;
  description!: string;
  imageUrl!: string;
  originalPrice!: number;
  discountPercentage!: number;
  discountedPrice!: number;
  discountStartDate!: string;
  discountEndDate!: string;
  isActive!: boolean;
}

export class DiscountItemDto {
  id!: number;
  productId!: number;
  productName!: string;
  discountPercentage!: number;
  startDate!: string;
  endDate!: string;
  isActive!: boolean;
  createdAt!: string;
  updatedAt!: string | null;
  originalPrice?: number;
  discountedPrice?: number;
  description?: string;
  imageUrl?: string;
}