import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import { useNavigate } from "react-router-dom";


const FlightsPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFlightNumber, setEditFlightNumber] = useState("");

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("http://localhost:8080/flights", auth);
        setFlights(data);
      } catch (err) {
        setError("Failed to load flights");
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("http://localhost:8080/flights", auth, {
        method: "POST",
        body: JSON.stringify({ flightNumber }),
      });
      setFlightNumber("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create flight");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/flights/${id}`, auth, { method: "DELETE" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to delete flight");
    }
  };

  const handleEdit = (id, currentFlightNumber) => {
    setEditId(id);
    setEditFlightNumber(currentFlightNumber);
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/flights/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ flightNumber: editFlightNumber }),
      });
      setEditId(null);
      setEditFlightNumber("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update flight");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditFlightNumber("");
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
          <h2>Flights</h2>
          <div className="table-container">
            {loading && <div>Loading...</div>}
            {error && <div style={{color: 'red'}}>{error}</div>}
            {isAdmin && (
              <form onSubmit={handleCreate} style={{marginBottom: 16}}>
                <input
                  type="text"
                  placeholder="Flight Number"
                  value={flightNumber}
                  onChange={e => setFlightNumber(e.target.value)}
                  required
                />
                  <button type="submit" style={{marginLeft: 8}}>Add Flight</button>
              </form>
            )}
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Flight Number</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {flights.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>
                      {isAdmin && editId === f.id ? (
                        <input
                          type="text"
                          value={editFlightNumber}
                          onChange={e => setEditFlightNumber(e.target.value)}
                        />
                      ) : (
                        f.flightNumber
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        {editId === f.id ? (
                          <>
                            <button onClick={() => handleEditSave(f.id)} style={{marginLeft: 8}}>Save</button>
                            <button onClick={handleEditCancel}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(f.id, f.flightNumber)} style={{marginLeft: 8}}>Edit</button>
                            <button onClick={() => handleDelete(f.id)}>Delete</button>
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
      </div>
    </>
  );
};

export default FlightsPage;
