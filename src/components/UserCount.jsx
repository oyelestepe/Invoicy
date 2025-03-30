import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const UserCount = () => {
  const sectionRef = useRef(null);
  const freelancerCountRef = useRef(null);
  const businessCountRef = useRef(null);

  useEffect(() => {
    // ScrollTrigger to animate counts when the section comes into view
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%', // Start animation when the section is 80% visible
      onEnter: () => {
        // Animate the freelancer count
        gsap.fromTo(
          freelancerCountRef.current,
          { innerText: 0 },
          {
            innerText: 10000,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 }, // Snap to whole numbers
            onUpdate: function () {
              freelancerCountRef.current.innerText = Math.floor(this.targets()[0].innerText).toLocaleString() + '+';
            },
          }
        );

        // Animate the business count
        gsap.fromTo(
          businessCountRef.current,
          { innerText: 0 },
          {
            innerText: 300,
            duration: 2,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              businessCountRef.current.innerText = Math.floor(this.targets()[0].innerText).toLocaleString() + '+';
            },
          }
        );
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