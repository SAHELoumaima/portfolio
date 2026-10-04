// Footer.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiPhone } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { FaDiscord } from "react-icons/fa6";
import API from "../api/axios";
import "./Footer.css";

function Footer() {
  const [profile, setProfile] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchPublicProfile();
  }, []);

  const fetchPublicProfile = async () => {
    try {
      const response = await API.get("/profile/public");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching public profile:", error);
      // Fallback data
      setProfile({
        name: "SAHEL Oumaima",
        location: "Tan-Tan, Morocco",
        email: "oumaimasahel17@gmail.com",
        phone: "+212649528710",
        contactLinks: {
          github: "https://github.com/SAHELoumaima",
          linkedin: "https://www.linkedin.com/in/sahel-oumaima-b30535225",
          email: "oumaimasahel17@gmail.com",
          discord: "https://discord.gg/oumaima_sh",
        },
        description: "Passionate developer creating amazing web experiences with modern technologies. Let's build something great together!"
      });
    }
  };

  return (
    <footer className="footer bg-black">
      <div className="container bg-black">
        {/* First Row - 3 columns */}
        <div className="row">
          {/* About Section */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-section">
              <h5 className="footer-title">About Me</h5>
              <p className="footer-text">
                {profile?.description || "Passionate developer creating amazing web experiences with modern technologies. Let's build something great together!"}
              </p>
              <div className="social-links">
                {profile?.contactLinks?.github && (
                  <a
                    href={profile.contactLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="GitHub"
                  >
                    <FiGithub /> GitHub
                  </a>
                )}
                {profile?.contactLinks?.linkedin && (
                  <a
                    href={profile.contactLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn /> LinkedIn
                  </a>
                )}
                {profile?.contactLinks?.email && (
                  <a
                    href={`mailto:${profile.contactLinks.email}`}
                    className="social-icon"
                    aria-label="Email"
                  >
                    <MdOutlineEmail /> Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="footer-section">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/projects">Projects</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Section - Dynamic from backend */}
          <div className="col-12 col-md-12 col-lg-4">
            <div className="footer-section">
              <h5 className="footer-title">Contact Info</h5>
              <div className="contact-info">
                {profile?.location && (
                  <p>
                    <MdLocationOn /> {profile.location}
                  </p>
                )}
                {profile?.contactLinks?.email && (
                  <p>
                    <MdOutlineEmail /> 
                    <a href={`mailto:${profile.contactLinks.email}`}>
                      {profile.contactLinks.email}
                    </a>
                  </p>
                )}
                {profile?.phone && (
                  <p>
                    <FiPhone /> 
                    <a href={`tel:${profile.phone}`}>
                      {profile.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom bg-black">
          <div className="container">
            <p className="text-center mb-0">
              © {currentYear} {profile?.name || "SAHEL Oumaima"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;