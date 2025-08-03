import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import AuthService from "../../services/authService";
import { mergeCartAfterLogin } from "../../services/cartService";
import { useNavigate } from "react-router-dom";


import styles from "./Auth.module.css";
import UserService from "../../services/userService";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const res = await UserService.login(formData.email, formData.password);
      console.log("Login response:", res);
      
      // Xử lý response từ API đã cập nhật
      if (res.user) {
        // Lưu thông tin user từ API
        AuthService.saveUser(res.user);
        console.log("User data saved:", res.user);

        // Merge guest cart
        try {
          await mergeCartAfterLogin();
          console.log("Cart merged successfully after login");
        } catch (cartError) {
          console.error("Error merging cart after login:", cartError);
        }
        
        // Dispatch events
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("userChanged"));
          window.dispatchEvent(new CustomEvent("cartChanged"));
        }, 100);
        
        setMessage(res.message || "Đăng nhập thành công");
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        throw new Error("Không nhận được thông tin người dùng từ server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles["auth-container"]}>
      <div className={styles["auth-box"]}>
        <h2 className={styles["auth-title"]}>Đăng Nhập</h2>
        <p className={styles["auth-subtitle"]}>Vui lòng nhập thông tin đăng nhập của bạn</p>
        <form onSubmit={handleSubmit} className={styles["auth-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="email">Email</label>
            <div className={styles["input-container"]}>
              <FaEnvelope className={styles["input-icon"]} />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="password">Mật khẩu</label>
            <div className={styles["input-container"]}>
              <FaLock className={styles["input-icon"]} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles["toggle-password"]}
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className={styles["form-extras"]}>
            <div className={styles["remember-me"]}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={() => setRemember(!remember)}
                disabled={isLoading}
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>
            <a href="#" className={styles["forgot-password"]}>Quên mật khẩu?</a>
          </div>
          {message && <div className={styles["auth-success"]}>{message}</div>}
          {error && <div className={styles["auth-error"]}>{error}</div>}
          <button type="submit" className={styles["auth-button"]} disabled={isLoading}>
            {isLoading ? (
              <span className={styles["button-loading"]}>
                <FaSpinner className={styles["spinner"]} /> Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
          <div className={styles["auth-footer"]}>
            <p>Chưa có tài khoản? <a href="/register" className={styles["register-link"]}>Đăng ký ngay</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;