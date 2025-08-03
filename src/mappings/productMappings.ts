import { createMap, forMember, mapFrom } from 'automapper-core';
import type { Mapper } from 'automapper-core';
import { ProductDto, ProductDiscountedDto, DiscountItemDto } from '../dto/ProductDto';

export const configureProductMappings = (mapper: Mapper) => {
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