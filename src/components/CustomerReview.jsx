import React, { useEffect, useRef } from 'react';
import { FaStar } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reviews = [
    { 
      id: 1, 
      name: 'David Johnson', 
      review: 'This service exceeded my expectations! The interface is super easy to navigate, and everything works seamlessly. I’ve already recommended it to my colleagues.', 
      rating: 5, 
      profilePic: 'https://i.pravatar.cc/50?img=10' 
    },
    { 
      id: 2, 
      name: 'Emma Williams', 
      review: 'I was skeptical at first, but after using it for a few weeks, I’m completely sold. It saves me so much time, and the support team is incredibly helpful!', 
      rating: 4, 
      profilePic: 'https://i.pravatar.cc/50?img=20' 
    },
    { 
      id: 3, 
      name: 'Michael Anderson', 
      review: 'A fantastic tool that has improved my workflow significantly. It’s user-friendly and packed with great features. Highly recommended!', 
      rating: 5, 
      profilePic: 'https://i.pravatar.cc/50?img=30' 
    },
    { 
      id: 4, 
      name: 'Sophia Martinez', 
      review: 'I love how intuitive and well-designed this product is. It has made my daily tasks so much easier. Definitely a game-changer!', 
      rating: 5, 
      profilePic: 'https://i.pravatar.cc/50?img=40' 
    },
    { 
      id: 5, 
      name: 'James Brown', 
      review: 'At first, I didn’t think I needed this, but now I can’t imagine working without it. It has simplified so many things for me!', 
      rating: 4, 
      profilePic: 'https://i.pravatar.cc/50?img=50' 
    },
    { 
      id: 6, 
      name: 'Olivia Taylor', 
      review: 'An excellent product with a sleek design. It has made my work more efficient, and I truly appreciate the attention to detail.', 
      rating: 5, 
      profilePic: 'https://i.pravatar.cc/50?img=60' 
    }
  ];
  

const CustomerReview = () => {
  const reviewsContainerRef = useRef(null);

  useEffect(() => {
    gsap.from('.review-card', {
      opacity: 0,
      y: -50,
      rotation: () => (Math.random() - 0.5) * 20, 
      duration: 1,
      ease: 'power2.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: reviewsContainerRef.current,
        start: 'top 80%',
      },
    });
  }, []);

  return (
    <div className="customer-review-section">
      <div className="image-container">
        <img src="/bg-3.webp" alt="Background" className="background-image" />
      </div>
      <div className="reviews-container" ref={reviewsContainerRef}>
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <img src={review.profilePic} alt={`${review.name}'s profile`} className="profile-pic" />
            <h3>{review.name}</h3>
            <div className="stars">
              {[...Array(review.rating)].map((_, i) => (
                <FaStar key={i} color="#FFD700" />
              ))}
            </div>
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReview;
