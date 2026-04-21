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


const GatesPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [airportId, setAirportId] = useState("");
  const [airports, setAirports] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editGate, setEditGate] = useState({ code: "", airportId: "" });

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
      const [gatesData, airportsData] = await Promise.all([
        apiFetch("http://localhost:8080/gates", auth),
        apiFetch("http://localhost:8080/airports", auth),
      ]);
      setGates(gatesData);
      setAirports(airportsData);
    } catch (err) {
      setError("Failed to load gates or airports");
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
    if (!code.trim() || !airportId) {
      setError("Please fill out all fields, including code and airport.");
      return;
    }
    try {
      await apiFetch("http://localhost:8080/gates", auth, {
        method: "POST",
        body: JSON.stringify({
          code,
          airport: { id: Number(airportId) },
        }),
      });
      setCode("");
      setAirportId("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create gate");
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
      const preview = await apiFetch(`http://localhost:8080/gates/${id}/cascade-preview`, auth);
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
      await apiFetch(`http://localhost:8080/gates/${deleteId}`, auth, { method: "DELETE" });
      // Remove the deleted gate from state immediately
      setGates(prev => prev.filter(g => g.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete gate");
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
    const row = gates.find(g => g.id === id);
    setEditId(id);
    setEditGate({
      code: row.code || "",
      airportId: row.airport?.id ? String(row.airport.id) : ""
    });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/gates/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({
          code: editGate.code,
          airport: { id: Number(editGate.airportId) }
        }),
      });
      setEditId(null);
      setEditGate({ code: "", airportId: "" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update gate");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditGate({ code: "", airportId: "" });
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
            entityName="gate"
            success={deleteSuccess}
          />
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add Gate"
              loading={loading}
              fields={[
                {
                  label: "Code",
                  type: "text",
                  value: code,
                  onChange: e => setCode(e.target.value),
                  placeholder: "Code",
                  required: true,
                },
                {
                  label: "Airport",
                  type: "select",
                  value: airportId,
                  onChange: e => setAirportId(e.target.value),
                  required: true,
                  placeholder: "Select Airport",
                  options: airports.map(airport => ({ value: airport.id, label: airport.name })),
                },
              ]}
            />
          )}
          <ResizableTable
            columns={[
              { key: "id", label: "ID" },
              {
                key: "code",
                label: "Code",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editGate.code}
                      onChange={e => setEditGate(f => ({ ...f, code: e.target.value }))}
                    />
                  ) : (
                    row.code
                  ),
              },
              {
                key: "airport",
                label: "Airport",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editGate.airportId}
                      onChange={e => setEditGate(f => ({ ...f, airportId: e.target.value }))}
                    >
                      <option value="">Select Airport</option>
                      {airports.map(ap => (
                        <option key={ap.id} value={ap.id}>{ap.name}</option>
                      ))}
                    </select>
                  ) : (
                    row.airport?.name || "-"
                  ),
              },
            ]}
            data={gates}
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

export default GatesPage;
