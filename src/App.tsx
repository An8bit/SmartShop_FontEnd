import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/features/Header/Header';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProductPage from './pages/Product/ProductPage';
import ProductDetails from './pages/Product/ProductDetails';
import CartPage from './pages/Cart/CartPage';
import ProfilePage from './pages/Profile/Profile';
import OrdersPage from './pages/Profile/OrdersPage';
import { ToastProvider } from './components/common/Toast/ToastProvider';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderConfirmation from './pages/Checkout/OrderConfirmation';
import OrderHistory from './pages/Checkout/OrderHistory';
// import AdminPage from './pages/Admin/AdminPage'; // Có thể thêm sau


function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
    
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductPage sampleProducts={[]} />} />
          <Route path="/products/all" element={<ProductPage sampleProducts={[]} />} />
          <Route path="/products/:category" element={<ProductPage sampleProducts={[]} />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders" element={<OrdersPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-history" element={<OrderHistory />} />
          {/* <Route path="/admin" element={<AdminPage />} /> */}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
