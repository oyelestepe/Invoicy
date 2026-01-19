import React from 'react';
import './componentsCss/Partners.css';

const Partners = () => {
    // Placeholder logos: Using text logos for now as requested plan
    const partners = [
        "Stripe", "PayPal", "QuickBooks", "Xero", "FreshBooks", "Wave", "HubSpot", "Salesforce"
    ];

    return (
        <section className="partners-section">
            <div className="partners-title">
                <p>Trusted by industry leaders and partner companies</p>
            </div>
            
            <div className="logos-marquee">
                <div className="marquee-content">
                    {/* Duplicate list for seamless infinite scroll */}
                    {partners.map((partner, index) => (
                        <div className="partner-logo" key={`1-${index}`}>
                            <span>{partner}</span>
                        </div>
                    ))}
                    {partners.map((partner, index) => (
                        <div className="partner-logo" key={`2-${index}`}>
                            <span>{partner}</span>
                        </div>
                    ))}
                     {partners.map((partner, index) => (
                        <div className="partner-logo" key={`3-${index}`}>
                            <span>{partner}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Partners;
