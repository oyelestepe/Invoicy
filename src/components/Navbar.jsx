import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'));
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-invoice">Fatura Oluştur</Link>
      </div>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </nav>
  );
};

export default Navbar;