import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit, startAfter, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaTrash } from 'react-icons/fa';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import './css/dashboard.css';

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [userId, setUserId] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const pageSize = 10;

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

    if (currentPage > 1) {
      const previousPageQuery = query(
        collection(db, 'customers', userId, 'invoices'),
        orderBy('createdAt', 'desc'),
        limit((currentPage - 1) * pageSize)
      );
      const previousPageSnapshot = await getDocs(previousPageQuery);
      const lastDoc = previousPageSnapshot.docs[previousPageSnapshot.docs.length - 1];
      q = query(
        collection(db, 'customers', userId, 'invoices'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const invoiceData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setInvoices(invoiceData);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === pageSize);
    setLoading(false);
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

  const handleDelete = async () => {
    if (selectedInvoiceId) {
      try {
        await deleteDoc(doc(db, 'customers', userId, 'invoices', selectedInvoiceId));
        setOpen(false);
        setSelectedInvoiceId(null);
        setModalMessage('Invoice deleted successfully.');
        setModalOpen(true);
        // Refresh the invoice list
        if (invoices.length === 1 && currentPage > 1) {
          navigate(`?page=${currentPage - 1}`);
        } else {
          fetchInvoices();
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setModalMessage('An error occurred while deleting the invoice.');
        setModalOpen(true);
      }
    }
  };

  const handleClickOpen = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInvoiceId(null);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <h2>Invoice List</h2>
        <ul className="invoice-list">
          {invoices.map(invoice => (
            <li key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <strong>{invoice.clientName}</strong> - {invoice.amount} {invoice.currency}
                <br />
                <a href={`/invoice/${invoice.id}`}>Details and Download PDF</a>
              </div>
              <button onClick={() => handleClickOpen(invoice.id)} className="delete-button">
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
        {loading && <p>Loading...</p>}
        <div className="pagination-buttons">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
          <button onClick={handleNextPage} disabled={!hasMore}>Next</button>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Invoice"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this invoice?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Notification"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {modalMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Footer/>
    </>
  );
};

export default Dashboard;