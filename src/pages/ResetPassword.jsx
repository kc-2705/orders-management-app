import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import "../styles/LoginRegister.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: ask email, 2: reset pwd form
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find((u) => u.email === email);

    if (foundUser) {
      setError("");
      setStep(2);
    } else {
      // Redirect to register
      message.info("Email not found. Please register first.");
      navigate("/register");
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map((u) =>
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    message.success("Password updated. Please log in.");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      {step === 1 && (
        <>
          <h2>Reset Password</h2>
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <button type="submit" className="btn-primary">Submit</button>
          </form>
          <div className="auth-links">
            <Link to="/login">Back to Login</Link> | <Link to="/register">Register</Link>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Set New Password</h2>
          <form onSubmit={handlePasswordReset} className="auth-form">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="auth-input"
            />
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
