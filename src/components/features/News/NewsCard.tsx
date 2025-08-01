import React from "react";
import styles from "./NewsSection.module.css";

type NewsCardProps = {
  image?: string;
  title: string;
  date: string;
};

const NewsCard: React.FC<NewsCardProps> = ({ image, title, date }) => {
  return (
    <div className={styles["news-card"]}>
      {image && <img src={image} alt={title} className={styles["news-card-img"]} />}
      <div className={styles["news-card-content"]}>
        <p className={styles["news-card-title"]}>{title}</p>
        <p className={styles["news-card-date"]}>📅 {date}</p>
      </div>
    </div>
  );
};

export default NewsCard;
