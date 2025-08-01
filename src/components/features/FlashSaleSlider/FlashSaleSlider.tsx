import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
// import axios from "axios"; // TODO: Kiểm tra lại logic API này sau
import "swiper/css";
import "swiper/css/navigation";
import styles from "./FlashSaleSlider.module.css";

import { ProductDiscounted } from "../../../interfaces/DiscountedProduct";
import DiscountService from "../../../services/discountService";

import ApiService from "../../../services/apiService";

const FlashSaleSlider = () => {
  const [products, setProducts] = useState<ProductDiscounted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          return (
            <SwiperSlide key={product.productId} className={styles["flash-sale-item"]}>
              <img
                src={product.imageUrl || "https://via.placeholder.com/150"}
                alt={product.productName}
                className={styles["product-image"]}
              />
              <h3 className={styles["product-name"]}>{product.productName}</h3>
              <p className={styles["old-price"]}>
                <s>{product.originalPrice.toLocaleString()}đ</s>
              </p>
              <p className={styles["new-price"]}>
                {product.discountedPrice.toLocaleString()}đ
                <span style={{ color: "#ff3e6c", marginLeft: 8 }}>
                  -{product.discountPercentage}%
                </span>
              </p>
              <div className={styles["discount-time"]}>
                Áp dụng: {new Date(product.discountStartDate).toLocaleDateString()} - {new Date(product.discountEndDate).toLocaleDateString()}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default FlashSaleSlider;