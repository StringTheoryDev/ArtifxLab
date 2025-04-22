import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Notifications from './components/Notifications'; // Import the Notifications component

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import UsedItemsPage from './pages/UsedItemsPage';
import AddListingPage from './pages/AddListingPage';
import AdminDashboard from './pages/AdminDashboard'; // Import the AdminDashboard component

function App() {
  return (
    <CartProvider>
      <Router>
        <Notifications /> {/* Add Notifications above Router */}
        <Header />
        <main className="py-3">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/category/:categoryId" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/used-items" element={<UsedItemsPage />} />
            <Route path="/add-listing" element={<AddListingPage />} />
            <Route path="/admin" element={<AdminDashboard />} /> {/* Add the admin route */}
          </Routes>
        </main>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;