import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const PassengersPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  useEffect(() => {
    const fetchPassengers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/passengers", auth);
        setPassengers(data);
      } catch (err) {
        setError("Failed to load passengers");
      } finally {
        setLoading(false);
      }
    };
    fetchPassengers();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/passengers", auth, {
        method: "POST",
        body: JSON.stringify({ firstName, lastName }),
      });
      setFirstName("");
      setLastName("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create passenger");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/passengers/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete passenger");
    }
  };

  const handleEdit = (id, currentFirstName, currentLastName) => {
    setEditId(id);
    setEditFirstName(currentFirstName);
    setEditLastName(currentLastName);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/passengers/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ firstName: editFirstName, lastName: editLastName }),
      });
      setEditId(null);
      setEditFirstName("");
      setEditLastName("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update passenger");
    }
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
          <h2>Passengers</h2>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>{error}</div>}
          {isAdmin && (
            <form onSubmit={handleCreate} style={{marginBottom: 16}}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
              <button type="submit" style={{marginLeft: 8}}>Add Passenger</button>
            </form>
          )}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {passengers.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {isAdmin && editId === p.id ? (
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={e => setEditFirstName(e.target.value)}
                      />
                    ) : (
                      p.firstName
                    )}
                  </td>
                  <td>
                    {isAdmin && editId === p.id ? (
                      <input
                        type="text"
                        value={editLastName}
                        onChange={e => setEditLastName(e.target.value)}
                      />
                    ) : (
                      p.lastName
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {editId === p.id ? (
                        <>
                          <button onClick={() => handleEditSave(p.id)} style={{marginRight: 8}}>Save</button>
                          <button onClick={handleEditCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(p.id, p.firstName, p.lastName)} style={{marginRight: 8}}>Edit</button>
                          <button onClick={() => handleDelete(p.id)}>Delete</button>
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

export default PassengersPage;
