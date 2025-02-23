import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceCreation from './pages/InvoiceCreation';
import Settings from './pages/Settings';
import SignUp from './pages/SignUp';
import InvoiceDetail from './pages/InvoiceDetail';
import ProtectedRoute from './pages/ProtectedRoute';
import { Buffer } from 'buffer';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create-invoice" element={<ProtectedRoute><InvoiceCreation /></ProtectedRoute>} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/invoice/:invoiceId" element={<InvoiceDetail />} />
    </Routes>
  </Router>
);
