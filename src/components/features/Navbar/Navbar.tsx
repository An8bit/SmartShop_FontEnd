import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const menuItems = [
  { name: "Tất cả sản phẩm", path: "/products/all" },
  { name: "Nam", path: "/products/26" },
  { name: "Nữ", path: "/products/25" },
  { name: "Trẻ em", path: "/products/12" },
  { name: "Sale", path: "/products/discounted" },
];

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles["nav-menu"]}>
        {menuItems.map((item, index) => (
          <li key={index} className={styles["nav-item"]}>
            <Link to={item.path} className={styles["nav-link"]}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
