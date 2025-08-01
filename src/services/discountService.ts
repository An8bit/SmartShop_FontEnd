import { DiscountItem, ProductDiscounted } from "../interfaces/DiscountedProduct";
import ApiService from "./apiService";
import { getProductById, getProductImage } from "./productService";
import { MappingService } from "./mappingService";

// Interface cho thời gian còn lại
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedTime: string;
}

// Hàm lấy thời gian Việt Nam (GMT+7)
const getVietnamTime = (): Date => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  return vietnamTime;
};

// Hàm parse datetime từ API (format: "2025-07-22T00:00:00")
const parseApiDateTime = (dateTimeString: string): Date => {
  if (!dateTimeString) {
    return new Date();
  }
  
  const date = new Date(dateTimeString);
  
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  return date;
};

// Hàm tính thời gian khuyến mãi còn lại
export const calculateDiscountTimeRemaining = (discountEndDate: string): TimeRemaining => {
  const now = getVietnamTime();
  const endDate = parseApiDateTime(discountEndDate);
  
  if (isNaN(endDate.getTime())) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedTime: "Đã hết hạn"
    };
  }
  
  const timeDiff = endDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedTime: "Đã hết hạn"
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (isNaN(days) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedTime: "Đã hết hạn"
    };
  }

  let formattedTime = "";
  if (days > 0) {
    formattedTime = `${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    formattedTime = `${hours} giờ ${minutes} phút`;
  } else if (minutes > 0) {
    formattedTime = `${minutes} phút ${seconds} giây`;
  } else {
    formattedTime = `${seconds} giây`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formattedTime: `Còn ${formattedTime}`
  };
};

// Hàm kiểm tra khuyến mãi có còn hiệu lực không
export const isDiscountActive = (discountStartDate: string, discountEndDate: string): boolean => {
  const now = getVietnamTime();
  const startDate = parseApiDateTime(discountStartDate);
  const endDate = parseApiDateTime(discountEndDate);
  
  return now >= startDate && now <= endDate;
};

// Hàm lấy trạng thái khuyến mãi
export const getDiscountStatus = (discountStartDate: string, discountEndDate: string): string => {
  const now = getVietnamTime();
  const startDate = parseApiDateTime(discountStartDate);
  const endDate = parseApiDateTime(discountEndDate);
  
  if (now < startDate) {
    return "Sắp diễn ra";
  } else if (now > endDate) {
    return "Đã kết thúc";
  } else {
    return "Đang diễn ra";
  }
};

// Hàm lấy danh sách sản phẩm giảm giá, kèm ảnh sản phẩm
export const getDiscountedProducts = async (): Promise<ProductDiscounted[]> => {
  try {
    const response = await ApiService.get<DiscountItem[]>("discounts");
    
    const mappingData = await Promise.all(
      response.map(async (discountItem) => {
        try {
          const product = await getProductById(String(discountItem.productId));
          const imageUrl = await getProductImage(String(discountItem.productId));
          
          return {
            discountItem,
            product,
            imageUrl
          };
        } catch (error) {
          return {
            discountItem,
            product: undefined,
            imageUrl: undefined
          };
        }
      })
    );

    // Sử dụng mapping service để map data
    const productsWithDetails = MappingService.mapDiscountItemsToProducts(mappingData);
    
    // Filter chỉ lấy những sản phẩm còn hiệu lực
    const activeProducts = productsWithDetails.filter(product => product.isActive);
    
    return activeProducts;
  } catch (error) {
    console.error("Error fetching discounted products:", error);
    throw new Error("Không thể tải danh sách sản phẩm giảm giá");
  }
};

// Export default object để sử dụng như DiscountService.getDiscountedProducts()
const DiscountService = {
  getDiscountedProducts,
  calculateDiscountTimeRemaining,
  isDiscountActive,
  getDiscountStatus
};

export default DiscountService;
