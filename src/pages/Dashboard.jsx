import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit, startAfter } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/dashboard.css';

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [userId, setUserId] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const pageSize = 15;

  // Get the current page from the query parameters
  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get('page') || '1', 10);

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
      fetchInvoices();
    }
  }, [userId, currentPage]);

  const fetchInvoices = async () => {
    setLoading(true);
    let q = query(
      collection(db, 'customers', userId, 'invoices'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (currentPage > 1 && lastVisible) {
      q = query(
        collection(db, 'customers', userId, 'invoices'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(pageSize)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoiceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(invoiceData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleNextPage = () => {
    if (hasMore) {
      navigate(`?page=${currentPage + 1}`);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      navigate(`?page=${currentPage - 1}`);
    }
  };

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
        {loading && <p>Loading...</p>}
        <div className="pagination-buttons">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
          <button onClick={handleNextPage} disabled={!hasMore}>Next</button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;