import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styles from "./FlashSaleSlider.module.css";

import { ProductDiscounted } from "../../../interfaces/DiscountedProduct";
import DiscountService from "../../../services/discountService";
import { addToCart } from "../../../services/cartService";
import { useToast } from "../../common/Toast/ToastProvider";
import { Product } from "../../../interfaces/Product";
import { FaShoppingCart } from "react-icons/fa";

const FlashSaleSlider = () => {
  const [products, setProducts] = useState<ProductDiscounted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { showToast } = useToast();

  // Convert ProductDiscounted to Product for cart service
  const convertToProduct = (discountedProduct: ProductDiscounted): Product => {
    return {
      productId: discountedProduct.productId,
      name: discountedProduct.productName,
      description: discountedProduct.description,
      price: discountedProduct.discountedPrice, // Sử dụng giá đã giảm
      originalPrice: discountedProduct.originalPrice, // Giữ giá gốc để hiển thị
      discountedPrice: discountedProduct.discountedPrice,
      discountPercentage: discountedProduct.discountPercentage,
      imageUrl: discountedProduct.imageUrl,
      categoryId: '',
      categoryName: 'Flash Sale',
      stockQuantity: 100, // Default stock
      variants: [],
      sold: 0,
      rating: 0,
      isNew: false
    };
  };

  // Handle add to cart for flashsale products
  const handleAddToCart = async (discountedProduct: ProductDiscounted) => {
    if (addingToCart === discountedProduct.productId) return;
    
    setAddingToCart(discountedProduct.productId);
    
    try {
      const product = convertToProduct(discountedProduct);
      await addToCart(product, 1);
      
      showToast(
        `Đã thêm "${discountedProduct.productName}" vào giỏ hàng với giá flashsale!`, 
        'success'
      );
      
      // Trigger cart change event
      window.dispatchEvent(new CustomEvent("cartChanged"));
    } catch (error) {
      console.error('Error adding flashsale product to cart:', error);
      showToast('Có lỗi khi thêm sản phẩm vào giỏ hàng', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    DiscountService.getDiscountedProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles["flash-sale-container"]}>Đang tải sản phẩm...</div>;
  if (error) return <div className={styles["flash-sale-container"]}>Lỗi: {error}</div>;
  if (products.length === 0) return <div className={styles["flash-sale-container"]}>Không có sản phẩm</div>;

  return (
    <div className={styles["flash-sale-container"]}>
      <h2 className={styles["flash-sale-title"]}>🔥 FLASH SALE - THỜI TRANG SIÊU GIẢM GIÁ 🔥</h2>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={15}
        slidesPerView={4}
        navigation
        autoplay={{ delay: 3000 }}
        className={styles["flash-sale-slider"]}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          480: { slidesPerView: 2, spaceBetween: 10 },
          768: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 4, spaceBetween: 15 }
        }}
      >
        {products.map((product) => {
          const timeRemaining = DiscountService.calculateDiscountTimeRemaining(product.discountEndDate);
          const isAddingThisProduct = addingToCart === product.productId;
          
          return (
            <SwiperSlide key={product.productId} className={styles["flash-sale-item"]}>
              <div className={styles["product-container"]}>
                <img
                  src={product.imageUrl || "https://via.placeholder.com/150"}
                  alt={product.productName}
                  className={styles["product-image"]}
                />
                <h3 className={styles["product-name"]}>{product.productName}</h3>
                <p className={styles["old-price"]}>
                  <s>{(product.originalPrice || 0).toLocaleString()}đ</s>
                </p>
                <p className={styles["new-price"]}>
                  {(product.discountedPrice || 0).toLocaleString()}đ
                  <span style={{ color: "#ff3e6c", marginLeft: 8 }}>
                    -{product.discountPercentage || 0}%
                  </span>
                </p>
                <div className={styles["discount-time"]}>
                  ⏰ {timeRemaining.formattedTime}
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAddingThisProduct || !product.isActive}
                  className={styles["add-to-cart-btn"]}
                  title={!product.isActive ? "Khuyến mãi đã hết hạn" : "Thêm vào giỏ hàng với giá flashsale"}
                >
                  {isAddingThisProduct ? (
                    <>
                      <div className={styles["loading-spinner"]}></div>
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <FaShoppingCart />
                      <span>Mua ngay</span>
                    </>
                  )}
                </button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default FlashSaleSlider;