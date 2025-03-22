import React from 'react';
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="footer-container">
      <a href='#'><FaInstagram className='footer-icon'/></a>
      <a href='#'><FaXTwitter className='footer-icon'/></a>
      <a href='#'><FaLinkedin className='footer-icon'/></a>
      <a href='#'><FaYoutube className='footer-icon'/></a>
      <p>&copy; 2025 Invoice Generator. All rights reserved.</p>
    </div>
  );
};

export default Footer;
