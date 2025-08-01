import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import styles from "./AdSlider.module.css";

import banner1 from "../../../assets/images/banner1.webp";
import banner2 from "../../../assets/images/banner2.webp";
import banner3 from "../../../assets/images/banner3.webp";
import banner4 from "../../../assets/images/banner4.webp";

const ads = [
  banner1,
  banner2,
  banner3,
  banner4,
];

const AdSlider = () => {
  return (
    <div className={styles["ad-slider"]}>
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000 }}
        loop={true}
        slidesPerView={2}
        spaceBetween={10}
        breakpoints={{
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {ads.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image} alt={`Ad ${index + 1}`} className={styles["ad-img"]} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AdSlider;
