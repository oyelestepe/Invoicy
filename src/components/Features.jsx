import React, { useEffect, useRef } from "react";
import { FaBolt } from "react-icons/fa6";
import { BiMailSend } from "react-icons/bi";
import { FaFileDownload } from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
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
          <FaBolt color="#e9cd44" />
        </div>
        <div className="feature-content">
          <h3>Easy to Use</h3>
          <p>Invoice creation process is completed in just a few steps.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon">
          <BiMailSend color="#4d80c4" />
        </div>
        <div className="feature-content">
          <h3>Send an E-mail</h3>
          <p>Send invoices via email with just one click.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon">
          <FaFileDownload color="#ff6347" />
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
