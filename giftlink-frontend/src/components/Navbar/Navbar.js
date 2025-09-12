import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, userName, setIsLoggedIn, setUserName } = useAppContext();

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");

    // Reset auth state
    setIsLoggedIn(false);
    setUserName("");

    // Navigate to home page
    navigate("/");
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">
        GiftLink
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          {/* Main navigation links */}
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/app">
              Gifts
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/search">
              Search
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav">
          {/* Authentication links */}
          {isLoggedIn ? (
            // Show logout button and username when logged in
            <>
              <li className="nav-item">
                <span className="nav-link">Welcome, {userName}</span>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={handleLogout}
                  style={{
                    border: "none",
                    background: "none",
                    padding: "0.5rem 1rem",
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Show login and register links when not logged in
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
