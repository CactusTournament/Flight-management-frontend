import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import DashboardStats from "../components/DashboardStats";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  if (auth?.role !== 'ADMIN') {
    return (
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'80vh'}}>
        <div style={{marginBottom: '1.5rem'}}>Not logged in as admin</div>
        <Link to="/" style={{color:'#1976d2', textDecoration:'underline'}}>Go Back</Link>
      </div>
    );
  }
  return (
    <div className="admin-dashboard-flex">
      <Sidebar />
      <div className="page-container">
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
        <div className="contents-holder">
          <DashboardStats />
          {/* Show logged in as admin under stats */}
          <div style={{marginBottom: 24, marginTop: 8, fontWeight: 500}}>
            Logged in as: Admin
          </div>
          <h2>Admin Dashboard</h2>
          <ul className="dashboard-links">
            <li><Link to="/admin/flights">Flights</Link></li>
            <li><Link to="/admin/aircraft">Aircraft</Link></li>
            <li><Link to="/admin/airlines">Airlines</Link></li>
            <li><Link to="/admin/gates">Gates</Link></li>
            <li><Link to="/admin/airports">Airports</Link></li>
            <li><Link to="/admin/cities">Cities</Link></li>
            <li><Link to="/admin/passengers">Passengers</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
