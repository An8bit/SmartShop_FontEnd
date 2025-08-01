import ApiService from './apiService';

export const getProducts = async () => {
  return await ApiService.get("Products/all");
};

export const getProductById = async (id: string) => {
  return await ApiService.get(`Products/${id}`);
};

export const getProductsByCategory = async (category: string) => {
  return await ApiService.get(`Products/category/${category}`);
};

// Thêm các hàm khác như createProduct, updateProduct, deleteProduct

export default { getProducts, getProductById, getProductsByCategory };