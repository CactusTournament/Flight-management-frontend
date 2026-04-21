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


const AirlinesPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAirline, setEditAirline] = useState({ name: "" });

  // Cascade delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePreview, setDeletePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Retry pattern
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchAirlines = async () => {
    setLoading(true);
    setError("");
    setFetchFailed(false);
    try {
      const data = await apiFetch("http://localhost:8080/airlines", auth);
      setAirlines(data);
    } catch (err) {
      setError("Failed to load airlines");
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchFailed) {
      fetchAirlines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter a name for the airline.");
      return;
    }
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
      const preview = await apiFetch(`http://localhost:8080/airlines/${id}/cascade-preview`, auth);
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
      await apiFetch(`http://localhost:8080/airlines/${deleteId}`, auth, { method: "DELETE" });
      setAirlines(prev => prev.filter(a => a.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete airline");
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
    const row = airlines.find(a => a.id === id);
    setEditId(id);
    setEditAirline({ name: row.name || "" });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airlines/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({ name: editAirline.name }),
      });
      setEditId(null);
      setEditAirline({ name: "" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update airline");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditAirline({ name: "" });
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
          {error && (
            <div style={{color: 'red', marginBottom: 8}}>
              {error}
              {fetchFailed && (
                <button onClick={fetchAirlines} style={{marginLeft: 12}}>Retry</button>
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
            entityName="airline"
            success={deleteSuccess}
          />
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add Airline"
              loading={loading}
              fields={[
                {
                  label: "Name",
                  type: "text",
                  value: name,
                  onChange: e => setName(e.target.value),
                  placeholder: "Name",
                  required: true,
                },
              ]}
            />
          )}
          <ResizableTable
            columns={[
              { key: "id", label: "ID" },
              {
                key: "name",
                label: "Name",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editAirline.name}
                      onChange={e => setEditAirline(f => ({ ...f, name: e.target.value }))}
                    />
                  ) : (
                    row.name
                  ),
              },
            ]}
            data={airlines}
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

export default AirlinesPage;
