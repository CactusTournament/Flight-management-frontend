import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";


const GatesPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editCode, setEditCode] = useState("");

  useEffect(() => {
    const fetchGates = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/gates", auth);
        setGates(data);
      } catch (err) {
        setError("Failed to load gates");
      } finally {
        setLoading(false);
      }
    };
    fetchGates();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/gates", auth, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setCode("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create gate");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/gates/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete gate");
    }
  };

  const handleEdit = (id, currentCode) => {
    setEditId(id);
    setEditCode(currentCode);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/gates/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ code: editCode }),
      });
      setEditId(null);
      setEditCode("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update gate");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
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
          <h2>Gates</h2>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>{error}</div>}
          {isAdmin && (
            <form onSubmit={handleCreate} style={{marginBottom: 16}}>
              <input
                type="text"
                placeholder="Code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
              <button type="submit" style={{marginLeft: 8}}>Add Gate</button>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {gates.map(g => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>
                    {isAdmin && editId === g.id ? (
                      <input
                        type="text"
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                      />
                    ) : (
                      g.code
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {editId === g.id ? (
                        <>
                          <button onClick={() => handleEditSave(g.id)} style={{marginRight: 8}}>Save</button>
                          <button onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(g.id, g.code)} style={{marginRight: 8}}>Edit</button>
                          <button onClick={() => handleDelete(g.id)}>Delete</button>
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

export default GatesPage;
