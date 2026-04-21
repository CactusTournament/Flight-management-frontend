    const handleEditCancel = () => {
      setEditId(null);
      setEditName("");
    };
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
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardStats from "../components/DashboardStats";
import CascadeDeleteModal from "../components/CascadeDeleteModal";
import ResizableTable from "../components/ResizableTable";
import EntityCreateForm from "../components/EntityCreateForm";
import { useNavigate } from "react-router-dom";

const CitiesPage = () => {
  const navigate = useNavigate();
  const [stateName, setStateName] = useState("");
  const [population, setPopulation] = useState("");
  // Create City
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !stateName.trim() || !population) {
      setError("Please fill out all fields, including name, state, and population.");
      return;
    }
    try {
      await apiFetch("http://localhost:8080/cities", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, state: stateName, population: Number(population) }),
      });
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
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  ) : (
                    row.name
                  ),
              },
              { key: "state", label: "State" },
              { key: "population", label: "Population" },
            ]}
            data={cities}
            isAdmin={isAdmin}
            onEdit={row => handleEdit(row.id, row.name)}
            onDelete={row => handleDeleteClick(row.id)}
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
                  <button onClick={() => handleEdit(row.id, row.name)} style={{marginRight: 8}}>Edit</button>
                  <button onClick={() => handleDeleteClick(row.id)}>Delete</button>
                </>
              )
            )}
          />
        setDeleteError("Failed to fetch delete preview");
      } finally {
        setDeleteLoading(false);
      }
    };

    const handleConfirmDelete = async () => {
      setDeleteLoading(true);
      setDeleteError("");
      try {
        await apiFetch(`http://localhost:8080/cities/${deleteId}`, auth, { method: "DELETE" });
        setCities(prev => prev.filter(c => c.id !== deleteId));
        setDeleteError("");
        setDeleteSuccess(true);
      } catch (err) {
        setDeleteError("Failed to delete city");
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
  const { auth } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editCity, setEditCity] = useState({ name: "", state: "", population: "" });

  // Retry pattern
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchCities = async () => {
    setLoading(true);
    setError("");
    setFetchFailed(false);
    try {
      const data = await apiFetch("http://localhost:8080/cities", auth);
      setCities(data);
    } catch (err) {
      setError("Failed to load cities");
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchFailed) {
      fetchCities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {error && (
            <div style={{color: 'red', marginBottom: 8}}>
              {error}
              {fetchFailed && (
                <button onClick={fetchCities} style={{marginLeft: 12}}>Retry</button>
              )}
            </div>
          )}
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add City"
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
                {
                  label: "State (e.g. CA, NY, TX)",
                  type: "text",
                  value: stateName,
                  onChange: e => setStateName(e.target.value),
                  placeholder: "State (e.g. CA, NY, TX)",
                  required: true,
                },
                {
                  label: "Population",
                  type: "number",
                  value: population,
                  onChange: e => setPopulation(e.target.value),
                  placeholder: "Population",
                  required: true,
                  min: 0,
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
                render: (row) => (
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editCity.name}
                      onChange={e => setEditCity(f => ({ ...f, name: e.target.value }))}
                    />
                  ) : (
                    row.name
                  )
                ),
              },
              {
                key: "state",
                label: "State",
                render: (row) => (
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editCity.state}
                      onChange={e => setEditCity(f => ({ ...f, state: e.target.value }))}
                    />
                  ) : (
                    row.state
                  )
                ),
              },
              {
                key: "population",
                label: "Population",
                render: (row) => (
                  isAdmin && editId === row.id ? (
                    <input
                      type="number"
                      min={0}
                      value={editCity.population}
                      onChange={e => setEditCity(f => ({ ...f, population: e.target.value }))}
                    />
                  ) : (
                    row.population
                  )
                ),
              },
            ]}
            data={cities}
            isAdmin={isAdmin}
            onEdit={row => {
              setEditId(row.id);
              setEditCity({
                name: row.name || "",
                state: row.state || "",
                population: row.population ? String(row.population) : ""
              });
            }}
            onDelete={row => handleDeleteClick(row.id)}
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
                  <button onClick={() => {
                    setEditId(row.id);
                    setEditCity({
                      name: row.name || "",
                      state: row.state || "",
                      population: row.population ? String(row.population) : ""
                    });
                  }} style={{marginRight: 8}}>Edit</button>
                  <button onClick={() => handleDeleteClick(row.id)}>Delete</button>
                </span>
              )
            )}
          />
        </div>
      </div>
    </>
  );
};

export default CitiesPage;
