import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Đang tải",
  subtitle = "Chúng tôi đang chuẩn bị dữ liệu cho bạn...",
  fullScreen = true,
  backgroundColor = 'linear-gradient(135deg, #f4e1d2 0%, #ddb892 100%)'
}) => {
  const containerStyle = {
    minHeight: fullScreen ? '100vh' : '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: backgroundColor,
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(127, 85, 57, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '2rem'
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#b08968',
                borderRadius: '50%',
                animation: `loadingBounce 1.4s ease-in-out ${i * 0.16}s infinite both`
              }}
            />
          ))}
        </div>
        <h3 style={{
          color: '#7f5539',
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          {message}
        </h3>
        <p style={{
          color: '#b08968',
          fontSize: '0.9rem',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          {subtitle}
        </p>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loadingBounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `
      }} />
    </div>
  );
};

export default LoadingSpinner;
