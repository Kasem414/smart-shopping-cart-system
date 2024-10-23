import React from 'react';
import Login from './components/LoginForm';
import SignUp from './components/SignupForm';
import SystemDashboard from './components/SystemDashboard';
import ProductsCatalog from './components/ProductCatalog';
import StoreDashboard from './components/store owner dashboard/StoreDashboard';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/system-dashboard" element={<SystemDashboard />} />
        <Route path="/products-catalog" element={<ProductsCatalog />} />
        <Route path="/store-dashboard" element={<StoreDashboard />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
