import React from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { useEffect } from 'react'
import { useState } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import './Footer.css'
import { API_BASE_URL } from '../config'

const baseUrl = API_BASE_URL

const Footer = () => {

  const [pageData, setPageData]=useState([]);

  useEffect(()=>{
    try{
        axios.get(baseUrl+'/pages/')
        .then((res)=>{
          setPageData(res.data)
        });
    }catch(error){
        console.log(error);
    }
  },[]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <footer className="footer-modern">
        <div className="footer-top">
          <div className="footer-container">
            <div className="footer-grid">
              
              {/* Brand Section */}
              <div className="footer-column footer-brand">
                <div className="brand-logo">
                  <svg className="brand-icon" width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5l12-2v13" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" stroke="url(#gradient)" strokeWidth="2"/>
                    <circle cx="18" cy="16" r="3" stroke="url(#gradient)" strokeWidth="2"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="100%" stopColor="#764ba2"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <h3>Sonara Music Academy</h3>
                </div>
                <p className="brand-description">
                  Premier online music learning platform connecting aspiring musicians with world-class instructors. Master your craft from anywhere.
                </p>
                <div className="social-links">
                  <a href="https://twitter.com/home?lang=en" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/channel/UCWBZgfmIVxElVuTxsboMGNg" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="footer-column">
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="footer-links">
                  <li>
                    <Link to="/aboutus" className="footer-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/all-courses" className="footer-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      All Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/policy" className="footer-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/policy" className="footer-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link to="/faq" className="footer-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      FAQs & Help
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="footer-column">
                <h4 className="footer-heading">Contact Us</h4>
                <ul className="footer-contact">
                  <li className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>K.T Marg Road, Vasai Road,<br/>Maharashtra, India</span>
                  </li>
                  <li className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <a href="tel:+919372575530">+91 9372575530</a>
                  </li>
                  <li className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href="mailto:learning.edu007@gmail.com">learning.edu007@gmail.com</a>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-container">
            <div className="footer-bottom-content">
              <div className="copyright">
                <p>&copy; 2024 <Link to="/">Sonara Music Academy</Link>. All Rights Reserved.</p>
              </div>
              <div className="footer-menu">
                <Link to="/" className="footer-menu-link">Home</Link>
                <Link to="/category" className="footer-menu-link">Category</Link>
                <Link to="/faq" className="footer-menu-link">FAQs</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button 
        onClick={scrollToTop}
        className="back-to-top"
        aria-label="Back to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </>
  )
}

export default Footer