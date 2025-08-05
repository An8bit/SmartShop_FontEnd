import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import AuthService from '../../services/authService';
import UserService from '../../services/userService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import { Order } from '../../interfaces/Payment';
import { UserInfo } from '../../interfaces/User';
import Header from '../../components/features/Header/Header';
import Footer from '../../components/common/Footer/Footer';
import styles from './OrdersPage.module.css';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userData = AuthService.getUser();
    if (!userData) {
      showToast('Vui lòng đăng nhập để xem đơn hàng', 'error');
      navigate('/auth/login');
      return;
    }
    
    loadUserProfile();
    loadOrders();
  }, [navigate, showToast]);

  const loadUserProfile = async () => {
    try {
      // Lấy dữ liệu từ localStorage trước
      const userData = AuthService.getUser();
      if (userData) {
        setUser(userData);
      }

      try {
        // Thử gọi API để cập nhật thông tin mới
        const response = await UserService.getProfile();
        console.log('User profile loaded:', response);
        if (response ) {
          setUser(response);
          AuthService.saveUser(response);
        }
      } catch (apiError) {
        console.log('API call failed, using localStorage data:', apiError);
        // Không hiển thị toast error ở đây vì đã có dữ liệu từ localStorage
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to localStorage data
      const userData = AuthService.getUser();
      if (userData) {
        setUser(userData);
      } else {
        showToast('Có lỗi khi tải thông tin người dùng', 'warning');
      }
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orderData = await PaymentService.getOrder();
      console.log('Loaded orders:', orderData);
      setOrders(orderData);
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Có lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (!reason) return;

    try {
      await PaymentService.cancelOrder(orderId, reason);
      showToast('Hủy đơn hàng thành công', 'success');
      loadOrders(); // Reload orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('Có lỗi khi hủy đơn hàng', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Chờ xử lý', className: styles.statusPending },
      Pending: { label: 'Chờ xử lý', className: styles.statusPending },
      confirmed: { label: 'Đã xác nhận', className: styles.statusConfirmed },
      processing: { label: 'Đang xử lý', className: styles.statusProcessing },
      shipped: { label: 'Đã gửi hàng', className: styles.statusShipped },
      delivered: { label: 'Đã giao hàng', className: styles.statusDelivered },
      cancelled: { label: 'Đã hủy', className: styles.statusCancelled },
    };

    const statusInfo = statusMap[status] || { label: status, className: styles.statusDefault };

    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      pending: { label: 'Chờ thanh toán', className: styles.paymentPending },
      completed: { label: 'Đã thanh toán', className: styles.paymentCompleted },
      failed: { label: 'Thanh toán thất bại', className: styles.paymentFailed },
      refunded: { label: 'Đã hoàn tiền', className: styles.paymentRefunded },
    };

    const statusInfo = statusMap[status] || { label: status, className: styles.paymentDefault };

    return (
      <span className={`${styles.paymentBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'Pending' || order.status === 'confirmed';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price: number | undefined) => {
    return (price || 0).toLocaleString('vi-VN') + '₫';
  };

  // Filter orders based on status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* User Header */}
        {user && (
          <div className={styles.userHeader}>
            <div className={styles.userInfo}>
              <h1>Đơn hàng của tôi</h1>
              <p>👋 Xin chào, <strong>{user.fullName || 'Người dùng'}</strong></p>
              <div className={styles.userStats}>
                <span className={styles.membershipBadge}>
                  {(user.membershipTier === 'VIP') ? '👑 VIP' : '👤 ' + (user.membershipTier || 'Thành viên')}
                </span>
                <span className={styles.spendingInfo}>
                  💰 Tổng chi tiêu: {(user.totalSpending || 0).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className={styles.backButton}
            >
              ← Quay lại trang cá nhân
            </button>
          </div>
        )}

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <h3>Lọc theo trạng thái:</h3>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              Tất cả ({orders.length})
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'pending' ? styles.active : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Chờ xử lý
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'confirmed' ? styles.active : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              Đã xác nhận
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'processing' ? styles.active : ''}`}
              onClick={() => setFilterStatus('processing')}
            >
              Đang xử lý
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'shipped' ? styles.active : ''}`}
              onClick={() => setFilterStatus('shipped')}
            >
              Đã gửi hàng
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'delivered' ? styles.active : ''}`}
              onClick={() => setFilterStatus('delivered')}
            >
              Đã giao hàng
            </button>
            <button 
              className={`${styles.filterButton} ${filterStatus === 'cancelled' ? styles.active : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Đã hủy
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>
              {filterStatus === 'all' 
                ? 'Chưa có đơn hàng nào' 
                : `Không có đơn hàng với trạng thái "${filterStatus}"`
              }
            </h3>
            <p>
              {filterStatus === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!' 
                : 'Thử thay đổi bộ lọc để xem các đơn hàng khác.'
              }
            </p>
            {filterStatus === 'all' ? (
              <button 
                onClick={() => navigate('/')}
                className={styles.shopButton}
              >
                Bắt đầu mua sắm
              </button>
            ) : (
              <button 
                onClick={() => setFilterStatus('all')}
                className={styles.showAllButton}
              >
                Xem tất cả đơn hàng
              </button>
            )}
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div key={order.orderId} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderNumber}>
                      #{order.orderNumber || `ORDER-${order.orderId}`}
                    </span>
                    <span className={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className={styles.orderStatus}>
                    {getStatusBadge(order.status)}
                    {order.paymentStatus && getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {(order.orderItems || order.items || []).slice(0, 2).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <h4>{item.productName || `Sản phẩm #${item.productId}`}</h4>
                        {item.variantName && <p>Phiên bản: {item.variantName}</p>}
                        <p>Số lượng: {item.quantity}</p>
                        <p>Đơn giá: {formatPrice(item.price)}</p>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                  {(order.orderItems || order.items || []).length > 2 && (
                    <div className={styles.moreItems}>
                      +{(order.orderItems || order.items || []).length - 2} sản phẩm khác
                    </div>
                  )}
                </div>

                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Phương thức thanh toán:</span>
                    <span>
                      {order.paymentMethod === 'bank_transfer' 
                        ? 'Chuyển khoản ngân hàng' 
                        : 'Thanh toán khi nhận hàng'}
                    </span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(order.totalAmount || order.total)}</span>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button 
                    onClick={() => handleViewOrderDetail(order)}
                    className={styles.detailButton}
                  >
                    Xem chi tiết
                  </button>
                  {canCancelOrder(order) && (
                    <button 
                      onClick={() => handleCancelOrder(order.orderId)}
                      className={styles.cancelButton}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => navigate(`/products/${(order.orderItems || order.items || [])[0]?.productId}/review`)}
                      className={styles.reviewButton}
                    >
                      Đánh giá
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/order-confirmation?orderId=${order.orderId}`)}
                    className={styles.viewConfirmationButton}
                  >
                    Xem xác nhận
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <div className={styles.modal} onClick={() => setShowOrderDetail(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Chi tiết đơn hàng #{selectedOrder.orderNumber || `ORDER-${selectedOrder.orderId}`}</h2>
                <button 
                  onClick={() => setShowOrderDetail(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.detailSection}>
                  <h3>Thông tin đơn hàng</h3>
                  <div className={styles.detailRow}>
                    <span>Mã đơn hàng:</span>
                    <span>#{selectedOrder.orderNumber || `ORDER-${selectedOrder.orderId}`}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Ngày đặt:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Trạng thái:</span>
                    <span>{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Thanh toán:</span>
                    <span>{selectedOrder.paymentStatus && getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Phương thức thanh toán:</span>
                    <span>
                      {selectedOrder.paymentMethod === 'bank_transfer' 
                        ? 'Chuyển khoản ngân hàng' 
                        : 'Thanh toán khi nhận hàng'}
                    </span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Địa chỉ giao hàng</h3>
                  <div className={styles.address}>
                    <p><strong>{selectedOrder.shippingAddress?.receiverName || 'Người nhận'}</strong></p>
                    <p>{selectedOrder.shippingAddress?.receiverPhone || 'Số điện thoại'}</p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Sản phẩm đã đặt</h3>
                  <div className={styles.itemsList}>
                    {(selectedOrder.orderItems || selectedOrder.items || []).map((item, index) => (
                      <div key={index} className={styles.detailItem}>
                        <div className={styles.itemInfo}>
                          <h4>{item.productName || `Sản phẩm #${item.productId}`}</h4>
                          {item.variantName && <p>Phiên bản: {item.variantName}</p>}
                          <p>Số lượng: {item.quantity}</p>
                          <p>Đơn giá: {formatPrice(item.price)}</p>
                        </div>
                        <div className={styles.itemTotal}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className={styles.detailSection}>
                    <h3>Ghi chú</h3>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}

                <div className={styles.detailSection}>
                  <h3>Tóm tắt thanh toán</h3>
                  <div className={styles.paymentSummary}>
                    <div className={styles.summaryRow}>
                      <span>Tạm tính:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Phí vận chuyển:</span>
                      <span>{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    {(selectedOrder.discount || 0) > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    {(selectedOrder.tax || 0) > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Thuế:</span>
                        <span>{formatPrice(selectedOrder.tax)}</span>
                      </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                      <span>Tổng cộng:</span>
                      <span>{formatPrice(selectedOrder.total || selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                {canCancelOrder(selectedOrder) && (
                  <button 
                    onClick={() => {
                      handleCancelOrder(selectedOrder.orderId);
                      setShowOrderDetail(false);
                    }}
                    className={styles.cancelButton}
                  >
                    Hủy đơn hàng
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/order-confirmation?orderId=${selectedOrder.orderId}`)}
                  className={styles.viewConfirmationButton}
                >
                  Xem trang xác nhận
                </button>
                <button 
                  onClick={() => setShowOrderDetail(false)}
                  className={styles.closeModalButton}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage;
