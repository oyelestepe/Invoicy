import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../components/Navbar';
import './css/invoiceCreation.css';

const InvoiceCreation = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TL'); // Varsayılan olarak TL
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'customers', userId, 'invoices'), {
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount),
        currency,
        createdAt: serverTimestamp(),
        logoChoice: 'none',
        logoUrl: ''
      });
      alert('Fatura başarıyla kaydedildi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Fatura eklenirken hata:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="invoice-creation-container">
        <h2>Fatura Oluştur</h2>
        <form className="invoice-creation-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Müşteri İsmi" 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)} 
            required
          />
          <input 
            type="email" 
            placeholder="Müşteri E-posta" 
            value={clientEmail} 
            onChange={(e) => setClientEmail(e.target.value)} 
            required
          />
          <input 
            type="text" 
            placeholder="Hizmet Açıklaması" 
            value={serviceDescription} 
            onChange={(e) => setServiceDescription(e.target.value)} 
            required
          />
          <input 
            type="number" 
            placeholder="Tutar" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required
          />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
            <option value="TL">TL</option>
            <option value="USD">USD</option>
            <option value="Euro">Euro</option>
          </select>

          <button type="submit">Fatura Oluştur</button>
        </form>
      </div>
    </>
  );
};

export default InvoiceCreation;
