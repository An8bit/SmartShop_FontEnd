import React from "react";
import styles from "./MegaMenu.module.css";

type MegaMenuProps = {
  category: string;
};

const MegaMenu: React.FC<MegaMenuProps> = ({ category }) => {
  const menuData: Record<string, string[]> = {
    Nam: ["Áo thun", "Áo sơ mi", "Áo khoác", "Quần jeans", "Quần short", "Phụ kiện"],
    Nữ: ["Váy", "Áo kiểu", "Áo khoác", "Quần legging", "Quần jeans", "Túi xách"],
    "Trẻ em": ["Áo thun", "Áo khoác", "Quần bò", "Váy", "Bộ đồ", "Giày dép"],
  };

  return (
    <div className={styles["mega-menu"]}>
      <div className={styles["mega-column"]}>
        <h3>{category}</h3>
        <ul>
          {menuData[category]?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MegaMenu;
