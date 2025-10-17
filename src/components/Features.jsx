import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./componentsCss/Feature.css";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    // Scroll animation for features
    gsap.from(".feature", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
    });
  }, []);

  return (
    <div className="features-container" ref={featuresRef}>
      <div className="feature">
        <div className="feature-icon">
         <img 
          src="/videos/lightning.gif" 
          alt="Lightning" 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }} 
        />
        </div>
        <div className="feature-content">
          <h3>Easy to Use</h3>
          <p>Invoice creation process is completed in just a few steps.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon" ref={(el) => (iconRefs.current[1] = el)}>
          <img 
            src="/videos/mail.gif" 
            alt="Lightning" 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }} 
          />
        </div>
        <div className="feature-content">
          <h3>Send an E-mail</h3>
          <p>Send invoices via email with just one click.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon" ref={(el) => (iconRefs.current[2] = el)}>
          <img 
            src="/videos/pdf.gif" 
            alt="Lightning" 
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
            }} 
          />
        </div>
        <div className="feature-content">
          <h3>Download as PDF</h3>
          <p>Easily download your invoices in PDF format.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
