import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout, loading } = useAuth();

  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false); // 👈 manage toggle state

  const logoutHandler = () => {
    logout();
    setExpanded(false); // close navbar on logout
    navigate("/login");
  };

  const toggleNavbar = () => {
    setExpanded((prev) => !prev);
  };

  const closeNavbar = () => {
    setExpanded(false);
  };
if (loading) return null;
  return (
    <nav className="navbar navbar-expand-lg bg-primary p-3" data-bs-theme="dark">
      <div className="container-fluid">
        {/* Brand */}
        <LinkContainer to="/" onClick={closeNavbar}>
          <Link className="navbar-brand">Social Media App</Link>
        </LinkContainer>

        {/* 👇 Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarColor02"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 👇 Collapsible content */}
        <div
          className={`collapse navbar-collapse ${expanded ? "show" : ""}`}
          id="navbarColor02"
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <LinkContainer to="/" onClick={closeNavbar}>
                <Link className="nav-link active">
                  Home <span className="visually-hidden">(current)</span>
                </Link>
              </LinkContainer>
            </li>

            {user && (
              <li className="nav-item">
                <LinkContainer to="/chats" onClick={closeNavbar}>
                  <Link className="nav-link">Chat</Link>
                </LinkContainer>
              </li>
            )}

            {/* Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {user ? `Welcome ${user.username}` : "Signin"}
              </Link>

              <div className="dropdown-menu">
                {!user ? (
                  <>
                    <LinkContainer to="/login" onClick={closeNavbar}>
                      <Link className="dropdown-item">Login</Link>
                    </LinkContainer>

                    <LinkContainer to="/signup" onClick={closeNavbar}>
                      <Link className="dropdown-item">SignUp</Link>
                    </LinkContainer>
                  </>
                ) : (
                  <>
                    <Link
                      className="dropdown-item"
                      onClick={logoutHandler}
                      style={{ cursor: "pointer" }}
                    >
                      Logout
                    </Link>

                    <div className="dropdown-divider"></div>

                    <LinkContainer to="/profile" onClick={closeNavbar}>
                      <Link className="dropdown-item">Profile</Link>
                    </LinkContainer>
                  </>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
