import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceCreation from './pages/InvoiceCreation';
import Register from './pages/Register';
import InvoiceDetails from './pages/InvoiceDetails';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import FaQ from './pages/FaQ';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create-invoice" element={<ProtectedRoute><InvoiceCreation /></ProtectedRoute>} />
      <Route path="/invoice/:invoiceId" element={<InvoiceDetails />} />
      <Route path='/faq' element={<FaQ />} />
      <Route path="/invoice/:invoiceId" element={<InvoiceDetails />} />
    </Routes>
  </Router>
  );
}

export default App;
