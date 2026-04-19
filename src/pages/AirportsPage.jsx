import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";


const AirportsPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  useEffect(() => {
    const fetchAirports = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/airports", auth);
        setAirports(data);
      } catch (err) {
        setError("Failed to load airports");
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/airports", auth, {
        method: "POST",
        body: JSON.stringify({ name, code }),
      });
      setName("");
      setCode("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create airport");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airports/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete airport");
    }
  };

  const handleEdit = (id, currentName, currentCode) => {
    setEditId(id);
    setEditName(currentName);
    setEditCode(currentCode);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airports/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ name: editName, code: editCode }),
      });
      setEditId(null);
      setEditName("");
      setEditCode("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update airport");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditName("");
    setEditCode("");
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
          <h2>Airports</h2>
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
              <input
                type="text"
                placeholder="Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
              <button type="submit" style={{marginLeft: 8}}>Add Airport</button>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {airports.map(a => (
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
                  <td>
                    {isAdmin && editId === a.id ? (
                      <input
                        type="text"
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                      />
                    ) : (
                      a.code
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
                          <button onClick={() => handleEdit(a.id, a.name, a.code)} style={{marginRight: 8}}>Edit</button>
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

export default AirportsPage;
