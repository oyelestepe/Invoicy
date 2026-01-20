import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './componentsCss/InvoicePreview.css';

gsap.registerPlugin(ScrollTrigger);

const InvoicePreview = () => {
  const containerRef = useRef(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      invoiceRef.current,
      { rotateX: 20, y: 100, opacity: 0 },
      {
        rotateX: 0,
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
        }
      }
    );
  }, []);

  return (
    <section className="preview-section" ref={containerRef}>
      <div className="preview-text">
        <h2>Beautiful Invoices, Ready to Send</h2>
        <p>Your invoices reflect your brand. Make them count.</p>
      </div>

      <div className="invoice-mockup-wrapper">
        <div className="invoice-mockup" ref={invoiceRef}>
            {/* Header Mock - Matching Email Template */}
            <div className="inv-header">
                <div className="inv-header-content">
                    <div className="inv-top-row">
                        <span className="inv-label">TOTAL DUE</span>
                        <span className="inv-brand">INVOICY</span>
                    </div>
                    <div className="inv-main-row">
                        <span className="inv-amount">₺10.500,00</span>
                        <span className="inv-number">#INV-2026-001</span>
                    </div>
                </div>
            </div>
            
            {/* Body Mock */}
            <div className="inv-body">
                {/* Client & Dates Row */}
                <div className="inv-meta-row">
                    <div className="inv-meta-col">
                        <span className="inv-meta-label">CLIENT</span>
                        <span className="inv-meta-value">Acme Corp Ltd.</span>
                    </div>
                    <div className="inv-meta-col center">
                        <span className="inv-meta-label">INVOICE DATE</span>
                        <span className="inv-meta-value">18 Jan 2026</span>
                    </div>
                    <div className="inv-meta-col right">
                        <span className="inv-meta-label">DUE DATE</span>
                        <span className="inv-meta-value">25 Jan 2026</span>
                    </div>
                </div>

                {/* Description Table Mock */}
                <div className="inv-table">
                    <div className="inv-table-header">
                        <span>DESCRIPTION</span>
                        <span>AMOUNT</span>
                    </div>
                    <div className="inv-table-row">
                        <span>Web Development Services</span>
                        <span className="bold">₺10.500,00</span>
                    </div>
                </div>

                {/* Totals Mock */}
                <div className="inv-totals-section">
                    <div className="inv-total-row">
                        <span>Subtotal</span>
                        <span>₺10.500,00</span>
                    </div>
                    <div className="inv-total-row final">
                        <span>Total</span>
                        <span>₺10.500,00</span>
                    </div>
                </div>
            </div>
            {/* Footer Note */}
            <div className="inv-footer">
                <p>Thank you for your business!</p>
            </div>
        </div>
        
        {/* Glow effect behind */}
        <div className="preview-glow"></div>
      </div>
    </section>
  );
};

export default InvoicePreview;
