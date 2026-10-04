import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./add.css";

function AddProject() {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, isEditing } = location.state || {};

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    technologies: "",
    githubLink: "",
    isVisible: false,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [existingGallery, setExistingGallery] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    if (isEditing && project) {
      console.log("Loading project for editing:", project); // Debug

      setIsEditMode(true);
      setFormData({
        title: project.title || "",
        description: project.description || "",
        date: project.date ? project.date.split("T")[0] : "",
        technologies: Array.isArray(project.technologies)
          ? project.technologies.join(", ")
          : project.technologies || "",
        githubLink: project.githubLink || "",
        isVisible: project.isVisible ?? true,
      });

      // CORRECTION: Utiliser project.image directement (c'est une chaîne)
      const imageUrl = project.image
        ? `http://localhost:3001${project.image}`
        : "";

      setImagePreview(imageUrl);
      setExistingImage(project.image || "");

      // Sauvegarder la galerie existante
      if (project.gallery && Array.isArray(project.gallery)) {
        const galleryUrls = project.gallery.map(
          (img) => `http://localhost:3001${img}`,
        );
        setExistingGallery(galleryUrls);
      }
    }
  }, [project, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveGalleryImage = (index, isExisting = false) => {
    if (isExisting) {
      // Supprimer une image existante de la galerie
      const newExistingGallery = [...existingGallery];
      newExistingGallery.splice(index, 1);
      setExistingGallery(newExistingGallery);
    } else {
      // Supprimer une nouvelle image
      const newFiles = [...galleryFiles];
      newFiles.splice(index, 1);
      setGalleryFiles(newFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userInfo = localStorage.getItem("userInfo");

    if (!userInfo) {
      toast.error("You must be logged in");
      setLoading(false);
      navigate("/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(userInfo);
    } catch (error) {
      console.error("Error parsing user info:", error);
      toast.error("Session error. Please login again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const token = parsedUser.token;

    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const submitFormData = new FormData();

      // Ajouter les champs texte
      if (formData.title) submitFormData.append("title", formData.title);
      if (formData.description)
        submitFormData.append("description", formData.description);
      if (formData.githubLink)
        submitFormData.append("githubLink", formData.githubLink);
      if (formData.technologies)
        submitFormData.append("technologies", formData.technologies);
      if (formData.date) submitFormData.append("date", formData.date);
      submitFormData.append("isVisible", formData.isVisible);

      // Gérer l'image principale
      if (imageFile) {
        submitFormData.append("image", imageFile);
      } else if (!isEditMode && !imageFile) {
        toast.error("Main image is required");
        setLoading(false);
        return;
      }

      // Gérer les nouvelles images de la galerie
      galleryFiles.forEach((file) => {
        submitFormData.append("gallery", file);
      });

      // Pour l'édition, envoyer aussi les IDs des images à conserver/supprimer
      if (isEditMode && project) {
        submitFormData.append("projectId", project._id);

        // Envoyer les chemins des images existantes à conserver
        const existingImagePaths = existingGallery.map((url) =>
          url.replace("http://localhost:3001", ""),
        );
        submitFormData.append(
          "existingGallery",
          JSON.stringify(existingImagePaths),
        );
      }

      const endpoint = isEditMode
        ? `${API_URL}/projects/${project._id}`
        : `${API_URL}/projects`;

      const method = isEditMode ? "put" : "post";

      const response = await axios({
        method: method,
        url: endpoint,
        data: submitFormData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        isEditMode
          ? `Project "${formData.title}" updated successfully!`
          : `Project "${formData.title}" added successfully!`,
      );

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);

      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Cannot connect to backend server. Please make sure the server is running on port 3001",
        );
      } else if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please login again.");
          localStorage.removeItem("userInfo");
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response.status === 400) {
          const errorMessage =
            error.response.data.message ||
            "Invalid data. Please check your inputs.";
          toast.error(errorMessage);
        } else if (error.response.status === 413) {
          toast.error("File too large. Please upload smaller images.");
        } else {
          toast.error(
            error.response.data.message || "Server error. Please try again.",
          );
        }
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="add-project-container mt-5 bg-black">
      <div className="add-project-card">
        <h2 className="form-title">
          {isEditMode ? "Edit Project" : "Add New Project"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Main Image {!isEditMode && "*"}</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="form-control"
            />
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
                {isEditMode && (
                  <small className="text-muted d-block">
                    Current image shown. Upload new to replace.
                  </small>
                )}
              </div>
            )}
          </div>

          <div className="form-group">

            {/* Afficher les images existantes de la galerie */}
            {isEditMode && existingGallery.length > 0 && (
              <div className="mt-2">
                <small>Current gallery images:</small>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {existingGallery.map((img, index) => (
                    <div key={index} className="position-relative">
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index, true)}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Afficher les nouvelles images sélectionnées */}
            {galleryFiles.length > 0 && (
              <div className="mt-2">
                <small>New images to upload ({galleryFiles.length}):</small>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {Array.from(galleryFiles).map((file, index) => (
                    <div key={index} className="position-relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index, false)}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>GitHub Link</label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/username/project"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Technologies (comma separated)</label>
            <input
              type="text"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
              className="form-control"
            />
            <small>Example: React, Node.js, Express, MongoDB</small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={handleChange}
              />
              <span>Visible on Portfolio</span>
            </label>
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? "Processing..."
                : isEditMode
                  ? "Update Project"
                  : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;
