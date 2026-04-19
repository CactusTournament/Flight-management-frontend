import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";


const AircraftPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState("");

  useEffect(() => {
    const fetchAircraft = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/aircraft", auth);
        setAircraft(data);
      } catch (err) {
        setError("Failed to load aircraft");
      } finally {
        setLoading(false);
      }
    };
    fetchAircraft();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/aircraft", auth, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      setType("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create aircraft");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/aircraft/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete aircraft");
    }
  };

  const handleEdit = (id, currentType) => {
    setEditId(id);
    setEditType(currentType);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/aircraft/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ type: editType }),
      });
      setEditId(null);
      setEditType("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update aircraft");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditType("");
  };

  const isAdmin = auth.role === "ADMIN";
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="page-container">
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
        <div className="contents-holder">
          <DashboardStats />
          <h2>Aircraft</h2>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>{error}</div>}
          {isAdmin && (
            <form onSubmit={handleCreate} style={{marginBottom: 16}}>
              <input
                type="text"
                placeholder="Type"
                value={type}
                onChange={e => setType(e.target.value)}
                required
              />
              <button type="submit" style={{marginLeft: 8}}>Add Aircraft</button>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {aircraft.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>
                    {isAdmin && editId === a.id ? (
                      <input
                        type="text"
                        value={editType}
                        onChange={e => setEditType(e.target.value)}
                      />
                    ) : (
                      a.type
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {editId === a.id ? (
                        <>
                          <button onClick={() => handleEditSave(a.id)} style={{marginRight: 8}}>Save</button>
                          <button onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(a.id, a.type)} style={{marginRight: 8}}>Edit</button>
                          <button onClick={() => handleDelete(a.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AircraftPage;
