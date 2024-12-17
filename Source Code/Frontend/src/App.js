import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/LoginForm';
import SignUp from './components/auth/SignupForm';
import SystemDashboard from './components/SystemDashboard';
import StoreDashboard from './components/store owner dashboard/StoreDashboard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import ProductList from './components/pages/ProductList';
import './App.css';
import ProductDetails from './components/pages/ProductDetails';
import ShoppingList from './components/pages/ShoppingList';
import { UserProvider } from './components/contexts/UserContext';
import { ShoppingListProvider } from './components/contexts/ShoppingListContext';
import ProductPathfinding from './components/pathfinding/ProductPathfinding';
import ShoppingListPath from './components/pathfinding/ShoppingListPath';
const AppContent = () => {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/system-dashboard" element={<SystemDashboard />} />
        <Route path="/store-dashboard" element={<StoreDashboard />} />
        <Route path="/product-list" element={<ProductList />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/product-details/:productId" element={<ProductDetails />} />
        <Route path="/product-location/:productId" element={<ProductPathfinding />} />
        <Route path="/shopping-route" element={<ShoppingListPath />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <ShoppingListProvider>
          <AppContent />
        </ShoppingListProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
