import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Login from "./auth/Login";
import ProjectsDetails from "./pages/ProjectsDetails";
import Register from "./auth/Register";
import Dashboard from "./Admin/Dashboard";
import AddProject from "./Admin/AddProject";
import DetailsPro from "./Admin/DetailsPro";
import Footer from "./components/Footer";
import EditProfile from "./Admin/EditProfile";

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        {/* user */}
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:id" element={<ProjectsDetails />} />
        <Route path="/contact" element={<Contact />} />
        {/* Admin */}
        <Route path="/login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/edit-profile" element={<EditProfile />} />
        <Route path="/admin/add-project" element={<AddProject />} />
        <Route path="/admin/edit-project" element={<AddProject />} />
      </Routes>

      <Footer />

    </div>
  );
}

export default App;
