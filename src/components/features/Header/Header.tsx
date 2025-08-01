import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaPhoneAlt } from "react-icons/fa";
import { AiOutlineDown } from "react-icons/ai";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { getCart, mergeCartAfterLogin } from "../../../services/cartService";

const Header = () => {
  const [userInfo, setUserInfo] = useState<{fullName: string; email: string} | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  const updateUserInfo = () => {
    const user = sessionStorage.getItem("user");
    console.log("Header - Reading user from sessionStorage:", user);
    if (user && user !== "undefined") {
      try {
        const parsedUser = JSON.parse(user);
        console.log("Header - Parsed user:", parsedUser);
        setUserInfo(parsedUser);
      } catch (error) {
        console.error("Header - Error parsing user:", error);
        setUserInfo(null);
      }
    } else {
      console.log("Header - No user found or user is undefined");
      setUserInfo(null);
    }
  };

  useEffect(() => {
    const fetchCartQuantity = async () => {
      try {
        const cart = await getCart();
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartQuantity(totalQuantity);
      } catch {
        setCartQuantity(0);
      }
    };

    const handleUserLogin = async () => {
      console.log("Header - handleUserLogin triggered");
      updateUserInfo();
      setForceUpdate(prev => prev + 1);
      try {
        await mergeCartAfterLogin();
        await fetchCartQuantity();
      } catch (error) {
        console.error("Error merging cart after login:", error);
      }
    };

    const handleCartChanged = () => {
      console.log("Header - handleCartChanged triggered");
      fetchCartQuantity();
    };

    // Initial load
    updateUserInfo();
    fetchCartQuantity();

    // Event listeners
    window.addEventListener("userChanged", handleUserLogin);
    window.addEventListener("cartChanged", handleCartChanged);
    
    // Also listen for storage events
    window.addEventListener("storage", updateUserInfo);

    return () => {
      window.removeEventListener("userChanged", handleUserLogin);
      window.removeEventListener("cartChanged", handleCartChanged);
      window.removeEventListener("storage", updateUserInfo);
    };
  }, []);

  // Force update effect
  useEffect(() => {
    if (forceUpdate > 0) {
      updateUserInfo();
    }
  }, [forceUpdate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    setUserInfo(null);
    setCartQuantity(0);
    window.dispatchEvent(new CustomEvent("userChanged"));
    window.location.href = "/";
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.contact}>
            <FaPhoneAlt />
            <span>Hotline: 1800-1234</span>
          </div>
          <div className={styles.account}>
            {userInfo ? (
              <div className={styles.userMenu}>
                <span>Xin chào, {userInfo.fullName}</span>
                <AiOutlineDown />
                <div className={styles.dropdown}>
                  <Link to="/profile">Tài khoản</Link>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/auth/login">Đăng nhập</Link>
                <span>|</span>
                <Link to="/auth/register">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <Link to="/">S-SHOP</Link>
          </div>

          <div className={styles.navLinks}>
            <Link to="/products/all" className={styles.navLink}>
              Tất cả sản phẩm
            </Link>
            <Link to="/products/1" className={styles.navLink}>
              Nam
            </Link>
            <Link to="/products/2" className={styles.navLink}>
              Nữ
            </Link>
            <Link to="/products/3" className={styles.navLink}>
              Trẻ em
            </Link>
            <Link to="/products/4" className={styles.navLink}>
              Sale
            </Link>
          </div>

          <div className={styles.actions}>
            <Link to="/cart" className={styles.cartButton}>
              <FaShoppingCart />
              <span className={styles.cartBadge}>{cartQuantity}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;