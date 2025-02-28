import React from 'react';

const HowItWorks = () => {
  return (
    <div className="how-it-works">
      <h2>Nasıl Çalışır?</h2>
      <div className="step">
        <h3>1. Kaydol</h3>
        <p>Hızlı bir şekilde hesabınızı oluşturun.</p>
      </div>
      <div className="step">
        <h3>2. Faturanızı Oluşturun</h3>
        <p>Gerekli bilgileri girerek faturanızı oluşturun.</p>
      </div>
      <div className="step">
        <h3>3. PDF Olarak İndirin</h3>
        <p>Faturanızı PDF formatında indirip, müşterinize gönderebilirsiniz.</p>
      </div>
    </div>
  );
};

export default HowItWorks;
