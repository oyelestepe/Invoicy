import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./componentsCss/Feature.css";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    // Scroll animation for features
    gsap.fromTo(".feature", 
      { autoAlpha: 0, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 85%",
        },
      }
    );
  }, []);

  return (
    <div className="features-container" ref={featuresRef}>
      {/* Feature 1: Smart Dashboard */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>📊</span>
        </div>
        <div className="feature-content">
          <h3>Smart Dashboard</h3>
          <p>Track your revenue, pending payments, and monthly growth at a glance.</p>
        </div>
      </div>

      {/* Feature 2: Instant PDF */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>📄</span>
        </div>
        <div className="feature-content">
          <h3>Instant PDF Export</h3>
          <p>Generate professionally formatted PDF invoices with a single click.</p>
        </div>
      </div>

      {/* Feature 3: Email Sending */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>📧</span>
        </div>
        <div className="feature-content">
          <h3>Direct Emailing</h3>
          <p>Send invoices directly to your clients' inbox without leaving the app.</p>
        </div>
      </div>

      {/* Feature 4: Client Management */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>👥</span>
        </div>
        <div className="feature-content">
          <h3>Client Management</h3>
          <p>Save client details for faster recurring billing and organization.</p>
        </div>
      </div>

      {/* Feature 5: Secure Auth */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>🔒</span>
        </div>
        <div className="feature-content">
          <h3>Secure Data</h3>
          <p>Bank-level security ensuring your financial data is always protected.</p>
        </div>
      </div>

      {/* Feature 6: History */}
      <div className="feature">
        <div className="feature-icon">
          <span style={{ fontSize: '2.5rem' }}>📂</span>
        </div>
        <div className="feature-content">
          <h3>Invoice History</h3>
          <p>Keep a searchable archive of every invoice you've ever sent.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
