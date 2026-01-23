import React, { useEffect, useRef } from 'react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from 'gsap';
import './componentsCss/HowItWorks.css';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const stepsRef = useRef([]);

  useEffect(() => {
 gsap.from(stepsRef.current, {
  x: -80,
  y: 30,
  opacity: 0,
  duration: 1,
  stagger: 0.3,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".steps-wrapper",
    start: "top 80%"
  }
});



  }, []);

  return (
    <div className="how-it-works">
      <h2 className='how-it-works-title'>How It Works?</h2>
      <p className='how-it-works-subtitle'>
        Generate professional invoices effortlessly, download them as PDF, or send them directly via e-mail—all in just a few clicks.
      </p>

      <div className="steps-wrapper">
        {[
          { num: 1, title: "Sign Up", desc: "Create your account quickly." },
          { num: 2, title: "Create Your Invoice", desc: "Create your invoice by entering the required information." },
          { num: 3, title: "Download as PDF", desc: "You can download your invoice in PDF format and send it to your customer." },
          { num: 4, title: "Send with One Click", desc: "You can send your invoice via e-mail with one click." },
        ].map((step, index) => (
          <div
            className="step"
            key={index}
            ref={(el) => (stepsRef.current[index] = el)}
          >
            <h4 className='step-number'>{step.num}</h4>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
