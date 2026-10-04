import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./detailsPro.css";

function DetailsPro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);

        // Vérifiez d'abord que l'ID existe
        if (!id) {
          throw new Error("No project ID provided");
        }

        console.log("Fetching project with ID:", id); // Debug: voir l'ID

        const response = await fetch(
          `http://localhost:3001/api/projects/${id}`,
        );

        console.log("Response status:", response.status); // Debug: voir le status

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Project not found (${response.status})`);
        }

        const data = await response.json();
        console.log("Received data:", data); // Debug: voir les données

        if (data.success && data.project) {
          setProject(data.project);
        } else {
          throw new Error("Invalid data format from server");
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-white text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-white text-center mt-5">
        <h3>Error: {error || "No project found"}</h3>
        <p className="text-muted mt-2">Project ID: {id}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="details-page container">
      <h1 className="project-title">{project.title}</h1>
      <p className="project-subtitle">{project.description}</p>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="preview-card w-100">
            <img
              src={
                project.image
                  ? `http://localhost:3001${project.image}`
                  : "/default-image.jpg"
              }
              alt={project.title}
              className="responsive-img"
              onError={(e) => {
                e.target.src = "/default-image.jpg";
              }}
            />
          </div>

          {project.gallery && project.gallery.length > 0 && (
            <div className="mt-3">
              <h6 className="section-title">Project Gallery</h6>
              <div className="d-flex gap-2 flex-wrap">
                {project.gallery.map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:3001${img}`}
                    alt={`Gallery ${index + 1}`}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-6">
          <div className="side-card">
            <h6 className="section-title">Tech Stack</h6>
            <div className="d-flex flex-wrap gap-2">
              {project.technologies && project.technologies.length > 0 ? (
                project.technologies.map((tech, index) => (
                  <span key={index} className="badge-tech">
                    {tech}
                  </span>
                ))
              ) : (
                <span className="badge-tech">No tech stack specified</span>
              )}
            </div>

            <h6 className="section-title mt-4">Info</h6>
            <p>
              <b>Date:</b>{" "}
              {project.date
                ? new Date(project.date).toLocaleDateString()
                : "Not specified"}
            </p>
            <p>
              <b>Status:</b> {project.isVisible ? "Visible" : "Hidden"}
            </p>

            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-box mt-2"
              >
                View on GitHub 🔗
              </a>
            )}

            <button
              className="btn btn-outline-light w-100 mt-3"
              onClick={() => navigate("/admin/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="overview mt-5">
        <h4>Overview</h4>
        <p>{project.description}</p>
      </div>

      <div className="mt-4">
        <h4>Key Features</h4>
        {project.technologies && project.technologies.length > 0 ? (
          project.technologies.map((tech, index) => (
            <div key={index} className="achievement">
              ✔ Built with {tech}
            </div>
          ))
        ) : (
          <div className="achievement">No features listed</div>
        )}
      </div>
    </div>
  );
}

export default DetailsPro;
