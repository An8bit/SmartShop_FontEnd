import React, { useEffect, useState } from "react";
import styles from "./CategoryMenu.module.css";
import { getCategories } from "../../../services/categoryService";
import { CategoryResponse } from "../../../interfaces/Categories";

const CategoryMenu = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles["category-menu"]}>
      {loading ? (
        <div style={{ width: "100%", textAlign: "center", padding: 30 }}>Đang tải danh mục...</div>
      ) : (
        categories.map((category) => (
          <div key={category.categoryId} className={styles["category-item"]}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 12,
                marginBottom: 12,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 8,
              }}
            >
              <img
                src={
                  category.categoryName === "Nam"
                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135789.png"
                }
                alt={category.categoryName}
                style={{ width: 56, height: 56, objectFit: "cover", marginBottom: 8 }}
              />
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2, color: "#222" }}>
                {category.categoryName}
              </div>
              <div style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
                {category.description}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CategoryMenu;
