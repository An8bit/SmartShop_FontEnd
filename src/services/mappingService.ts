import { mapper, ProductDiscountedDto, DiscountItemDto, ProductDto } from '../utils/mapper';
import { ProductDiscounted, DiscountItem } from '../interfaces/DiscountedProduct';
import { Product } from '../interfaces/Product';
import { isDiscountActive } from './discountService';

export class MappingService {
  // Map từ Product và DiscountItem thành ProductDiscounted
  static mapToProductDiscounted(
    product: Product,
    discountItem: DiscountItem,
    imageUrl?: string
  ): ProductDiscounted {
    const discountedPrice = product.price - (product.price * discountItem.discountPercentage / 100);
    const isActive = isDiscountActive(discountItem.startDate, discountItem.endDate);

    // Tạo DTO từ product
    const productDto = new ProductDto();
    Object.assign(productDto, product);

    // Map cơ bản từ product
    const mapped = mapper.map(productDto, ProductDto, ProductDiscountedDto);

    // Thêm thông tin discount và tính toán
    return {
      ...mapped,
      imageUrl: imageUrl || product.imageUrl || "https://via.placeholder.com/150",
      discountPercentage: discountItem.discountPercentage,
      discountedPrice,
      discountStartDate: discountItem.startDate,
      discountEndDate: discountItem.endDate,
      isActive
    };
  }

  // Map fallback từ DiscountItem thành ProductDiscounted
  static mapFallbackToProductDiscounted(discountItem: DiscountItem): ProductDiscounted {
    const isActive = isDiscountActive(discountItem.startDate, discountItem.endDate);

    // Tạo DTO từ discountItem
    const discountDto = new DiscountItemDto();
    Object.assign(discountDto, { ...discountItem, isActive });

    // Map và return
    return mapper.map(discountDto, DiscountItemDto, ProductDiscountedDto);
  }

  // Batch mapping cho danh sách
  static mapDiscountItemsToProducts(
    items: Array<{
      discountItem: DiscountItem;
      product?: Product;
      imageUrl?: string;
    }>
  ): ProductDiscounted[] {
    return items.map(({ discountItem, product, imageUrl }) => {
      if (product) {
        return this.mapToProductDiscounted(product, discountItem, imageUrl);
      } else {
        return this.mapFallbackToProductDiscounted(discountItem);
      }
    });
  }
}