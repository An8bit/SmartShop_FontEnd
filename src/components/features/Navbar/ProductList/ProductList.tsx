import React, { useEffect, useState } from "react";
import styles from "./ProductList.module.css";

type Product = {
  id: string | number;
  img: string;
  name: string;
  price: string;
};

type ProductListProps = {
  category: string;
};

const ProductList: React.FC<ProductListProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`/api/products?category=${category}`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Lỗi tải sản phẩm:", error));
  }, [category]);

  return (
    <div className={styles["product-list"]}>
      <h2>Sản phẩm - {category}</h2>
      <div className={styles["product-container"]}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className={styles["product-card"]}>
              <img src={product.img} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price}₫</p>
            </div>
          ))
        ) : (
          <p>Không có sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
