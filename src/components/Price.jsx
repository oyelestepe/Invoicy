import React from 'react';
import { Link } from 'react-router-dom';

const Price = () => {
  return (
    <div className="price-section">
      <h2 className="price-title">One-Time Payment, Lifetime Access! 💥</h2>
      <p className="price-description">
      🚀 Unlock Unlimited Invoicing Power for Just <strong>$39.99</strong> No subscriptions, no hidden fees—just one payment for lifetime access to our premium tool.
      </p>
      <ul className="price-features">
        <li>✅ Generate Unlimited Invoices – Never worry about limits again!</li>
        <li>✅ Download as PDF & Send Instantly – Professional, ready-to-share invoices in seconds.</li>
        <li>✅ No Recurring Fees – Pay once, use forever—zero extra costs!</li>
        <li>✅ 24/7 Access – Create and manage invoices anytime, anywhere.</li>
      </ul>
      <div className="price-buttons">
        <Link to="/pricing">
          <button className="cta-button">Get Lifetime Access</button>
        </Link>
      </div>
    </div>
  );
};

export default Price;