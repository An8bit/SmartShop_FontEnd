import React from "react";
import NewsCard from "./NewsCard";
import styles from "./NewsSection.module.css";

const NewsSection = () => {
  const newsData = [
    {
      image: "https://via.placeholder.com/150",
      title: "Gucci ra mắt bộ sưu tập Xuân-Hè 2025 với phong cách tối giản",
      date: "05/02/2025",
    },
    {
      image: "https://via.placeholder.com/150",
      title: "5 Xu hướng thời trang đường phố sẽ bùng nổ trong năm nay",
      date: "04/02/2025",
    },
    {
      image: "https://via.placeholder.com/150",
      title: "Uniqlo hợp tác với NTK Việt Nam, ra mắt BST mang đậm văn hóa Á Đông",
      date: "03/02/2025",
    },
  ];

  const guidesData = [
    { title: "Cách phối đồ tối giản nhưng vẫn nổi bật", date: "23/01/2025" },
    { title: "Mẹo chọn giày sneaker phù hợp với mọi outfit", date: "23/12/2024" },
    { title: "4 lỗi phối đồ thường gặp và cách khắc phục", date: "23/12/2024" },
  ];

  return (
    <div className={styles["news-section"]}>
      <div className={styles["news-block"]}>
        <h2 className={styles["news-title"]}>👗 TIN TỨC THỜI TRANG</h2>
        <div className={styles["news-list"]}>
          {newsData.map((news, index) => (
            <NewsCard key={index} image={news.image} title={news.title} date={news.date} />
          ))}
        </div>
      </div>
      <div className={styles["news-block"]}>
        <h2 className={styles["news-title"]}>📌 HƯỚNG DẪN THỜI TRANG</h2>
        <ul className={styles["guide-list"]}>
          {guidesData.map((guide, index) => (
            <li key={index} className={styles["guide-item"]}>
              <p className={styles["guide-title"]}>{guide.title}</p>
              <p className={styles["guide-date"]}>📅 {guide.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewsSection;
