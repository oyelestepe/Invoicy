import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './css/dashboard.css'; 

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      navigate('/login');
    }
  });

  const handleLogout = async () => {
    await signOut(auth);
    alert('Çıkış yapıldı.');
    window.location.href = '/login';
  };

  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', userId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const invoiceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInvoices(invoiceData);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>
      <h2>Fatura Listesi</h2>
      <ul className="invoice-list">
        {invoices.map(invoice => (
          <li key={invoice.id} className="invoice-item">
            <strong>{invoice.clientName}</strong> - {invoice.amount} TL
            <br />
            <a href={`/invoice/${invoice.id}`}>Detaylar ve PDF İndir</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;