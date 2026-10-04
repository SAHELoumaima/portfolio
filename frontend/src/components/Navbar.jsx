import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "./Nav.css";
import { IoLogOut } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { MdManageAccounts } from "react-icons/md";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in whenever location changes (after login/register)
    checkUserLogin();
  }, [location]);

  const checkUserLogin = () => {
    const user = localStorage.getItem("userInfo");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // Handle both possible data structures
        const userData = parsedUser.user || parsedUser;
        console.log("User data in navbar:", userData); // For debugging

        // Check if user is admin (check both possible role locations)
        const userRole = userData.role || parsedUser.role;
        const isUserAdmin = userRole === "admin";

        console.log("Is admin:", isUserAdmin); // For debugging
        console.log("User role:", userRole); // For debugging

        setUserInfo(userData);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error parsing user info:", error);
        localStorage.removeItem("userInfo");
        setUserInfo(null);
        setIsAdmin(false);
      }
    } else {
      setUserInfo(null);
      setIsAdmin(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token"); // Remove token if stored separately
    setUserInfo(null);
    setIsAdmin(false);
    toast.success("Logged out successfully ✅");
    navigate("/login");
    handleLinkClick();
  };

  // Get the username from userInfo (handle different possible field names)
  const getUsername = () => {
    if (!userInfo) return "User";
    return (
      userInfo.username ||
      userInfo.name ||
      userInfo.email?.split("@")[0] ||
      "User"
    );
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container">
        {/* Logo */}
        <NavLink className="navbar-brand logo" to="/" onClick={handleLinkClick}>
          SAHEL Oumaima
        </NavLink>

        {/* Toggle button */}
        <button
          className={`
            border-none outline-none shadow-none focus:ring-0
            ${isOpen ? "bg-transparent" : "hover:bg-gray-100"} 
            navbar-toggler custom-toggler
          `}
          type="button"
          onClick={handleToggle}
          aria-label="Toggle navigation"
        >
          {isOpen ? (
            <span className="close-icon">✖</span>
          ) : (
            <span className="navbar-toggler-icon"></span>
          )}
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <div className="navbar-nav ms-auto nav-links">
            {/* PUBLIC PAGES - Visible to everyone */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={handleLinkClick}
            >
              Home
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={handleLinkClick}
            >
              Projects
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={handleLinkClick}
            >
              Aboute
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={handleLinkClick}
            >
              Contact
            </NavLink>

            {/* If user is NOT logged in - Show Login and Register */}
            {!userInfo && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={handleLinkClick}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={handleLinkClick}
                >
                  Register
                </NavLink>
              </>
            )}

            {/* If user IS logged in */}
            {userInfo && (
              <>
                {/* ADMIN PAGES - Only visible to admin users */}
                {isAdmin && (
                  <>
                    <NavLink
                      to="/admin/dashboard"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""} admin-link`
                      }
                      onClick={handleLinkClick}
                    >
                      Dashboard
                    </NavLink>

                    <NavLink
                      to="/admin/add-project"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""} admin-link`
                      }
                      onClick={handleLinkClick}
                    >
                      <IoMdAdd />
                      Projects
                    </NavLink>

                    <NavLink
                      to="/admin/edit-profile"
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""} admin-link`
                      }
                      onClick={handleLinkClick}
                    >
                      <MdManageAccounts />
                      Admin
                    </NavLink>
                  </>
                )}

                {/* Welcome message with username */}
                <span className="nav-link user-greeting">
                  👋{getUsername()}
                </span>

                {/* Logout button - Visible to all logged in users */}
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <IoLogOut /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
