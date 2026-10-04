import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaEyeSlash, FaEye, FaUsersCog } from "react-icons/fa";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./dash.css";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userInfo);
    const userRole = parsedUser.user?.role || parsedUser.role;

    if (userRole !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    // Fetch projects
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await API.get("/projects");
      const projectsData = response.data.projects || response.data;
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const viewProject = (project) => {
    navigate(`/project/${project._id}`, { state: project });
  };

  const editProject = (project) => {
    navigate("/admin/edit-project", { state: { project, isEditing: true } });
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const userInfo = localStorage.getItem("userInfo");
        const parsedUser = JSON.parse(userInfo);
        const token = parsedUser.token;

        await API.delete(`/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Project deleted successfully");
        fetchProjects(); // Refresh the list
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete project",
        );
      }
    }
  };

  const toggleProjectVisibility = async (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    try {
      const userInfo = localStorage.getItem("userInfo");
      const parsedUser = JSON.parse(userInfo);
      const token = parsedUser.token;

      await API.put(
        `/projects/${projectId}`,
        { isVisible: !project.isVisible },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(
        `Project ${!project.isVisible ? "visible" : "hidden"} successfully`,
      );
      fetchProjects(); // Refresh the list
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project visibility");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container dashboard mt-5">
        <h2 className="title fw-bold text-center">Welcome to Admin Dashboard</h2>
        {/* HEADER */}
        <div className="dashboard-header">
          <NavLink className="project-btn" to="/admin/edit-profile">
            <FaUsersCog /> Admin Profile
          </NavLink>
          <div className="header-buttons">
            <button
              className="project-btn"
              onClick={() => navigate("/admin/add-project")}
            >
              + Add Project
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Date</th>
                <th>Details</th>
                <th>CRUD</th>
              </tr>
            </thead>

            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No projects yet. Click "Add Project" to create one.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project._id.slice(-6)}</td>
                    <td>{project.title}</td>
                    <td>{new Date(project.date).toLocaleDateString()}</td>

                    {/* VIEW */}
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => viewProject(project)}
                      >
                        View Details
                      </button>
                    </td>

                    {/* CRUD */}
                    <td className="edit-delete-actions">
                      <button
                        className="edit-btn"
                        onClick={() => editProject(project)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteProject(project._id)}
                      >
                        Delete
                      </button>

                      {/* SHOW / HIDE BUTTON */}
                      <span
                        className="visibility-icon"
                        onClick={() => toggleProjectVisibility(project._id)}
                      >
                        {project.isVisible ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <strong>Title:</strong> {selectedProject.title}
              </div>
              <div className="detail-item">
                <strong>Description:</strong> {selectedProject.description}
              </div>
              <div className="detail-item">
                <strong>Date:</strong>{" "}
                {new Date(selectedProject.date).toLocaleDateString()}
              </div>
              <div className="detail-item">
                <strong>Technologies:</strong>
                <div className="tech-list">
                  {selectedProject.technologies?.map((tech, idx) => (
                    <span key={idx} className="tech-badge">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              {selectedProject.githubLink && (
                <div className="detail-item">
                  <strong>GitHub:</strong>
                  <a
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedProject.githubLink}
                  </a>
                </div>
              )}
              <div className="detail-item">
                <strong>Status:</strong>
                <span
                  className={`status-badge ${selectedProject.isVisible ? "visible" : "hidden"}`}
                >
                  {selectedProject.isVisible ? "Visible" : "Hidden"}
                </span>
              </div>
              {selectedProject.image && (
                <div className="detail-item">
                  <strong>Image:</strong>
                  <img
                    src={selectedProject.image?.url || selectedProject.image}
                    alt={selectedProject.title}
                    className="project-image-preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
