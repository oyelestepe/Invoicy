import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './componentsCss/ProblemSolution.css';

gsap.registerPlugin(ScrollTrigger);

const ProblemSolution = () => {
  const sectionRef = useRef(null);
  const problemRef = useRef(null);
  const solutionRef = useRef(null);

  useEffect(() => {
    // Animate Problem Section
    gsap.fromTo(
      problemRef.current,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: problemRef.current,
          start: 'top 80%',
        },
      }
    );

    // Animate Solution Section
    gsap.fromTo(
      solutionRef.current,
      { x: 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: solutionRef.current,
          start: 'top 80%',
        },
      }
    );
  }, []);

  return (
    <section className="problem-solution-section" ref={sectionRef}>
      <div className="ps-container">
        {/* Problem Side */}
        <div className="ps-card problem" ref={problemRef}>
          <div className="icon-wrapper problem-icon">
            <span role="img" aria-label="cross">❌</span>
          </div>
          <h3>The Struggle</h3>
          <p>
            Drowning in spreadsheets? chasing payments manually? Sending unformatted, unprofessional emails that get ignored?
          </p>
          <ul className="ps-list">
            <li>Manual data entry & errors</li>
            <li>Unprofessional templates</li>
            <li>Lost in email threads</li>
          </ul>
        </div>

        {/* Arrow / Transition */}
        <div className="ps-arrow">
            <span>➜</span>
        </div>

        {/* Solution Side */}
        <div className="ps-card solution" ref={solutionRef}>
          <div className="icon-wrapper solution-icon">
            <span role="img" aria-label="check">✨</span>
          </div>
          <h3>The Invoicy Solution</h3>
          <p>
            Create generated invoices in seconds. Look professional, get paid faster, and keep everything organized in one place.
          </p>
          <ul className="ps-list">
            <li>One-click generation</li>
            <li>Premium, customizable templates</li>
            <li>Instant email delivery</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
