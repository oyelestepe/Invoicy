import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Çıkış yaparken hata:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <img src="/logo.png" alt="Logo" className="navbar-logo" />
      </Link>      
      <ul className="navbar-links">
        <li><Link to="/">Anasayfa</Link></li>
        <li><Link to="/faq">FaQ</Link></li>        
        {isLoggedIn ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/create-invoice">Fatura Oluştur</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Çıkış Yap</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Giriş Yap</Link></li>
            <li><Link to="/register">Kayıt Ol</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;