import React from 'react';

const HowItWorks = () => {
  return (
    <div className="how-it-works">
      <h2 className='how-it-works-title'>How It Works?</h2>
      <p className='how-it-works-subtitle'>Generate professional invoices effortlessly, download them as PDF, or send them directly via e-mail—all in just a few clicks.</p>
      <div className="steps-wrapper">
        <div className="step">
        <h4 className='step-number'>1</h4>
          <h3>Sign Up</h3>
          <p>Create your account quickly.</p>
        </div>
        <div className="step">
          <h4 className='step-number'>2</h4>
          <h3>Create Your Invoice</h3>
          <p>Create your invoice by entering the required information.</p>
        </div>
        <div className="step">
          <h4 className='step-number'>3</h4>
          <h3>Download as PDF</h3>
          <p>You can download your invoice in PDF format and send it to your customer.</p>
        </div>
        <div className="step">
          <h4 className='step-number'>4</h4>
          <h3>Send with One Click</h3>
          <p>You can send your invoice via e-mail with one click.</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
