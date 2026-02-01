import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import IntroFlow from './pages/IntroFlow';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerify from './pages/auth/OTP';
import ConsumerDashboard from './pages/dashboard/ConsumerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Farmer Dashboard Components
import FarmerLayout from './pages/dashboard/farmer/Layout';
import DashboardHome from './pages/dashboard/farmer/Home';
import FarmerProfile from './pages/dashboard/farmer/Profile';
import ProductList from './pages/dashboard/farmer/products/ProductList';
import OrderList from './pages/dashboard/farmer/orders/OrderList';
import Inventory from './pages/dashboard/farmer/Inventory';
import Analytics from './pages/dashboard/farmer/Analytics';
import DeliveryManagement from './pages/dashboard/farmer/Delivery';
import Reviews from './pages/dashboard/farmer/Reviews';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="antialiased font-sans text-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-started" element={<IntroFlow />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verify" element={<OTPVerify />} />

          {/* Consumer Routes */}
          <Route path="/consumer" element={<ConsumerDashboard />} />

          {/* Farmer Routes */}
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="products" element={<ProductList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="delivery" element={<DeliveryManagement />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;