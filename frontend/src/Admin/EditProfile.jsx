import React, { useState, useEffect } from "react";
import API from "../api/axios";
import {
  MdManageAccounts,
  MdAdd,
  MdDelete,
  MdAddAPhoto,
  MdEmail,
  MdWork,
} from "react-icons/md";
import "./EditProfile.css";
import { IoIosDocument, IoMdPerson } from "react-icons/io";
import { FaDiscord, FaGithub, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { TbFileDescriptionFilled } from "react-icons/tb";
import { RiGraduationCapFill } from "react-icons/ri";
import { PiLinkSimpleBold } from "react-icons/pi";
import { IoLogOut } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    certification: "",
    description: "",
    jobTitle: "",
    location: "",
    bio: "",
    skills: [],
    contactLinks: {
      email: "",
      github: "",
      linkedin: "",
      discord: "",
      twitter: "",
      other: {},
    },
  });

  const [newSkill, setNewSkill] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get("/profile");
      const user = response.data;

      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        certification: user.certification || "",
        description: user.description || "",
        jobTitle: user.jobTitle || "",
        location: user.location || "",
        bio: user.bio || "",
        skills: user.skills || [],
        contactLinks: {
          email: user.contactLinks?.email || "",
          github: user.contactLinks?.github || "",
          linkedin: user.contactLinks?.linkedin || "",
          discord: user.contactLinks?.discord || "",
          twitter: user.contactLinks?.twitter || "",
          other: user.contactLinks?.other || {},
        },
      });

      setProfileImage(user.profileImage || "");
      setResume(user.resume || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("isAdmin");
        navigate("/login");
      } else {
        setMessage({
          text: "Error loading profile",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "contactLinks" && child !== "other") {
        setFormData((prev) => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Update the handleFileUpload function
  const handleFileUpload = async (file, type) => {
    if (!file) {
      setMessage({ text: "❌ No file selected", type: "error" });
      return;
    }

    // Validate file size for resume (10MB)
    if (type === "resume" && file.size > 10 * 1024 * 1024) {
      setMessage({
        text: "❌ File size should be less than 10MB",
        type: "error",
      });
      return;
    }

    // Validate file type for resume
    if (type === "resume") {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          text: "❌ Please upload a PDF or Word document",
          type: "error",
        });
        return;
      }
    }

    const formDataFile = new FormData();
    formDataFile.append(type === "image" ? "image" : "resume", file);

    try {
      const endpoint =
        type === "image" ? "/profile/upload-image" : "/profile/upload-resume";

      console.log(`Uploading ${type} to:`, endpoint);
      console.log("File details:", file.name, file.type, file.size);

      const response = await API.post(endpoint, formDataFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", response.data);

      if (type === "image") {
        setProfileImage(response.data.imageUrl);
        setMessage({
          text: "✅ Profile image updated successfully",
          type: "success",
        });
      } else {
        setResume(response.data.resumeUrl);
        setMessage({ text: "✅ CV uploaded successfully!", type: "success" });
      }

      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "❌ Upload failed";
      if (error.response?.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      setMessage({ text: errorMessage, type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await API.post("/profile", formData);
      setMessage({ text: "✅ Profile updated successfully", type: "success" });

      // Mettre à jour localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (userInfo.user) {
        userInfo.user.name = formData.name;
        userInfo.user.email = formData.email;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }

      setTimeout(() => {
        setMessage({ text: "", type: "" });
        // Recharger la page pour voir les changements
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Update error:", error);
      setMessage({
        text: error.response?.data?.message || "❌ Update error",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container bg-black">
      <div className="profile-card">
        <div className="profile-header">
          <h1>
            <MdManageAccounts /> Edit Profile
          </h1>
          <button onClick={handleLogout} className="logout-btn">
            <IoLogOut /> Logout
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Photo */}
          <div className="form-group">
            <label>
              <MdAddAPhoto /> Profile Photo
            </label>
            <div className="image-upload">
              {profileImage ? (
                <div className="current-image">
                  <img
                    src={`http://localhost:3001${profileImage}`}
                    alt="Profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="placeholder-icon">
                    <MdAddAPhoto />
                  </div>
                  <p>No profile photo</p>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    Add Photo
                  </button>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], "image")}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <IoMdPerson /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MdEmail /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaPhoneAlt /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaLocationDot /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: New York, USA"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <MdWork /> Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Ex: Senior Full Stack Developer"
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="form-section">
            <h3>⚡ Skills & Expertise</h3>

            <div className="form-group">
              <label>Add Skills</label>
              <div className="skills-input-container">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Ex: React, Node.js, Python, MongoDB..."
                  className="skills-input"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="add-skill-btn"
                >
                  <MdAdd /> Add
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="skills-list">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="remove-skill"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio & Description */}
          <div className="form-section">
            <h3>
              <TbFileDescriptionFilled /> About
            </h3>

            <div className="form-group">
              <label>Bio (Short)</label>
              <input
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="A short bio about yourself"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Detailed description about yourself"
              />
            </div>
          </div>

          {/* Certifications */}
          <div className="form-section">
            <h3>
              <RiGraduationCapFill /> Certifications
            </h3>
            <div className="form-group">
              <label>Certifications</label>
              <input
                type="text"
                name="certification"
                value={formData.certification}
                onChange={handleInputChange}
                placeholder="Ex: AWS Certified, Google Cloud"
              />
            </div>
          </div>

          {/* Resume/CV */}
          <div className="form-section">
            <h3>
              <IoIosDocument /> Documents
            </h3>
            <div className="form-group">
              <label>CV / Resume</label>
              <div className="resume-section">
                {resume ? (
                  <div className="current-resume">
                    <a
                      href={`http://localhost:3001${resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      <IoIosDocument /> View Current CV
                    </a>
                    <button
                      type="button"
                      className="change-resume-btn"
                      onClick={() =>
                        document.getElementById("resumeInput").click()
                      }
                    >
                      Change CV
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="upload-resume-btn"
                    onClick={() =>
                      document.getElementById("resumeInput").click()
                    }
                  >
                    📤 Upload CV
                  </button>
                )}
                <input
                  id="resumeInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file, "resume");
                    }
                    e.target.value = ""; // Reset input
                  }}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="form-section">
            <h3>
              <PiLinkSimpleBold /> Social Links
            </h3>

            <div className="form-group">
              <label>
                <MdEmail /> Contact Email
              </label>
              <input
                type="email"
                name="contactLinks.email"
                value={formData.contactLinks.email}
                onChange={handleInputChange}
                placeholder="contact@email.com"
              />
            </div>

            <div className="form-group">
              <label>
                <FaLinkedin /> LinkedIn
              </label>
              <input
                type="url"
                name="contactLinks.linkedin"
                value={formData.contactLinks.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="form-group">
              <label>
                <FaGithub /> GitHub
              </label>
              <input
                type="url"
                name="contactLinks.github"
                value={formData.contactLinks.github}
                onChange={handleInputChange}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="form-group">
              <label>
                <FaDiscord /> Discord
              </label>
              <input
                type="text"
                name="contactLinks.discord"
                value={formData.contactLinks.discord}
                onChange={handleInputChange}
                placeholder="username#0000"
              />
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "💾 Saving..." : "💾 Save All Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
