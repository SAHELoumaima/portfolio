// About.js
import { useState, useEffect } from "react";
import API from "../api/axios";
import "./About.css";
import { FiGithub, FiPhone } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";
import { MdOutlineEmail, MdLocationOn, MdPhone, MdDescription } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { SiDiscord, SiX } from "react-icons/si"; // Changed from SiTwitter to SiX

function About() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicProfile();
  }, []);

  const fetchPublicProfile = async () => {
    try {
      const response = await API.get("/profile/public");
      console.log("Profile data:", response.data);
      setProfile(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
      
      // Fallback data based on your actual database
      setProfile({
        name: "SAHEL Oumaima",
        email: "oumaimasahel17@gmail.com",
        phone: "06871546259",
        certification: "web4jobs",
        description: "Building high-performance full-stack applications with TypeScript and modern web technologies. Focused on clean code and elegant user experiences.",
        jobTitle: "Full Stack Developer",
        location: "Tan-Tan, Morocco",
        bio: "Passionate full-stack developer with expertise in MERN stack. I love creating beautiful, responsive web applications that solve real-world problems.",
        profileImage: "/uploads/profiles/profile-6a1efd33af86bb44000a97dd-1780932052895.jpeg",
        resume: "/uploads/resumes/resume-6a1efd33af86bb44000a97dd-1780932758767.pdf",
        skills: ["React.js", "Node.js", "Express.js", "MongoDB", "JavaScript", "HTML/CSS", "Git", "REST APIs"],
        contactLinks: {
          email: "oumaimasahel17@gmail.com",
          github: "https://github.com/SAHELoumaima",
          linkedin: "https://www.linkedin.com/in/sahel-oumaima-b30535225",
          discord: "https://discord.gg/oumaima_sh",
          twitter: "",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/profile.jpeg";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  const getResumeUrl = (resumePath) => {
    if (!resumePath) return null;
    if (resumePath.startsWith("http")) return resumePath;
    return `http://localhost:3001${resumePath}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
        <button onClick={fetchPublicProfile} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="about-page mt-5">
      <div className="about-container">
        {/* Hero Section with Profile */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="profile-image-container">
              <img
                src={getImageUrl(profile?.profileImage)}
                alt={profile?.name || "Profile"}
                className="profile-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/profile.jpeg";
                }}
              />
            </div>
            <div className="hero-text">
              <h1 className="hero-name">{profile?.name || "SAHEL Oumaima"}</h1>
              <p className="hero-title">{profile?.jobTitle || "Full Stack Developer"}</p>
              {profile?.location && (
                <p className="hero-location">
                  <MdLocationOn className="inline-icon" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p className="about-paragraph">
                Hi, I'm <strong>{profile?.name?.split(' ')[0] || "Oumaima"}</strong>! 
                I'm a passionate <strong>{profile?.jobTitle || "Full Stack Developer"}</strong> 
                dedicated to building exceptional digital experiences.
              </p>
              {profile?.bio && (
                <p className="about-paragraph bio-text">{profile.bio}</p>
              )}
              {profile?.description && (
                <div className="description-box">
                  <MdDescription className="description-icon" />
                  <p>{profile.description}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Personal Info Grid */}
        <section className="about-section">
          <h2 className="section-title">Personal Info</h2>
          <div className="info-grid">
            {profile?.certification && (
              <div className="info-card">
                <div className="info-icon-wrapper">
                  <IoDocumentText className="info-icon" />
                </div>
                <div className="info-content">
                  <h3 className="info-label">Certification</h3>
                  <p className="info-value">{profile.certification}</p>
                </div>
              </div>
            )}
            
            {profile?.location && (
              <div className="info-card">
                <div className="info-icon-wrapper">
                  <MdLocationOn className="info-icon" />
                </div>
                <div className="info-content">
                  <h3 className="info-label">Location</h3>
                  <p className="info-value">{profile.location}</p>
                </div>
              </div>
            )}
            
            {profile?.email && (
              <div className="info-card">
                <div className="info-icon-wrapper">
                  <MdOutlineEmail className="info-icon" />
                </div>
                <div className="info-content">
                  <h3 className="info-label">Email</h3>
                  <p className="info-value">{profile.email}</p>
                </div>
              </div>
            )}
            
            {profile?.phone && (
              <div className="info-card">
                <div className="info-icon-wrapper">
                  <MdPhone className="info-icon" />
                </div>
                <div className="info-content">
                  <h3 className="info-label">Phone</h3>
                  <p className="info-value">{profile.phone}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section className="about-section">
          <h2 className="section-title">Tech Stack & Skills</h2>
          <div className="skills-container">
            {profile?.skills && profile.skills.length > 0 ? (
              <div className="skills-grid">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="skills-grid">
                <div className="skill-item">
                  <span className="skill-name">React.js</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Express.js</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">MongoDB</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">JavaScript</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">HTML/CSS</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-card">
            <p className="contact-description">
              Have a project in mind or just want to say hello? I'm always open 
              to discussing new ideas, collaborations, and opportunities.
            </p>

            <div className="contact-info">
              {profile?.contactLinks?.email && (
                <div className="contact-item">
                  <MdOutlineEmail className="contact-icon" />
                  <a href={`mailto:${profile.contactLinks.email}`} className="contact-link">
                    {profile.contactLinks.email}
                  </a>
                </div>
              )}

              {profile?.phone && (
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <a href={`tel:${profile.phone}`} className="contact-link">
                    {profile.phone}
                  </a>
                </div>
              )}

              {profile?.location && (
                <div className="contact-item">
                  <MdLocationOn className="contact-icon" />
                  <span className="contact-text">{profile.location}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="social-links">
              {profile?.contactLinks?.github && (
                <a
                  href={profile.contactLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link github"
                  aria-label="GitHub"
                >
                  <FiGithub />
                </a>
              )}

              {profile?.contactLinks?.linkedin && (
                <a
                  href={profile.contactLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
              )}

              {profile?.contactLinks?.discord && (
                <a
                  href={profile.contactLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link discord"
                  aria-label="Discord"
                >
                  <SiDiscord />
                </a>
              )}

            </div>

            {/* Download Resume Button */}
            {profile?.resume && (
              <div className="resume-section">
                <a
                  href={getResumeUrl(profile.resume)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-button"
                >
                  <IoDocumentText className="button-icon" />
                  Download Resume (PDF)
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;