import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { urlConfig } from "../../config";
import { useAppContext } from "../../context/AuthContext";
import "./RegisterPage.css";

const RegisterPage = () => {
  // State variables for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get navigation and auth context
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useAppContext();

  // Handle registration function
  const handleRegister = async () => {
    try {
      setErrorMessage(""); // Clear any previous error messages

      const response = await fetch(`${urlConfig.backendUrl}/app/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (response.ok) {
        // Access data in JSON format from the backend
        const data = await response.json();
        console.log("Registration successful:", data);

        // Store user details in session storage
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          })
        );
        sessionStorage.setItem("authToken", data.authToken || data.token);

        // Set user details in context state
        setUserName(`${data.firstName} ${data.lastName}`);

        // Set user as logged in using useAppContext
        setIsLoggedIn(true);

        // Navigate to the MainPage after successful registration
        navigate("/app");
      } else {
        // Set error message if registration fails
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        "An error occurred during registration. Please try again."
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Create Account</h2>

        {errorMessage && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: "1rem" }}
          >
            {errorMessage}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>

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

        <button
          type="button"
          className="register-button"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
