import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

function LandingPage() {
  return (
    <>
        <Navbar/>
        <HeroSection/>
        <Features/>
        <HowItWorks/>
        <Footer/>
    </>
  )
}

export default LandingPage