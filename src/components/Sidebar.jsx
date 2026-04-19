import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to go back to (default: /admin or /)
  let backPath = "/admin";
  if (location.pathname.startsWith("/admin")) {
    backPath = "/";
  } else if (location.pathname.startsWith("/passenger/")) {
    backPath = "/admin/passengers";
  }

  return (
    <aside className="sidebar">
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 16}}>
        
      </div>
      <nav>
        <Link to="/">Arrivals/Departures</Link>
        {location.pathname.startsWith('/admin') ? (
          <>
            <Link to="/admin/flights">Flights</Link>
            <Link to="/admin/airports">Airports</Link>
            <Link to="/admin/airlines">Airlines</Link>
            <Link to="/admin/gates">Gates</Link>
            <Link to="/admin/aircraft">Aircraft</Link>
            <Link to="/admin/cities">Cities</Link>
            <Link to="/admin/passengers">Passengers</Link>
          </>
        ) : (
          <>
            <Link to="/flights">Flights</Link>
            <Link to="/airports">Airports</Link>
            <Link to="/airlines">Airlines</Link>
            <Link to="/gates">Gates</Link>
            <Link to="/aircraft">Aircraft</Link>
            <Link to="/cities">Cities</Link>
            <Link to="/passengers">Passengers</Link>
          </>
        )}
      </nav>
      <div className="sidebar-admin-box">
        <Link to="/admin" className="sidebar-admin-link">Admin Dashboard</Link>
      </div>
    </aside>
  );
};

export default Sidebar;
