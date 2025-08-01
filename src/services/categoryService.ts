import ApiService from "./apiService";
import { Category, CategoryResponse } from "../interfaces/Categories";


export const getCategories = async (): Promise<CategoryResponse[]> => {
  const data = await ApiService.get<Category[]>("Categories");
  // Map sang CategoryResponse
  return data.map((item) => ({
    categoryId: item.id,
    categoryName: item.name,
    parentCategoryId: null,
    description: item.gender === "Nam" ? "áo danh cho Nam" : "áo danh cho Nữ",
    productCount: 0,
  }));
};