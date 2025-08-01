import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./MainBanner.module.css";
import banner8 from "../../../assets/images/banner8.jpg";
import banner9 from "../../../assets/images/banner9.jpeg";
import banner10 from "../../../assets/images/banner10.jpg";

const banners = [
  banner10,
  banner9,
  banner10,
];

const MainBanner = () => {
  return (
    <div className={styles["main-banner"]}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000 }}
        loop={true}
        pagination={{ clickable: true }}
        navigation
        slidesPerView={1}
        spaceBetween={0}
      >
        {banners.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image} alt={`Banner ${index + 1}`} className={styles["banner-img"]} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MainBanner;
