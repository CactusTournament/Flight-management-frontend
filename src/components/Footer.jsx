import React from "react";
import "../index.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <span>&copy; {new Date().getFullYear()} Aviation Management System</span>
      <span style={{marginLeft: 16}}>
        Built with <span style={{color: '#ff7220', fontWeight: 600}}>React</span>
      </span>
    </div>
  </footer>
);

export default Footer;
