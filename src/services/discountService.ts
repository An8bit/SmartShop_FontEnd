import ApiService from "./apiService";
import { ProductDiscounted } from "../interfaces/DiscountedProduct";

class DiscountService {
  static async getDiscountedProducts(): Promise<ProductDiscounted[]> {
    return await ApiService.get<ProductDiscounted[]>("Products/discounted");
  }
}

export default DiscountService;