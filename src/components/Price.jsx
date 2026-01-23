import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "./componentsCss/Price.css";

const Price = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(cardsRef.current, 
        { y: 50, autoAlpha: 0 },
        {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
            }
        }
    );
  }, []);

  const plans = [
    {
        name: "Lifetime Access",
        price: "$39.99",
        period: "/one-time",
        desc: "Pay once, own it forever. No monthly fees.",
        features: [
            "Unlimited Invoices", 
            "Unlimited Clients",
            "PDF Export & Emailing", 
            "Premium Dashboard",
            "Lifetime Updates",
            "24/7 Priority Support"
        ],
        cta: "Get Lifetime Access",
        highlight: true
    }
  ];

  return (
    <div className="price-container" ref={containerRef}>
      <div className="price-header">
        <h2 className="price-main-title">Simple, Transparent Pricing</h2>
        <p className="price-sub-desc">Choose the plan that fits your business needs.</p>
      </div>
      
      <div className="price-grid">
        {plans.map((plan, index) => (
            <div 
                key={index} 
                className={`price-card ${plan.highlight ? 'highlighted' : ''}`}
                ref={el => cardsRef.current[index] = el}
            >
                {plan.highlight && <div className="popular-badge">BEST VALUE</div>}
                <h3>{plan.name}</h3>
                <div className="price-amount">
                    {plan.price}<span className="period">{plan.period}</span>
                </div>
                <p className="plan-desc">{plan.desc}</p>
                
                <ul className="price-features-list">
                    {plan.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                    ))}
                </ul>
                
                <Link to="/pricing" className="price-btn-link">
                    <button className={`price-cta ${plan.highlight ? 'highlight-btn' : ''}`}>
                        {plan.cta}
                    </button>
                </Link>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Price;