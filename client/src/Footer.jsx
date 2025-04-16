import React from 'react';
import { FaTwitter, FaLinkedin, FaFacebook, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#111827', // Dark background
        color: '#d1d5db',           // Light text
        padding: '20px 0',
        marginTop: '40px',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Privacy or Copyright */}
        <p style={{ fontSize: '14px', margin: '10px 0' }}>
          © {new Date().getFullYear()} National Association of Counties. All rights reserved.
        </p>

        {/* Right: Social Icons */}
        <div style={{ display: 'flex', gap: '20px', margin: '10px 0' }}>
          <a
            href="https://twitter.com/NACoTweets"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1DA1F2')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <FaTwitter />
          </a>
          <a
            href="https://www.linkedin.com/company/nacodc"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0A66C2')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.facebook.com/NACoDC/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1877F2')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.youtube.com/NACoVideo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF0000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
