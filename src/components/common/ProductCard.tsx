  import React, { useState } from "react";
  import { Link } from "react-router-dom";
  import { Product } from "../../interfaces/Product";
  import styles from "../../pages/Product/ProductPage.module.css";
  import { FiShoppingCart, FiHeart, FiSearch } from "react-icons/fi";
  import { addToCart } from "../../services/cartService";
  import { useToast } from "./Toast/ToastProvider";

  interface ProductCardProps {
    product: Product;
  }

  const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isAdding, setIsAdding] = useState(false);
    const { showToast } = useToast();

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isAdding) return;
      setIsAdding(true);

      try {
        // Sử dụng CartService main - tự động route giữa guest và user
        await addToCart(product, 1);
        
        // Hiệu ứng thông báo thành công
        showToast("Đã thêm sản phẩm vào giỏ hàng!", "success");
      } catch (error) {
        console.error("Error adding to cart:", error);
        showToast("Có lỗi xảy ra khi thêm vào giỏ hàng", "error");
      } finally {
        setIsAdding(false);
      }
    };

    return (
    <div className={styles["product-card"]}>
      <div className={styles["product-card-inner"]}>
        {product.isNew && <span className={styles["product-badge"] + " " + styles["new"]}>New</span>}
        {(product.discountPercentage && product.discountedPrice) && (
          <span className={styles["product-badge"] + " " + styles["discount"]}>-{product.discountPercentage}%</span>
        )}
        <div className={styles["product-image-container"]}>
          <img
            src={product.imageUrl || "https://via.placeholder.com/150"}
            alt={product.name}
            className={styles["product-image"]}
          />
          <div className={styles["product-actions"]}>
            <button 
              className={styles["action-btn"] + " " + styles["cart-btn"]} 
              title="Add to cart"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <FiShoppingCart />
            </button>
            <button className={styles["action-btn"] + " " + styles["wishlist-btn"]} title="Add to wishlist">
              <FiHeart />
            </button>
            <Link
              to={`/product/${product.productId}`}
              className={styles["action-btn"] + " " + styles["view-btn"]}
              title="View details"
            >
              <FiSearch />
            </Link>
          </div>
        </div>
        <div className={styles["product-details"]}>
          <Link to={`/product/${product.productId}`} className={styles["product-name-link"]}>
            <h3 className={styles["product-name"]}>{product.name}</h3>
          </Link>
          <div className={styles["product-rating"]}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`star ${star <= (product.averageRating || 4) ? 'filled' : ''}`}>★</span>
            ))}
            <span className={styles["rating-count"]}>({product.reviewsCount || 0})</span>
          </div>
          <div className={styles["product-price"]}>
            {(product.discountedPrice && product.discountPercentage) ? (
              <>
                <span className={styles["old-price"]}>{Number(product.originalPrice).toLocaleString()}đ</span>
                <span className={styles["new-price"]}>{Number(product.discountedPrice).toLocaleString()}đ</span>
                <span className={styles["discount-badge"]}>-{product.discountPercentage}%</span>
              </>
            ) : (
              <span className={styles["new-price"]}>
                {product.price ? Number(product.price).toLocaleString() : "N/A"}đ
              </span>
            )}
          </div>
          {(product.description && product.description.trim() !== "" && product.description !== "Quần dành cho Nam") && (
            <p className={styles["product-description"]}>{product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
  };

  export default ProductCard;