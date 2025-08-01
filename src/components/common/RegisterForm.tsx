import React, { useState } from "react";
import styles from "./Auth.module.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không trùng khớp!");
      return;
    }
    setIsLoading(true);
    try {
      // Gọi API đăng ký
      const res = await (await import("../../services/userService")).default.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
      });
      setMessage(res.message || "Đăng ký thành công!");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["auth-container"]}>
      <div className={styles["auth-box"]}>
        <h2 className={styles["auth-title"]}>Đăng Ký</h2>
        <p className={styles["auth-subtitle"]}>Vui lòng nhập thông tin đăng ký của bạn</p>
        <form onSubmit={handleSubmit} className={styles["auth-form"]}>
          <div className={styles["form-group"]}>
            <label htmlFor="fullName">Họ và tên</label>
            <div className={styles["input-container"]}>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="email">Email</label>
            <div className={styles["input-container"]}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="phone">Số điện thoại</label>
            <div className={styles["input-container"]}>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="password">Mật khẩu</label>
            <div className={styles["input-container"]}>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles["form-group"]}>
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className={styles["input-container"]}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          {message && <div className={styles["auth-success"]}>{message}</div>}
          {error && <div className={styles["auth-error"]}>{error}</div>}
          <button type="submit" className={styles["auth-button"]} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
