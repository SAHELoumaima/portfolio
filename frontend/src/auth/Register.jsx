import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
      });
      toast.success("User created successfully ✅");
      setTimeout(() => {
        navigate("/login");
      }, 1000);

      console.log("REGISTER SUCCESS:", data);

      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong ❌");
      console.log("Register error:", error.response?.data || error.message);
    }
  };

  const submitAdminHandler = async (e) => {
  e.preventDefault();
  
  try {
    const { data } = await API.post("/auth/register-admin", {
      name,
      email,
      password,
      secretKey: "your_super_secret_key_here" // In production, get this from environment variable
    });
    toast.success("Admin created successfully ✅");
    // Handle success...
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong ❌");
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3>Create Account</h3>

        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
