import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";


const PassengerProfilePage = () => {
    const navigate = useNavigate();
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        // If on /profile, fetch /me for current user info
        if (!id) {
          const data = await apiFetch("http://localhost:8080/me", auth);
          setProfile({
            firstName: data.firstName || data.username || "",
            lastName: data.lastName || "",
            email: data.email || (data.username ? `${data.username}@example.com` : ""),
            phoneNumber: data.phoneNumber || "",
            id: data.id || data.username || ""
          });
        } else {
          // If on /passenger/:id, fetch that passenger
          const data = await apiFetch(`http://localhost:8080/passengers/${id}`, auth);
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            id: data.id || ""
          });
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, auth]);

  if (loading) return (<><Navbar /><div className="page-container">Loading...</div></>);
  if (error) return (<><Navbar /><div className="page-container" style={{color:'red'}}>{error}</div></>);
  if (!profile) return (<><Navbar /><div className="page-container">Profile not found.</div></>);

  return (
    <>
      <Navbar />
      <div style={{display: 'flex'}}>
        <Sidebar />
        <div className="page-container" style={{maxWidth: 500, margin: '40px auto 0'}}>
          <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
          <div className="contents-holder">
            <div className="profile-card">
              <h2>Profile</h2>
              <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
                {/* White square for profile picture */}
                <div style={{width: 100, height: 100, background: '#fff', border: '2px solid #ccc', borderRadius: 8}}></div>
                <div>
                  <div style={{fontWeight: 600}}>{profile.firstName} {profile.lastName}</div>
                  <div style={{color: '#888'}}>ID: {profile.id}</div>
                </div>
              </div>
              <div style={{marginBottom: 16}}><strong>Email:</strong> {profile.email || <span style={{color:'#aaa'}}>N/A</span>}</div>
              <div style={{marginBottom: 16}}><strong>Phone Number:</strong> {profile.phoneNumber || <span style={{color:'#aaa'}}>N/A</span>}</div>
            </div>
            </div>

          
          
      </div>
      </div>
    </>
  );
};

export default PassengerProfilePage;
