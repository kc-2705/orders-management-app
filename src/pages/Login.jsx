import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/LoginRegister.css';
import { message } from 'antd';
import { DEMO_USER } from "../demoUser";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check user in localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
      message.success(`Welcome back, ${foundUser.name}!`);
      navigate("/home");
    } else {
      setError("Incorrect email or password.");
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setError("");
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <button type="button" className="demo-btn" onClick={fillDemo}>
        Use demo account
      </button>
      <div className="auth-links">
        <Link to="/register">Register</Link> | <Link to="/reset-password">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
