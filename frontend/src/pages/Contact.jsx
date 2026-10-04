// Contact.js
import { useState, useEffect } from "react";
import {
  FiMail,
  FiMapPin,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiGithub,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import API from "../api/axios";
import "./Contact.css";
import { FaLinkedinIn } from "react-icons/fa";

function Contact() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: "",
  });

  // Fetch profile data from backend
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
        email: "oumaimasahel17@gmail.com",
        location: "Tinghir, Morocco",
        contactLinks: {
          email: "oumaimasahel17@gmail.com",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission - UPDATED with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        loading: false,
        success: false,
        error: true,
        message: "Please fill in all fields",
      });
      setTimeout(
        () => setStatus((prev) => ({ ...prev, error: false, message: "" })),
        5000,
      );
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        loading: false,
        success: false,
        error: true,
        message: "Please enter a valid email address",
      });
      setTimeout(
        () => setStatus((prev) => ({ ...prev, error: false, message: "" })),
        5000,
      );
      return;
    }

    // Set loading state
    setStatus({
      loading: true,
      success: false,
      error: false,
      message: "Sending your message... Please wait.",
    });

    try {
      // Send data to backend
      const response = await fetch("http://localhost:3001/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `New Contact Form Message from ${formData.name}`,
          message: formData.message,
        }),
      });

      // Parse response
      const data = await response.json();

      if (response.ok && data.success) {
        // Success - show success message
        setStatus({
          loading: false,
          success: true,
          error: false,
          message:
            data.message ||
            "✅ Message sent successfully! I'll get back to you soon.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });

        // Auto-clear success message after 10 seconds
        setTimeout(() => {
          setStatus((prev) => ({
            ...prev,
            success: false,
            message: "",
          }));
        }, 10000);
      } else {
        // Server returned error
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Show error message
      let errorMessage = "Failed to send message. Please try again later.";

      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "❌ Cannot connect to server. Please check your internet connection or try again later.";
      } else if (error.message.includes("500")) {
        errorMessage = "❌ Server error. Please try again in a few moments.";
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      setStatus({
        loading: false,
        success: false,
        error: true,
        message: errorMessage,
      });

      // Auto-clear error message after 8 seconds
      setTimeout(() => {
        setStatus((prev) => ({
          ...prev,
          error: false,
          message: "",
        }));
      }, 8000);
    }
  };

  if (loading) {
    return (
      <div className="contact-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page bg-black">
      <div className=" bg-black">
        {/* Section Title */}
        <div className="contact-header">
          <h1>Contact Me</h1>
          <div className="header-underline"></div>
        </div>

        <div className="contact-grid">
          {/* Left Side - Contact Info */}
          <div className="contact-info-card">
            <h3>Let's Talk</h3>
            <p className="hero-description">
              {profile?.description ||
                profile?.bio ||
                "Welcome to my portfolio!"}
            </p>

            <div className="info-items">
              {/* Email - from backend */}
              <div className="info-item">
                <div className="info-icon email-icon">
                  <FiMail />
                </div>
                <div className="info-details">
                  <span className="info-label">EMAIL</span>
                  <a
                    href={`mailto:${profile?.contactLinks?.email || profile?.email}`}
                    className="info-value"
                  >
                    {profile?.contactLinks?.email ||
                      profile?.email ||
                      "oumaimasahel17@gmail.com"}
                  </a>
                </div>
              </div>

              {/* Location - from backend */}
              <div className="info-item">
                <div className="info-icon location-icon">
                  <FiMapPin />
                </div>
                <div className="info-details">
                  <span className="info-label">LOCATION</span>
                  <span className="info-value">
                    {profile?.location || "Morocco"}
                  </span>
                </div>
              </div>
            </div>

            {/* From Section - using profile name */}
            {/* Social Links Section */}
            <div className="social-links-section">
              {profile?.contactLinks?.github && (
                <a
                  href={profile.contactLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="info-icon location-icon"
                  title="GitHub"
                >
                  <FiGithub />
                </a>
              )}

              {profile?.contactLinks?.linkedin && (
                <a
                  href={profile.contactLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="info-icon location-icon"
                  title="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              )}
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="contact-form-card">
            <form onSubmit={handleSubmit}>
              {/* Status Messages - Enhanced with icons */}
              {status.success && (
                <div className="alert alert-success">
                  <FiCheckCircle className="alert-icon" />
                  {status.message}
                </div>
              )}
              {status.error && (
                <div className="alert alert-error">
                  <FiAlertCircle className="alert-icon" />
                  {status.message}
                </div>
              )}

              {/* NAME Field */}
              <div className="form-field">
                <label>NAME</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={status.loading}
                    required
                  />
                </div>
              </div>

              {/* EMAIL Field */}
              <div className="form-field">
                <label>EMAIL</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={status.loading}
                    required
                  />
                </div>
              </div>

              {/* MESSAGE Field */}
              <div className="form-field">
                <label>MESSAGE</label>
                <div className="input-wrapper">
                  <FiMessageSquare className="input-icon message-icon" />
                  <textarea
                    name="message"
                    placeholder="Tell me about your project..."
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={status.loading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={status.loading}
              >
                {status.loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Response Time Indicator */}
        <div className="response-time">
          <div className="status-dot"></div>
          <span>Usually responds within 24 hours</span>
        </div>
      </div>
    </div>
  );
}

export default Contact;
