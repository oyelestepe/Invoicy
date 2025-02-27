import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/dashboard.css'; 

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      const q = query(
        collection(db, 'customers', userId, 'invoices'),
        orderBy('createdAt', 'desc')
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
    <>
      <Navbar />  
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <h2>Fatura Listesi</h2>
        <ul className="invoice-list">
          {invoices.map(invoice => (
            <li key={invoice.id} className="invoice-item">
              <strong>{invoice.clientName}</strong> - {invoice.amount} {invoice.currency}
              <br />
              <a href={`/invoice/${invoice.id}`}>Detaylar ve PDF İndir</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Dashboard;
