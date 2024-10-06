import React from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import AddStoreOwner from './components/AddStoreOwner';
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

const App = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');


  return (
    <BrowserRouter>
        <Routes>
        <Route path="/login" element={<LoginForm />} />

        {/* Protected routes based on role */}
        <Route
          path="/admin/add-store-owner"
          element={token && role === 'admin' ? <AddStoreOwner /> : <Navigate to="/login" />}
        />
        <Route
          path="/store-owner/dashboard"
          element={token && role === 'store_owner' ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App