import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './componentsCss/UserCount.css'

gsap.registerPlugin(ScrollTrigger);

const UserCount = () => {
  const sectionRef = useRef(null);
  const freelancerCountRef = useRef(null);
  const businessCountRef = useRef(null);

  useEffect(() => {
    // ScrollTrigger to animate counts when the section comes into view
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 80%', // Start animation when the section is 80% visible
      onEnter: () => {
        // Animate freelancer count
        const freelancerObj = { value: 0 };
        gsap.to(freelancerObj, {
          value: 10000,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            if (freelancerCountRef.current) {
              freelancerCountRef.current.innerText = Math.floor(freelancerObj.value).toLocaleString() + '+';
            }
          },
        });

        // Animate business count
        const businessObj = { value: 0 };
        gsap.to(businessObj, {
          value: 300,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            if (businessCountRef.current) {
              businessCountRef.current.innerText = Math.floor(businessObj.value).toLocaleString() + '+';
            }
          },
        });
      },
    });
  }, []);

  return (
    <div className="user-count-container" ref={sectionRef}>
      <div className="user-count-item">
        <h2 ref={freelancerCountRef}>0</h2>
        <p>freelancers are using our tool</p>
      </div>
      <div className="user-count-item">
        <h2 ref={businessCountRef}>0</h2>
        <p>small businesses trust us</p>
      </div>
    </div>
  );
};

export default UserCount;