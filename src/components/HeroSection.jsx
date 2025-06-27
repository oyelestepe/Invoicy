import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroSection = () => {
  const heroTextRef = useRef(null);
  const heroButtonRef = useRef(null);

  useEffect(() => {
    gsap.from(heroTextRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power2.out',
    });

    gsap.from(heroButtonRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 0.5,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div className="hero-container">
      <h1 ref={heroTextRef}>Generate & Send Professional Invoices Instantly!</h1>
      <p>Tired of complicated invoicing? Generate professional invoices effortlessly, download them as PDF, or send them directly via email all in just a few clicks.</p>
      <div className="hero-buttons" ref={heroButtonRef}>
        <button className="cta-button">Generate an Invoice Now</button>
      </div>
    </div>
  );
};

export default HeroSection;