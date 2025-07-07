import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import GoogleTranslateWidget from "./GoogleTranslateWidget";

const Navbar: React.FC = () => {
  const { userId, userData, logout } = useContext(AuthContext);
  const isAdmin = userData?.role === 'admin';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand me-auto" to="/">
        DSA Recommendation System
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
        <ul className="navbar-nav ms-auto align-items-center">
          {isAdmin ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                  Manage Users
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/questions">
                  Manage Questions
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light ms-2"
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
              <li className="nav-item ms-2">
                <button
                  className="btn btn-light"
                  id="chatbot-toggle-btn"
                  style={{ borderRadius: 20, fontWeight: 600 }}
                  onClick={() => {
                    const event = new CustomEvent('toggleChatbot');
                    window.dispatchEvent(event);
                  }}
                >
                  <span role="img" aria-label="chatbot"></span> Chatbot
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              {userId ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/initial-setup">
                      Initial Setup
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light ms-2"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              )}
              <li className="nav-item ms-2">
                <button
                  className="btn btn-light"
                  id="chatbot-toggle-btn"
                  style={{ borderRadius: 20, fontWeight: 600 }}
                  onClick={() => {
                    const event = new CustomEvent('toggleChatbot');
                    window.dispatchEvent(event);
                  }}
                >
                  <span role="img" aria-label="chatbot"></span> Chatbot
                </button>
              </li>
            </>
          )}
        </ul>
        <div className="ms-3">
          <GoogleTranslateWidget />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
