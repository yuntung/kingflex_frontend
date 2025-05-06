import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import OrderForm from './components/OrderForm/OrderForm';
import Navbar from './components/Navbar/Navbar';
import ProductManagement from './components/ProductManagement/ProductManagement';
import { AuthProvider } from './components/auth/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<OrderForm />} />
              <Route 
          path="/admin/products" 
          element={
            <PrivateRoute adminOnly={true}>
              <ProductManagement />
            </PrivateRoute>
          } 
        />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;