import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./projects.css";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3001/api/projects?visibleOnly=true",
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.projects) {
          setProjects(data.projects);
        } else {
          throw new Error("Invalid data format received from server");
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleImageError = (projectId) => {
    setImageErrors((prev) => ({
      ...prev,
      [projectId]: true,
    }));
  };

  // VIEW PROJECT
  const viewProject = (project) => {
    navigate(`/project/${project._id}`, { state: project });
  };

  // Loading state
  if (loading) {
    return (
      <div className="projects-page">
        <div className="container">
          <div className="projects-header">
            <h1>My Projects</h1>
          </div>
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="projects-page">
        <div className="container">
          <div className="projects-header">
            <h1>My Projects</h1>
          </div>
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container">
        <div className="projects-header mt-5">
          <h1>My Projects</h1>
        </div>

        {projects.length === 0 ? (
          <div className="no-projects">
            <p>No projects found.</p>
          </div>
        ) : (
          <div className="row justify-content-center g-4">
            {projects.map((project) => (
              <div
                className="col-lg-3 col-sm-6 col-md-4 d-flex"
                key={project._id}
              >
                <div className="project-card w-100">
                  <div className="image-container">
                    {project.image && !imageErrors[project._id] ? (
                      <img
                        src={`http://localhost:3001${project.image}`}
                        alt={project.title}
                        onError={() => handleImageError(project._id)}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>📷 No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <h3>{project.title}</h3>
                    <p>
                      {project.description.length > 120
                        ? `${project.description.substring(0, 120)}...`
                        : project.description}
                    </p>

                    <div className="tech-stack">
                      {project.technologies &&
                        project.technologies
                          .slice(0, 4)
                          .map((tech, i) => <span key={i}>{tech}</span>)}
                      {project.technologies &&
                        project.technologies.length > 4 && (
                          <span>+{project.technologies.length - 4}</span>
                        )}
                    </div>

                    <button
                      className="view-btn"
                      onClick={() => viewProject(project)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
