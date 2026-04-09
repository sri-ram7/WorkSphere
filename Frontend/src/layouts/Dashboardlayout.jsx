import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/navbar/navbar.jsx";
import "./Dashboardlayout.css";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/hero" || location.pathname === "/";

  return (
    <div className={`dashboard-container ${isHome ? "home-layout" : ""}`}>
      {!isHome && <Sidebar />}
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

