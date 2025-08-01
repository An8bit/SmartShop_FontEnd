import ApiService from './apiService';
import { Product } from '../interfaces/Product';

export const getProducts = async () => {
  return await ApiService.get("Products/all");
};

export const getProductById = async (id: string): Promise<Product> => {
  return await ApiService.get<Product>(`Products/${id}`);
};

export const getProductsByCategory = async (category: string) => {
  return await ApiService.get(`Products/category/${category}`);
};

// Thêm các hàm khác như createProduct, updateProduct, deleteProduct

export const getProductImage = async (productId: string): Promise<string> => {
  try {
    // Giả sử API có endpoint chỉ trả về imageUrl, ví dụ: Products/image/{id}
    const response = await ApiService.get<{ imageUrl: string }>(`Products/${productId}`);
    return response.imageUrl || "https://via.placeholder.com/150";
  } catch (error) {
    // Nếu lỗi hoặc không có endpoint riêng, fallback gọi getProductById như cũ
    try {
      const product = await getProductById(productId);
      return product.imageUrl || "https://via.placeholder.com/150";
    } catch {
      return "https://via.placeholder.com/150";
    }
  }
};

export default { getProducts, getProductById, getProductsByCategory, getProductImage };