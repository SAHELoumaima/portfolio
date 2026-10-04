import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./projectsDetails.css"; // Nous allons créer ce fichier CSS

function ProjectsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/projects/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success && data.project) {
          setProject(data.project);
        } else {
          throw new Error("Project not found");
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  const handleImageError = () => {
    setImageErrors(prev => ({ ...prev, main: true }));
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="container py-5 text-center">
          <h2>Project Not Found</h2>
          <p className="text-muted">{error || "The project you're looking for doesn't exist."}</p>
          <button className="btn-back-to-projects" onClick={() => navigate("/projects")}>
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page bg-black">
      <div className="container bg-black">

        {/* Project Header */}
        <div className="project-header mt-5">
          <h1 className="project-title">{project.title}</h1>
          <p className="project-subtitle">{project.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="row g-5 mt-2">
          {/* Left Column: Image */}
          <div className="col-lg-6">
            <div className="project-image-card">
              {project.image && !imageErrors.main ? (
                <img
                  src={`http://localhost:3001${project.image}`}
                  alt={project.title}
                  className="project-main-image"
                  onError={handleImageError}
                />
              ) : (
                <div className="image-placeholder-large">
                  <span>📷 Project Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-lg-6">
            <div className="project-info-card">
              <div className="info-section">
                <h3 className="info-title">Overview</h3>
                <p className="info-text">{project.description}</p>
              </div>

              <div className="info-section">
                <h3 className="info-title">Key Achievements</h3>
                <ul className="achievements-list">
                  <li>Built with {project.technologies?.slice(0, 2).join(' and ') || 'modern'} technologies</li>
                  <li>Responsive and optimized for all devices</li>
                  <li>Clean, professional design with attention to detail</li>
                  {project.githubLink && <li>Open-source project available on GitHub</li>}
                </ul>
              </div>

              <div className="info-section">
                <h3 className="info-title">Tech Stack</h3>
                <div className="tech-badges-container">
                  {project.technologies && project.technologies.length > 0 ? (
                    project.technologies.map((tech, index) => (
                      <span key={index} className="tech-badge">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span className="tech-badge">Not specified</span>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3 className="info-title">Project Info</h3>
                <div className="project-meta-item">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">{formatDate(project.date)}</span>
                </div>
                <div className="project-meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`meta-value ${project.isVisible ? 'status-active' : 'status-inactive'}`}>
                    {project.isVisible ? 'Active / Public' : 'In Development'}
                  </span>
                </div>
              </div>

              {project.githubLink && (
                <div className="mt-4">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link-button"
                  >
                    View on GitHub →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectsDetails;

// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./projectsDetails.css";

// function ProjectsDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeImage, setActiveImage] = useState(null);

//   useEffect(() => {
//     const fetchProjectDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`http://localhost:3001/api/projects/${id}`);
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         if (data.success && data.project) {
//           setProject(data.project);
//           if (data.project.image) {
//             setActiveImage(`http://localhost:3001${data.project.image}`);
//           } else if (data.project.gallery && data.project.gallery.length > 0) {
//             setActiveImage(`http://localhost:3001${data.project.gallery[0]}`);
//           }
//         } else {
//           throw new Error("Project not found");
//         }
        
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching project:", err);
//         setError("Failed to load project details. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchProjectDetails();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="project-details-page">
//         <div className="container">
//           <div className="loading-container">
//             <div className="loader"></div>
//             <p>Loading project details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !project) {
//     return (
//       <div className="project-details-page">
//         <div className="container">
//           <div className="error-container">
//             <p className="error-message">{error || "Project not found"}</p>
//             <button onClick={() => navigate("/projects")} className="back-btn">
//               Back to Projects
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="project-details-page">
//       <div className="container">
//         <button onClick={() => navigate("/projects")} className="back-btn mb-4">
//           ← Back to Projects
//         </button>
        
//         <div className="project-details-card">
//           <div className="row">
//             {/* Image Gallery Section */}
//             <div className="col-md-6">
//               <div className="gallery-container">
//                 <div className="main-image">
//                   {activeImage ? (
//                     <img src={activeImage} alt={project.title} />
//                   ) : (
//                     <div className="image-placeholder">No Image Available</div>
//                   )}
//                 </div>
                
//                 {(project.gallery && project.gallery.length > 0) || project.image ? (
//                   <div className="thumbnail-gallery">
//                     {project.image && (
//                       <div 
//                         className={`thumbnail ${activeImage === `http://localhost:3001${project.image}` ? 'active' : ''}`}
//                         onClick={() => setActiveImage(`http://localhost:3001${project.image}`)}
//                       >
//                         <img src={`http://localhost:3001${project.image}`} alt="Main" />
//                       </div>
//                     )}
//                     {project.gallery && project.gallery.map((img, index) => (
//                       <div 
//                         key={index}
//                         className={`thumbnail ${activeImage === `http://localhost:3001${img}` ? 'active' : ''}`}
//                         onClick={() => setActiveImage(`http://localhost:3001${img}`)}
//                       >
//                         <img src={`http://localhost:3001${img}`} alt={`Gallery ${index + 1}`} />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="no-gallery">
//                     <p>No additional images available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Project Info Section */}
//             <div className="col-md-6">
//               <div className="project-info">
//                 <h1>{project.title}</h1>
                
//                 <div className="project-meta">
//                   {project.date && (
//                     <span className="project-date">
//                       📅 {new Date(project.date).toLocaleDateString()}
//                     </span>
//                   )}
//                 </div>
                
//                 <div className="project-description">
//                   <h3>Description</h3>
//                   <p>{project.description}</p>
//                 </div>
                
//                 {project.technologies && project.technologies.length > 0 && (
//                   <div className="project-technologies">
//                     <h3>Technologies Used</h3>
//                     <div className="tech-badges">
//                       {project.technologies.map((tech, index) => (
//                         <span key={index} className="tech-badge">
//                           {tech}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
                
//                 {project.githubLink && (
//                   <div className="project-links">
//                     <a 
//                       href={project.githubLink} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="github-link"
//                     >
//                       View on GitHub →
//                     </a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProjectsDetails;