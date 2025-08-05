import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import styles from './Profile.module.css';
import UserService from '../../services/userService';
import { UserInfo } from '../../interfaces/User';


const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // Ưu tiên gọi API trước
      try {
        const userData = await UserService.getProfile();
        console.log('Profile loaded from API:', userData);
        
        if (userData) {
          setUserInfo(userData);
          // Cập nhật localStorage với dữ liệu mới
          AuthService.saveUser(userData);
         
          return; // Thành công thì return luôn
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        showToast('Không thể kết nối server, sử dụng dữ liệu offline', 'warning');
      }

      // Fallback: sử dụng localStorage nếu API thất bại
      const localUser = AuthService.getUser();
      console.log('Fallback to localStorage:', localUser);
      
      if (localUser) {
        setUserInfo(localUser);
      } else {
        showToast('Vui lòng đăng nhập để xem profile', 'warning');
        navigate('/login');
      }
      
    } catch (error) {
      console.error('Error loading user info:', error);
      showToast('Có lỗi khi tải thông tin người dùng', 'error');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      fullName: userInfo?.fullName || '',
      email: userInfo?.email || ''
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Gọi API để update user info
      // const updatedUser = await UserService.updateProfile(editForm);
      
      // Tạm thời update local storage
      const updatedUser = { ...userInfo, ...editForm };
      AuthService.saveUser(updatedUser);
     // setUserInfo(updatedUser);
      
      setIsEditing(false);
      showToast('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Có lỗi khi cập nhật thông tin', 'error');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    showToast('Đăng xuất thành công', 'success');
    navigate('/');
  };

  const testUserData = () => {
    const userData = AuthService.getUser();
    console.log('Current user data:', userData);
    
    if (!userData) {
      // Tạo user data mẫu để test
      const sampleUser = {
        userId: 9,
        fullName: "Huynh Lam",
        email: "21dh110017@st.huflit.edu.vn",
        phone: "0359930843",
        membershipTier: "STD",
        totalSpending: 4350000,
        role: "Customer",
        createdAt: "2025-07-23T03:06:03.258523",
        updatedAt: null
      };
      
      AuthService.saveUser(sampleUser);
      setUserInfo(sampleUser);
      showToast('Đã tạo user data mẫu', 'success');
    } else {
      showToast(`User data: ${userData ? 'Có' : 'Không có'}`, 'success');
    }
  };

  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không thể tải thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <h1>Thông tin cá nhân</h1>
        </div>
        
        <div className={styles.content}>
          <div className={styles.avatar}>
            <div className={styles.avatarPlaceholder}>
              {userInfo?.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 
               userInfo?.email ? userInfo.email.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.field}>
              <label>User ID:</label>
              <span>{userInfo?.userId || 'N/A'}</span>
            </div>

            <div className={styles.field}>
              <label>Email:</label>
              <span>{userInfo?.email || 'N/A'}</span>
            </div>

            <div className={styles.field}>
              <label>Họ và tên:</label>
              <span>{userInfo?.fullName || 'Chưa cập nhật'}</span>
            </div>

            <div className={styles.field}>
              <label>Số điện thoại:</label>
              <span>{userInfo?.phone || 'Chưa cập nhật'}</span>
            </div>

            <div className={styles.field}>
              <label>Hạng thành viên:</label>
              <span>
                {userInfo?.membershipTier === 'VIP' ? '👑 VIP' : 
                 userInfo?.membershipTier === 'STD' ? '👤 Tiêu chuẩn' : 
                 userInfo?.membershipTier || 'Chưa xác định'}
              </span>
            </div>

            <div className={styles.field}>
              <label>Tổng chi tiêu:</label>
              <span className={styles.spending}>
                {(userInfo?.totalSpending || 0).toLocaleString('vi-VN')}₫
              </span>
            </div>

            <div className={styles.field}>
              <label>Vai trò:</label>
              <span>{userInfo?.role || 'N/A'}</span>
            </div>

            <div className={styles.field}>
              <label>Ngày tham gia:</label>
              <span>
                {userInfo?.createdAt 
                  ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button onClick={handleSave} className={styles.saveButton}>
                  Lưu
                </button>
                <button onClick={handleCancel} className={styles.cancelButton}>
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button onClick={handleEdit} className={styles.editButton}>
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => navigate('/profile/orders')} 
                  className={styles.ordersButton}
                >
                  📦 Xem đơn hàng
                </button>
              </>
            )}
            
            <button onClick={handleLogout} className={styles.logoutButton}>
              Đăng xuất
            </button>
            
            <button onClick={testUserData} className={styles.editButton}>
              Test User Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;