import React from "react";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";


import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import CascadeDeleteModal from "../components/CascadeDeleteModal";
import ResizableTable from "../components/ResizableTable";
import EntityCreateForm from "../components/EntityCreateForm";
import { useNavigate } from "react-router-dom";


const AircraftPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [numberOfPassengers, setNumberOfPassengers] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [airlines, setAirlines] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAircraft, setEditAircraft] = useState({
    type: "",
    numberOfPassengers: "",
    airlineId: ""
  });

  // Cascade delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePreview, setDeletePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Retry pattern
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    setFetchFailed(false);
    try {
      const [aircraftData, airlinesData] = await Promise.all([
        apiFetch("http://localhost:8080/aircraft", auth),
        apiFetch("http://localhost:8080/airlines", auth),
      ]);
      setAircraft(aircraftData);
      setAirlines(airlinesData);
    } catch (err) {
      setError("Failed to load aircraft or airlines");
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchFailed) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!type.trim() || !numberOfPassengers || !airlineId) {
      setError("Please fill out all fields, including type, number of passengers, and airline.");
      return;
    }
    try {
      await apiFetch("http://localhost:8080/aircraft", auth, {
        method: "POST",
        body: JSON.stringify({
          type,
          numberOfPassengers: Number(numberOfPassengers),
          airline: { id: Number(airlineId) },
        }),
      });
      setType("");
      setNumberOfPassengers("");
      setAirlineId("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create aircraft");
    }
  };


  // Show modal and fetch preview
  const handleDelete = async (id) => {
    setDeleteId(id);
    setDeletePreview(null);
    setDeleteLoading(true);
    setDeleteError("");
    setDeleteSuccess(false);
    setShowDeleteModal(true);
    try {
      // Try to fetch preview (if backend supports it)
      const preview = await apiFetch(`http://localhost:8080/aircraft/${id}/cascade-preview`, auth);
      setDeletePreview(preview);
    } catch (err) {
      setDeleteError("Could not load delete preview. Proceed with caution.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Confirm delete after modal
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await apiFetch(`http://localhost:8080/aircraft/${deleteId}`, auth, { method: "DELETE" });
      setAircraft(prev => prev.filter(a => a.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete aircraft");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeletePreview(null);
    setDeleteError("");
    setDeleteLoading(false);
    setDeleteSuccess(false);
  };

  const handleEdit = (id) => {
    const row = aircraft.find(a => a.id === id);
    setEditId(id);
    setEditAircraft({
      type: row.type || "",
      numberOfPassengers: row.numberOfPassengers ? String(row.numberOfPassengers) : "",
      airlineId: row.airline?.id ? String(row.airline.id) : ""
    });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/aircraft/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({
          type: editAircraft.type,
          numberOfPassengers: Number(editAircraft.numberOfPassengers),
          airline: { id: Number(editAircraft.airlineId) }
        }),
      });
      setEditId(null);
      setEditAircraft({ type: "", numberOfPassengers: "", airlineId: "" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update aircraft");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditAircraft({ type: "", numberOfPassengers: "", airlineId: "" });
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
          {error && (
            <div style={{color: 'red', marginBottom: 8}}>
              {error}
              {fetchFailed && (
                <button onClick={fetchAll} style={{marginLeft: 12}}>Retry</button>
              )}
            </div>
          )}
          <CascadeDeleteModal
            show={showDeleteModal}
            preview={deletePreview}
            loading={deleteLoading}
            error={deleteError}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            onClose={handleCancelDelete}
            entityName="aircraft"
            success={deleteSuccess}
          />
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add Aircraft"
              loading={loading}
              fields={[
                {
                  label: "Type",
                  type: "text",
                  value: type,
                  onChange: e => setType(e.target.value),
                  placeholder: "Type",
                  required: true,
                },
                {
                  label: "Number of Passengers",
                  type: "number",
                  value: numberOfPassengers,
                  onChange: e => setNumberOfPassengers(e.target.value),
                  placeholder: "Number of Passengers",
                  required: true,
                  min: 1,
                },
                {
                  label: "Airline",
                  type: "select",
                  value: airlineId,
                  onChange: e => setAirlineId(e.target.value),
                  required: true,
                  placeholder: "Select Airline",
                  options: airlines.map(airline => ({ value: airline.id, label: airline.name })),
                },
              ]}
            />
          )}
          <ResizableTable
            columns={[
              { key: "id", label: "ID" },
              {
                key: "type",
                label: "Type",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editAircraft.type}
                      onChange={e => setEditAircraft(f => ({ ...f, type: e.target.value }))}
                    />
                  ) : (
                    row.type
                  ),
              },
              {
                key: "numberOfPassengers",
                label: "Number of Passengers",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="number"
                      min={1}
                      value={editAircraft.numberOfPassengers}
                      onChange={e => setEditAircraft(f => ({ ...f, numberOfPassengers: e.target.value }))}
                    />
                  ) : (
                    row.numberOfPassengers
                  ),
              },
              {
                key: "airline",
                label: "Airline",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editAircraft.airlineId}
                      onChange={e => setEditAircraft(f => ({ ...f, airlineId: e.target.value }))}
                    >
                      <option value="">Select Airline</option>
                      {airlines.map(al => (
                        <option key={al.id} value={al.id}>{al.name}</option>
                      ))}
                    </select>
                  ) : (
                    row.airline?.name || ""
                  ),
              },
            ]}
            data={aircraft}
            isAdmin={isAdmin}
            onEdit={row => handleEdit(row.id)}
            onDelete={row => handleDelete(row.id)}
            editId={editId}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            renderActions={row => (
              editId === row.id ? (
                <>
                  <button onClick={() => handleEditSave(row.id)} style={{marginRight: 8}}>Save</button>
                  <button onClick={handleEditCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(row.id)} style={{marginRight: 8}}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </>
              )
            )}
          />
        </div>
      </div>
    </>
  );
};

export default AircraftPage;
