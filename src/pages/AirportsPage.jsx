  // CityNameCell must be defined inside the AirportsPage component or in a separate file
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


const AirportsPage = () => {
  // Helper component to display city name by id, with caching and safe hooks
  const CityNameCell = ({ city, cityId, cities, auth }) => {
    const [name, setName] = useState(() => {
      if (city && city.name) return city.name;
      const cityObj = cities.find(c => String(c.id) === String(cityId));
      return cityObj ? cityObj.name : "";
    });
    useEffect(() => {
      let isMounted = true;
      if (!name && cityId) {
        const cityObj = cities.find(c => String(c.id) === String(cityId));
        if (cityObj) {
          setName(cityObj.name);
        } else {
          apiFetch(`http://localhost:8080/cities/${cityId}`, auth).then(city => {
            if (isMounted && city && city.name) setName(city.name);
          }).catch(() => {});
        }
      }
      return () => { isMounted = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cityId, cities]);
    return name || "";
  };

  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAirport, setEditAirport] = useState({
    name: "",
    code: "",
    cityId: ""
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
      const [airportsData, citiesData] = await Promise.all([
        apiFetch("http://localhost:8080/airports", auth),
        apiFetch("http://localhost:8080/cities", auth),
      ]);
      setAirports(airportsData);
      setCities(citiesData);
    } catch (err) {
      setError("Failed to load airports or cities");
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
    if (!name.trim() || !code.trim() || !cityId) {
      setError("Please fill out all fields, including name, code, and city.");
      return;
    }
    try {
      await apiFetch("http://localhost:8080/airports", auth, {
        method: "POST",
        body: JSON.stringify({
          name,
          code,
          city: { id: Number(cityId) },
        }),
      });
      setName("");
      setCode("");
      setCityId("");
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to create airport");
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
      const preview = await apiFetch(`http://localhost:8080/airports/${id}/cascade-preview`, auth);
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
      await apiFetch(`http://localhost:8080/airports/${deleteId}`, auth, { method: "DELETE" });
      setAirports(prev => prev.filter(a => a.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete airport");
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
    const row = airports.find(a => a.id === id);
    setEditId(id);
    setEditAirport({
      name: row.name || "",
      code: row.code || "",
      cityId: row.city?.id ? String(row.city.id) : ""
    });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      await apiFetch(`http://localhost:8080/airports/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({
          name: editAirport.name,
          code: editAirport.code,
          city: { id: Number(editAirport.cityId) }
        }),
      });
      setEditId(null);
      setEditAirport({ name: "", code: "", cityId: "" });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update airport");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditAirport({ name: "", code: "", cityId: "" });
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
            entityName="airport"
            success={deleteSuccess}
          />
          {isAdmin && (
            <EntityCreateForm
              onSubmit={handleCreate}
              error={error}
              buttonLabel="Add Airport"
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
                  label: "Code",
                  type: "text",
                  value: code,
                  onChange: e => setCode(e.target.value),
                  placeholder: "Code",
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
                      value={editAirport.name}
                      onChange={e => setEditAirport(f => ({ ...f, name: e.target.value }))}
                    />
                  ) : (
                    row.name
                  ),
              },
              {
                key: "code",
                label: "Code",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editAirport.code}
                      onChange={e => setEditAirport(f => ({ ...f, code: e.target.value }))}
                    />
                  ) : (
                    row.code
                  ),
              },
              {
                key: "city",
                label: "City",
                render: (row) => {
                  if (isAdmin && editId === row.id) {
                    return (
                      <select
                        value={editAirport.cityId}
                        onChange={e => setEditAirport(f => ({ ...f, cityId: e.target.value }))}
                      >
                        <option value="">Select City</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    );
                  }
                  // Always display city name if possible
                  const cityId = row.cityId || (row.city && row.city.id);
                  return <CityNameCell city={row.city} cityId={cityId} cities={cities} auth={auth} />;
                },
              },
            ]}
            data={airports}
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

export default AirportsPage;
