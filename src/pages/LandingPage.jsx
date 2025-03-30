import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import Price from '../components/Price';
import UserCount from '../components/UserCount';
import CustomerReview from '../components/CustomerReview';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const priceRef = useRef(null);

  useEffect(() => {
    // Hero Section Animation
    gsap.from(heroRef.current, {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: 'power2.out',
    });

    // Features Section Animation
    gsap.from(featuresRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
      },
    });

    // How It Works Section Animation
    gsap.from(howItWorksRef.current, {
      opacity: 0,
      x: -100,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: 'top 80%',
      },
    });

    // Price Section Animation
    gsap.from(priceRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: priceRef.current,
        start: 'top 80%',
      },
    });
  }, []);

  return (
    <>
      <Navbar />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <div ref={featuresRef}>
        <Features />
      </div>
      <div ref={priceRef}>
        <Price />
      </div>
      <UserCount />
      <CustomerReview />
      <div ref={howItWorksRef}>
        <HowItWorks />
      </div>
      <Footer />
    </>
  );
}

export default LandingPage;