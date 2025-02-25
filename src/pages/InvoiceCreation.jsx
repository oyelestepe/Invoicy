import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './css/invoiceCreation.css';

const InvoiceCreation = () => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      navigate('/login');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'invoices'), {
        userId,
        clientName,
        clientEmail,
        serviceDescription,
        amount: parseFloat(amount),
        createdAt: serverTimestamp()
      });
      alert('Fatura başarıyla kaydedildi!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Fatura eklenirken hata:', error);
    }
  };

  return (
    <div className="invoice-creation-container">
      <h1>Fatura Oluştur</h1>
      <form className="invoice-form" onSubmit={handleSubmit}>
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
        <button type="submit">Fatura Oluştur</button>
      </form>
    </div>
  );
};

export default InvoiceCreation;