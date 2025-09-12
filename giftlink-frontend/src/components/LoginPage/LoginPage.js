import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { urlConfig } from "../../config.js";
import { useAppContext } from "../../context/AuthContext.js";
import "./LoginPage.css";

const LoginPage = () => {
  // State variables for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [incorrectPassword, setIncorrectPassword] = useState(false);

  // Local variables from context and navigation
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setUserName } = useAppContext();
  const bearerToken = sessionStorage.getItem("bearer-token");

  // Check if user is already logged in
  if (bearerToken) {
    navigate("/app");
  }

  // Handle login function
  const handleLogin = async () => {
    setIncorrectPassword(false);

    try {
      const response = await fetch(`${urlConfig.backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        // Access data in JSON format as response from backend
        const data = await response.json();

        // Set user details in session storage
        sessionStorage.setItem("bearer-token", data.token);
        if (data.user) {
          sessionStorage.setItem("user-details", JSON.stringify(data.user));
          // Set the user's state using useAppContext
          setUserName(data.user.firstName || data.user.name || data.user.email);
        }

        // Set the user's state to log in using useAppContext
        setIsLoggedIn(true);

        // Navigate to MainPage after logging in
        navigate("/app");
      } else {
        // Clear input and set error message if password is incorrect
        setEmail("");
        setPassword("");
        setIncorrectPassword(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear input and set error message on network/server errors
      setEmail("");
      setPassword("");
      setIncorrectPassword(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">Welcome Back</h2>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {incorrectPassword && (
          <div className="error-message">
            Incorrect email or password. Please try again.
          </div>
        )}

        <button type="button" className="login-button" onClick={handleLogin}>
          Login
        </button>

        <div className="form-footer">
          <a href="#" className="forgot-password">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
