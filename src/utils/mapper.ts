import { createMapper, createMap, forMember, mapFrom } from 'automapper-core';
import { classes } from 'automapper-classes';
import { DiscountItem } from '../interfaces/DiscountedProduct';
import { Product } from '../interfaces/Product';

// Tạo mapper instance
export const mapper = createMapper({
  strategyInitializer: classes(),
});

// DTO classes
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

export class ProductDto {
  id!: number;
  productId!: number;
  name!: string;
  productName!: string;
  description!: string;
  price!: number;
  imageUrl!: string;
}

// Mapping configurations
export const configureMapping = () => {
  // Map từ Product + DiscountItem thành ProductDiscounted
  createMap(
    mapper,
    ProductDto,
    ProductDiscountedDto,
    forMember(
      dest => dest.productId,
      mapFrom(src => src.id || src.productId)
    ),
    forMember(
      dest => dest.productName,
      mapFrom(src => src.name || src.productName || '')
    ),
    forMember(
      dest => dest.originalPrice,
      mapFrom(src => src.price)
    )
  );

  // Map từ DiscountItem fallback thành ProductDiscounted
  createMap(
    mapper,
    DiscountItemDto,
    ProductDiscountedDto,
    forMember(
      dest => dest.productName,
      mapFrom(src => src.productName || 'Sản phẩm không xác định')
    ),
    forMember(
      dest => dest.description,
      mapFrom(src => src.description || '')
    ),
    forMember(
      dest => dest.imageUrl,
      mapFrom(src => src.imageUrl || "https://via.placeholder.com/150")
    ),
    forMember(
      dest => dest.originalPrice,
      mapFrom(src => src.originalPrice || 0)
    ),
    forMember(
      dest => dest.discountedPrice,
      mapFrom(src => src.discountedPrice || 0)
    ),
    forMember(
      dest => dest.discountStartDate,
      mapFrom(src => src.startDate)
    ),
    forMember(
      dest => dest.discountEndDate,
      mapFrom(src => src.endDate)
    )
  );
};

// Khởi tạo mapping khi import
configureMapping();