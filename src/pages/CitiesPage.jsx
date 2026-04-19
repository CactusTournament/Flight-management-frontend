import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";

const CitiesPage = () => {
      const navigate = useNavigate();
    // Create City
    const handleCreate = async (e) => {
      e.preventDefault();
      setError("");
      try {
        await apiFetch("http://localhost:8080/cities", auth, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setName("");
        setRefresh(r => !r);
      } catch (err) {
        setError("Failed to add city");
      }
    };

    // Edit City
    const handleEdit = (id, currentName) => {
      setEditId(id);
      setEditName(currentName);
    };

    // Save Edit
    const handleEditSave = async (id) => {
      setError("");
      try {
        await apiFetch(`http://localhost:8080/cities/${id}`, auth, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editName }),
        });
        setEditId(null);
        setEditName("");
        setRefresh(r => !r);
      } catch (err) {
        setError("Failed to update city");
      }
    };

    // Cancel Edit
    const handleEditCancel = () => {
      setEditId(null);
      setEditName("");
    };

    // Delete City
    const handleDelete = async (id) => {
      setError("");
      try {
        await apiFetch(`http://localhost:8080/cities/${id}`, auth, {
          method: "DELETE"
        });
        setRefresh(r => !r);
      } catch (err) {
        setError("Failed to delete city");
      }
    };
  const { auth } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/cities", auth);
        setCities(data);
      } catch (err) {
        setError("Failed to load cities");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, [auth, refresh]);

  const isAdmin = auth.role === "ADMIN";

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="page-container">
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
        <div className="contents-holder">
          <DashboardStats />
          <h2>Cities</h2>
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
              <button type="submit" style={{marginLeft: 8}}>Add City</button>
              
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
              {cities.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {isAdmin && editId === c.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {editId === c.id ? (
                        <>
                          <button onClick={() => handleEditSave(c.id)} style={{marginRight: 8}}>Save</button>
                          <button onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(c.id, c.name)} style={{marginRight: 8}}>Edit</button>
                          <button onClick={() => handleDelete(c.id)}>Delete</button>
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

export default CitiesPage;
