import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "./componentsCss/Price.css";

const Price = () => {
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
  const card = cardRef.current;

  const handleMouseMove = (e) => {
    const rect = card.getBoundingClientRect();
    const xAxis = (rect.width / 2 - (e.clientX - rect.left)) / 80;
    const yAxis = (rect.height / 2 - (e.clientY - rect.top)) / 80;

    gsap.to(card, {
      rotationY: -xAxis,
      rotationX: yAxis,
      scale: 1.03,
      transformPerspective: 600,
      transformOrigin: "center",
      ease: "power2.out",
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  card.addEventListener("mousemove", handleMouseMove);
  card.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    card.removeEventListener("mousemove", handleMouseMove);
    card.removeEventListener("mouseleave", handleMouseLeave);
  };
}, []);


  return (
    <div className="price-container" ref={containerRef}>
      <div className="price-section" ref={cardRef}>
        <h2 className="price-title">One-Time Payment, Lifetime Access! 💥</h2>
        <p className="price-description">
          🚀 Unlock Unlimited Invoicing Power for Just{" "}
          <strong>$39.99</strong> — No subscriptions, no hidden fees—just one
          payment for lifetime access to our premium tool.
        </p>
        <ul className="price-features">
          <li>✅ Generate Unlimited Invoices – Never worry about limits again!</li>
          <li>
            ✅ Download as PDF & Send Instantly – Professional, ready-to-share
            invoices in seconds.
          </li>
          <li>✅ No Recurring Fees – Pay once, use forever—zero extra costs!</li>
          <li>✅ 24/7 Access – Create and manage invoices anytime, anywhere.</li>
        </ul>
        <div className="price-buttons">
          <Link to="/pricing">
            <button className="cta-button">Get Lifetime Access</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Price;