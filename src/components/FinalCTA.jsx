import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './componentsCss/FinalCTA.css';

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = () => {
    const ctaRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(ctaRef.current, 
            { scale: 0.9, autoAlpha: 0 },
            {
                scale: 1,
                autoAlpha: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: "top 85%",
                }
            }
        );
    }, []);

    return (
        <section className="final-cta-section">
            <div className="final-cta-container" ref={ctaRef}>
                <div className="cta-content">
                    <h2>Ready to Streamline Your Invoicing?</h2>
                    <p>Join thousands of freelancers and businesses getting paid faster.</p>
                    <button className="cta-button big-btn">Get Started for Free</button>
                    <p className="small-print">No credit card required • Cancel anytime</p>
                </div>
                <div className="cta-glow-bg"></div>
            </div>
        </section>
    );
};

export default FinalCTA;
