import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/LoginRegister.css';
import { message } from 'antd';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [role, setRole] = useState("user");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.email === email)) {
      message.error('An account with this email already exists. Please log in.')
      return;
    }

    const newUser = { email, password, role, phone, name: email.split("@")[0] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    message.success('Registered successfully. Please log in.');
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          required
          className="auth-input"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="auth-input"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="auth-input"
          pattern="^\+?[0-9]{7,15}$"
          title="Enter valid phone number"
        />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn-primary">Register</button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default Register;
