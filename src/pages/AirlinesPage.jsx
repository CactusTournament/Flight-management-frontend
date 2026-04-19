import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";


const AirlinesPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const fetchAirlines = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/airlines", auth);
        setAirlines(data);
      } catch (err) {
        setError("Failed to load airlines");
      } finally {
        setLoading(false);
      }
    };
    fetchAirlines();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/airlines", auth, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setName("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create airline");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airlines/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete airline");
    }
  };

  const handleEdit = (id, currentName) => {
    setEditId(id);
    setEditName(currentName);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airlines/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ name: editName }),
      });
      setEditId(null);
      setEditName("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update airline");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditName("");
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
          <h2>Airlines</h2>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>{error}</div>}
          {isAdmin && (
            <form onSubmit={handleCreate} style={{marginBottom: 16}}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <button type="submit" style={{marginLeft: 8}}>Add Airline</button>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {airlines.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>
                    {isAdmin && editId === a.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                    ) : (
                      a.name
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
                          <button onClick={() => handleEdit(a.id, a.name)} style={{marginRight: 8}}>Edit</button>
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

export default AirlinesPage;
