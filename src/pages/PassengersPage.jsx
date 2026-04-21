  const handleEditCancel = () => {
    setEditId(null);
    setEditPassenger({ firstName: "", lastName: "", cityId: "" });
  };
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
  const [cityId, setCityId] = useState("");
  const [flightIds, setFlightIds] = useState([]);
  const [cities, setCities] = useState([]);
  const [flights, setFlights] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editPassenger, setEditPassenger] = useState({ firstName: "", lastName: "", cityId: "" });

  // Cascade delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePreview, setDeletePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Track if fetch failed to block repeated attempts
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    setFetchFailed(false);
    try {
      const [passengerData, cityData, flightData] = await Promise.all([
        apiFetch("http://localhost:8080/passengers", auth),
        apiFetch("http://localhost:8080/cities", auth),
        apiFetch("http://localhost:8080/flights", auth),
      ]);
      setPassengers(passengerData);
      setCities(cityData);
      setFlights(flightData);
    } catch (err) {
      setError("Failed to load passengers or related data");
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchFailed) {
      fetchAll();
    }
    // Only auto-fetch if not failed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, refresh]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !cityId) {
      setError("Please fill out all fields, including first name, last name, and city.");
      return;
    }
    try {
      await apiFetch("http://localhost:8080/passengers", auth, {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          city: { id: Number(cityId) },
        }),
      });
      setFirstName("");
      setLastName("");
      setCityId("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create passenger");
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
      const preview = await apiFetch(`http://localhost:8080/passengers/${id}/cascade-preview`, auth);
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
      await apiFetch(`http://localhost:8080/passengers/${deleteId}`, auth, { method: "DELETE" });
      setPassengers(prev => prev.filter(p => p.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete passenger");
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
    const row = passengers.find(p => p.id === id);
    setEditId(id);
    setEditPassenger({
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      cityId: row.city?.id ? String(row.city.id) : ""
    });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/passengers/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({
          firstName: editPassenger.firstName,
          lastName: editPassenger.lastName,
          city: { id: Number(editPassenger.cityId) }
        }),
      });
      setEditId(null);
      setEditPassenger({ firstName: "", lastName: "", cityId: "" });
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
            entityName="passenger"
            success={deleteSuccess}
          />
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add Passenger"
              loading={loading}
              fields={[
                {
                  label: "First Name",
                  type: "text",
                  value: firstName,
                  onChange: e => setFirstName(e.target.value),
                  placeholder: "First Name",
                  required: true,
                },
                {
                  label: "Last Name",
                  type: "text",
                  value: lastName,
                  onChange: e => setLastName(e.target.value),
                  placeholder: "Last Name",
                  required: true,
                },
                {
                  label: "City",
                  type: "select",
                  value: cityId,
                  onChange: e => setCityId(e.target.value),
                  required: true,
                  placeholder: "Select City",
                  options: cities.map(city => ({ value: city.id, label: city.name })),
                },
              ]}
            />
          )}
          {/* ResizableTable replaces static table */}
          <ResizableTable
            columns={[
              { key: "id", label: "ID" },
              {
                key: "firstName",
                label: "First Name",
                render: (row) => (
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editPassenger.firstName}
                      onChange={e => setEditPassenger(f => ({ ...f, firstName: e.target.value }))}
                    />
                  ) : (
                    row.firstName
                  )
                ),
              },
              {
                key: "lastName",
                label: "Last Name",
                render: (row) => (
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editPassenger.lastName}
                      onChange={e => setEditPassenger(f => ({ ...f, lastName: e.target.value }))}
                    />
                  ) : (
                    row.lastName
                  )
                ),
              },
              {
                key: "country",
                label: "Country",
                render: (row) => row.country || "",
              },
            ]}
            data={passengers}
            isAdmin={isAdmin}
            onEdit={row => handleEdit(row.id)}
            onDelete={row => handleDelete(row.id)}
            editId={editId}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            renderActions={row => (
              editId === row.id ? (
                <span>
                  <button onClick={() => handleEditSave(row.id)} style={{marginRight: 8}}>Save</button>
                  <button onClick={handleEditCancel}>Cancel</button>
                </span>
              ) : (
                <span>
                  <button onClick={() => handleEdit(row.id)} style={{marginRight: 8}}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </span>
              )
            )}
          />
        </div>
      </div>
    </>
  );
};

export default PassengersPage;
