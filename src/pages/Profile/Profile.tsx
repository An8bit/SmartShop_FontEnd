import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { useToast } from '../../components/common/Toast/ToastProvider';
import styles from './Profile.module.css';
import UserService from '../../services/userService';
import { UserInfo } from '../../interfaces/User';


const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    try {
      const user = AuthService.getUser();
      if (!user) {
        showToast('Vui lòng đăng nhập để xem profile', 'warning');
        navigate('/login');
        return;
      }
      
      setUserInfo(user);
      
    } catch (error) {
      console.error('Error loading user info:', error);
      showToast('Có lỗi khi tải thông tin người dùng', 'error');
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

            {/* <div className={styles.field}>
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              ) : (
                <span>{userInfo.email}</span>
              )}
            </div>

            <div className={styles.field}>
              <label>Họ và tên:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  className={styles.input}
                />
              ) : (
                <span>{userInfo.fullName || 'Chưa cập nhật'}</span>
              )}
            </div> */}
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
              <button onClick={handleEdit} className={styles.editButton}>
                Chỉnh sửa
              </button>
            )}
            
            <button onClick={handleLogout} className={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;