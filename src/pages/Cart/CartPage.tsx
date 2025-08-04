// Đạo Hữu: Trang giỏ hàng, hiển thị và thao tác với cartService

import React, { useEffect, useState } from "react";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../../services/cartService";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";
import Header from "../../components/features/Header/Header";
import Footer from "../../components/common/Footer/Footer";
import { useToast } from "../../components/common/Toast/ToastProvider";

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      console.log("Cart data received:", data);
      if (data && data.items) {
        console.log("First cart item:", data.items[0]);
      }
      setCart(data);
    } catch (err: any) {
      setError(err.message || "Lỗi lấy giỏ hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
    // Lắng nghe events để auto-refresh cart
    const handleCartChanged = () => {
      console.log("Cart changed event detected, refreshing cart...");
      fetchCart();
    };
    
    const handleUserChanged = () => {
      console.log("User changed event detected, refreshing cart...");
      // Delay một chút để đảm bảo merge cart hoàn tất
      setTimeout(() => {
        fetchCart();
      }, 500);
    };

    window.addEventListener("cartChanged", handleCartChanged);
    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("cartChanged", handleCartChanged);
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, []);

  const handleUpdate = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(cartItemId, quantity);
      await fetchCart();
      window.dispatchEvent(new CustomEvent("cartChanged"));
      showToast("Đã cập nhật số lượng sản phẩm", "success");
    } catch (err: any) {
      setError(err.message || "Lỗi cập nhật số lượng");
      showToast(err.message || "Lỗi cập nhật số lượng", "error");
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      await fetchCart();
      window.dispatchEvent(new CustomEvent("cartChanged"));
      showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
    } catch (err: any) {
      setError(err.message || "Lỗi xóa sản phẩm");
      showToast(err.message || "Lỗi xóa sản phẩm", "error");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
    
    try {
      await clearCart();
      await fetchCart();
      window.dispatchEvent(new CustomEvent("cartChanged"));
      showToast("Đã xóa toàn bộ giỏ hàng", "success");
    } catch (err: any) {
      setError(err.message || "Lỗi xóa giỏ hàng");
      showToast(err.message || "Lỗi xóa giỏ hàng", "error");
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className={styles["cart-container"]}>
        <div className={styles["loading"]}>
          <div className={styles["spinner"]}></div>
          <p>Đang tải giỏ hàng...</p>
        </div>
      </div>
      <Footer />
    </>
  );
  
  if (error) return (
    <>
      <Header />
      <div className={styles["cart-container"]}>
        <div className={styles["error"]}>
          <h3>❌ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchCart} className={styles["retry-btn"]}>Thử lại</button>
        </div>
      </div>
      <Footer />
    </>
  );
  
  if (!cart || !cart.items || cart.items.length === 0) {
    console.log("Empty cart condition:", { cart, hasItems: cart?.items?.length });
    return (
      <>
        <Header />
        <div className={styles["cart-container"]}>
          <div className={styles["empty-cart"]}>
            <div className={styles["empty-icon"]}>🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
            <button className={styles["continue-shopping"]} onClick={() => navigate("/products/all")}>
              Khám phá sản phẩm
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  console.log("Cart has items, rendering table. Total items:", cart.items.length);

  return (
    <>
      <Header />
      <div className={styles["cart-container"]}>
        <h2>🛍️ Giỏ hàng của bạn</h2>
      <table className={styles["cart-table"]}>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item: any) => {
            console.log("Rendering cart item:", item);
            
            // Sử dụng đúng cấu trúc từ Product interface
            const productName = item.product?.name || 
                               item.productName ||
                               "Sản phẩm";
                               
            const productImage = item.product?.imageUrl || 
                                 item.productImage ||
                                 "/images/default-product.svg";
                                 
            // Ưu tiên discountedPrice cho sản phẩm flashsale, sau đó price thông thường
            const unitPrice = item.product?.discountedPrice || 
                             item.product?.price || 
                             item.price || 
                             item.unitPrice ||
                             0;
                             
            const totalPrice = item.totalPrice || 
                              (item.quantity * unitPrice) ||
                              0;
                              
            // Hiển thị thông tin giảm giá nếu có
            const hasDiscount = item.product?.discountedPrice && 
                               item.product?.price && 
                               item.product.discountedPrice < item.product.price;
                              
            const variantText = item.variant ? 
                               `${item.variant.color} - ${item.variant.size}` : 
                               "";
            
            return (
            <tr key={item.cartItemId || item.id}>
              <td>
                <div className={styles["cart-product"]}>
                  <img 
                    src={productImage} 
                    alt={productName}
                    onError={(e) => {
                      e.currentTarget.src = "/images/default-product.svg";
                    }}
                  />
                  <div>
                    <span>{productName}</span>
                    {variantText && <small>Phân loại: {variantText}</small>}
                    {item.product?.categoryName && <small>Danh mục: {item.product.categoryName}</small>}
                  </div>
                </div>
              </td>
              <td>
                <div className={styles["price-info"]}>
                  {hasDiscount ? (
                    <div>
                      <div className={styles["discounted-price"]}>
                        {unitPrice?.toLocaleString()}₫
                        <span className={styles["flash-sale-badge"]}>FLASH SALE</span>
                      </div>
                      <div className={styles["original-price"]}>
                        <s>{item.product?.price?.toLocaleString()}₫</s>
                      </div>
                    </div>
                  ) : (
                    <span>{unitPrice?.toLocaleString()}₫</span>
                  )}
                </div>
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => handleUpdate(item.cartItemId || item.id, Number(e.target.value))}
                />
              </td>
              <td>{totalPrice?.toLocaleString()}₫</td>
              <td>
                <button onClick={() => handleRemove(item.cartItemId || item.id)}>Xóa</button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles["cart-summary"]}>
        <span>Tổng số lượng: {cart.totalQuantity || cart.totalItems || cart.items?.length || 0}</span>
        <span>Tổng tiền: {(cart.totalPrice || cart.totalAmount || 0)?.toLocaleString()}₫</span>
      </div>
        <div className={styles["cart-actions"]}>
          <button onClick={handleClear} className={styles["clear-btn"]}>
            🗑️ Xóa toàn bộ
          </button>
          <button onClick={() => navigate("/products/all")} className={styles["continue-btn"]}>
            🛍️ Tiếp tục mua sắm
          </button>
          <button 
            onClick={() => navigate("/checkout", { 
              state: { cartItems: cart?.items || [] } 
            })} 
            className={styles["checkout-btn"]}
            disabled={!cart?.items || cart.items.length === 0}
          >
            💳 Thanh toán
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};export default CartPage;
