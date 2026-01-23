import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import Price from '../components/Price';
import UserCount from '../components/UserCount';
import CustomerReview from '../components/CustomerReview';
import ProblemSolution from '../components/ProblemSolution';
import WhoIsThisFor from '../components/WhoIsThisFor';
import InvoicePreview from '../components/InvoicePreview';
import FinalCTA from '../components/FinalCTA';
import Partners from '../components/Partners';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const heroRef = useRef(null);
  const floatingBgRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const priceRef = useRef(null);

  useEffect(() => {
    // Hero Section fade-in
    gsap.from(heroRef.current, {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: 'power2.out',
    });

    // Animate hero text from bottom
    const heroTexts = heroRef.current.querySelectorAll(
      '.hero-container h1, .hero-container p, .hero-container button'
    );
    gsap.fromTo(heroTexts, 
      { y: 60, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.5,
      }
    );

    // Floating gradient wave animation (moves gently left and right)
    gsap.to(floatingBgRef.current, {
      x: '+=60',
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Scroll-triggered sections
    const scrollAnimations = [
      { ref: featuresRef, y: 50 },
      { ref: priceRef, scale: 0.9 }, // Reduced scale effect for smoothness
      { ref: howItWorksRef, x: -50 },
    ];

    scrollAnimations.forEach(({ ref, ...anim }) => {
      gsap.fromTo(ref.current, 
        { autoAlpha: 0, ...anim },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
          },
        }
      );
    });
  }, []);

  return (
    <>
      <div className="hero-wrapper" ref={heroRef}>
        <div className="floating-bg" ref={floatingBgRef}></div>
        <Navbar />
        <HeroSection />
      </div>

      <Partners />

      <ProblemSolution />
      <WhoIsThisFor />
      <InvoicePreview />

      <div ref={featuresRef}>
        <Features />
      </div>

      <div ref={howItWorksRef}>
        <HowItWorks />
      </div>

      <UserCount />
      <CustomerReview />

      <div ref={priceRef}>
        <Price />
      </div>

      <FinalCTA />

      <Footer />
    </>
  );
}

export default LandingPage;