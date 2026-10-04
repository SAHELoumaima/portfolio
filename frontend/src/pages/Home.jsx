import { useState, useEffect } from "react";
import "./home.css";
import { FiGithub, FiPhone } from "react-icons/fi";
import { FaLinkedinIn } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { FaDiscord } from "react-icons/fa6";

function Home() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicProfile(); // Appelez la fonction publique au lieu de fetchProfile
  }, []);

  // Nouvelle fonction pour récupérer le profil public (admin)
  const fetchPublicProfile = async () => {
    try {
      // Utilisez la nouvelle route publique
      const response = await API.get("/profile/public");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching public profile:", error);
      setError("Could not load profile data");
      
      // Gardez les données par défaut comme fallback
      setProfile({
        name: "SAHEL Oumaima",
        jobTitle: "FULL-STACK DEVELOPER",
        description: "Building high-performance full-stack applications with TypeScript and modern web technologies. Focused on clean code and elegant user experiences.",
        bio: "",
        profileImage: "",
        resume: "",
        contactLinks: {
          email: "oumaimasahel17@gmail.com",
          github: "https://github.com/SAHELoumaima",
          linkedin: "https://linkedin.com",
          twitter: "",
          discord: "",
        },
        phone: "+212649528710",
      });
    } finally {
      setLoading(false);
    }
  };

  // Si vous voulez aussi garder l'ancienne fonction pour les pages utilisateur
  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Reste du code identique...
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
      <section className="hero-container">
        <div className="hero-content">
          <div className="loading-spinner">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-container">
      <div className="hero-content">
        <div className="hero-text-section">
          <h1 className="text-text-white">
            Hi, I'm <span className="highlight">{profile?.name || "Guest"}</span>
          </h1>
          <h2 className="hero-subtitle">
            {profile?.jobTitle || "FULL-STACK DEVELOPER"}
          </h2>
          <p className="hero-description">
            {profile?.description || profile?.bio || "Welcome to my portfolio!"}
          </p>

          <div className="hero-buttons">
            <Link to="/projects" className="btn-link">
              <button className="btn-primary">View My Work</button>
            </Link>
            {profile?.resume && (
              <a 
                href={getResumeUrl(profile.resume)} 
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn-secondary">Download Resume</button>
              </a>
            )}
          </div>

          <div className="hero-socials">
            {profile?.contactLinks?.github && (
              <a 
                href={profile.contactLinks.github} 
                target="_blank" 
                rel="noreferrer"
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
                title="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            )}
            
            {profile?.contactLinks?.email && (
              <a 
                href={`mailto:${profile.contactLinks.email}`}
                title="Email"
              >
                <MdOutlineEmail />
              </a>
            )}
            
            {profile?.phone && (
              <a 
                href={`tel:${profile.phone}`}
                title="Phone"
              >
                <FiPhone />
              </a>
            )}

            {profile?.contactLinks?.discord && (
              <a 
                href={`https://discord.com/users/${profile.contactLinks.discord}`}
                target="_blank" 
                rel="noreferrer"
                title="Discord"
              >
                <FaDiscord />
              </a>
            )}
          </div>
        </div>

        <div className="hero-image-section">
          <div className="image-wrapper">
            <img 
              src={getImageUrl(profile?.profileImage)} 
              alt={profile?.name || "Profile"} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/profile.jpeg";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;