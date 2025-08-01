export interface Category {
  id: number;
  name: string;
  image: string;
  gender: "Nam" | "Nữ";
}
export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  description: string;
  productCount: number;
}