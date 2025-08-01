import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      case 'warning':
        return <FaExclamationCircle />;
      default:
        return <FaCheckCircle />;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {getIcon()}
      </div>
      <div className={styles.message}>
        {message}
      </div>
      <button className={styles.closeBtn} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
