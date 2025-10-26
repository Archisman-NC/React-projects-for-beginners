import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";
import { Home, Bookmark, BookOpen, User, Settings } from "lucide-react";
import { getUser } from "../utils/auth";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: User, label: "My Reviews", path: "/myreview" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Load user data from localStorage
    const user = getUser();
    setUserData(user);
    const handleUserUpdated = () => {
      const latest = getUser();
      setUserData(latest);
    };
    const handleStorage = (e) => {
      if (e.key === "bookr_user") {
        handleUserUpdated();
      }
    };
    window.addEventListener("user:updated", handleUserUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("user:updated", handleUserUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function handleClick(item) {
    navigate(item.path);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <BookOpen className="book-icon" />
          </div>
          <span className="logo-text">bookr</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label} className="nav-item">
                <button
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => handleClick(item)}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div
          className="user-info"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/profile")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/profile");
            }
          }}
          aria-label="Open profile"
        >
          <div className="avatar">
            <User className="avatar-icon" />
          </div>
          <div className="user-meta">
            <div className="user-name">{userData?.name || "Guest"}</div>
            <div className="user-handle">@{userData?.username || "guest"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
