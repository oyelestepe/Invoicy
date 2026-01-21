import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './componentsCss/WhoIsThisFor.css';

gsap.registerPlugin(ScrollTrigger);

const WhoIsThisFor = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    gsap.fromTo(cardsRef.current, 
      { y: 50, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%', // Trigger slightly earlier
        },
      }
    );
  }, []);

  const audiences = [
    {
      title: 'Freelancers & Solo Pros',
      desc: 'Stop chasing payments. Create beautiful invoices that get you paid 2x faster, so you can focus on the work you love.',
      icon: '🎨',
    },
    {
      title: 'Startups & Agencies',
      desc: 'Scale your billing as you grow. Manage multiple clients, track revenue, and maintain a professional brand image.',
      icon: '🚀',
    },
    {
      title: 'Contractors & Consultants',
      desc: 'Bill for your time accurately. Present clear, itemized breakdowns that clients verify and pay without hesitation.',
      icon: '💼',
    },
  ];

  return (
    <section className="who-section" ref={sectionRef}>
      <div className="who-header">
        <h2>Who is Invoicy for?</h2>
        <p>Tailored for anyone who needs simple, beautiful billing.</p>
      </div>
      <div className="who-grid">
        {audiences.map((item, index) => (
          <div
            className="who-card"
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
          >
            <div className="who-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhoIsThisFor;
