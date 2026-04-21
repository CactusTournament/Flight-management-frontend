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


const FlightsPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);


  // Place all state declarations at the top before any useEffect or usage
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [fetchFailed, setFetchFailed] = useState(false);

  // Fetch all required data for table and create form
  const fetchAll = async () => {
    setLoading(true);
    setFetchFailed(false);
    try {
      const [flightsData, aircraftsData, airlinesData, gatesData, airportsData, passengersData] = await Promise.all([
        apiFetch("http://localhost:8080/flights", auth),
        apiFetch("http://localhost:8080/aircraft", auth),
        apiFetch("http://localhost:8080/airlines", auth),
        apiFetch("http://localhost:8080/gates", auth),
        apiFetch("http://localhost:8080/airports", auth),
        apiFetch("http://localhost:8080/passengers", auth),
      ]);
      setFlights(flightsData);
      setAircrafts(aircraftsData);
      setAirlines(airlinesData);
      setGates(gatesData);
      setAirports(airportsData);
      setPassengers(passengersData);
    } catch (err) {
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, refresh]);
  const [error, setError] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [aircraftId, setAircraftId] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [gateId, setGateId] = useState("");
  const [originAirportId, setOriginAirportId] = useState("");
  const [destinationAirportId, setDestinationAirportId] = useState("");
  const [passengerIds, setPassengerIds] = useState([]);
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [aircrafts, setAircrafts] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [gates, setGates] = useState([]);
  const [airports, setAirports] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFlight, setEditFlight] = useState({
    flightNumber: "",
    aircraftId: "",
    airlineId: "",
    gateId: "",
    originAirportId: "",
    destinationAirportId: "",
    passengerIds: [],
    departureTime: "",
    arrivalTime: ""
  });

  // Cascade delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePreview, setDeletePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [deleteSuccess, setDeleteSuccess] = useState(false);


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
      const preview = await apiFetch(`http://localhost:8080/flights/${id}/cascade-preview`, auth);
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
      await apiFetch(`http://localhost:8080/flights/${deleteId}`, auth, { method: "DELETE" });
      setFlights(prev => prev.filter(f => f.id !== deleteId));
      setDeleteError("");
      setDeleteSuccess(true);
    } catch (err) {
      setDeleteError("Failed to delete flight");
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

  const handleEdit = (id, _currentFlightNumber) => {
    const row = flights.find(f => f.id === id);
    setEditId(id);
    setEditFlight({
      flightNumber: row.flightNumber || "",
      aircraftId: row.aircraft?.id ? String(row.aircraft.id) : "",
      airlineId: row.airline?.id ? String(row.airline.id) : "",
      gateId: row.gate?.id ? String(row.gate.id) : "",
      originAirportId: row.originAirport?.id ? String(row.originAirport.id) : "",
      destinationAirportId: row.destinationAirport?.id ? String(row.destinationAirport.id) : "",
      passengerIds: Array.isArray(row.passengers) ? row.passengers.map(p => String(p.id)) : [],
      departureTime: row.departureTime ? row.departureTime.slice(0, 16) : "",
      arrivalTime: row.arrivalTime ? row.arrivalTime.slice(0, 16) : ""
    });
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      const originId = Number(editFlight.originAirportId);
      const destId = Number(editFlight.destinationAirportId);
      if (!originId || !destId) {
        setError("Please select both origin and destination airports.");
        return;
      }
      await apiFetch(`http://localhost:8080/flights/${id}`, auth, {
        method: "PUT",
        body: JSON.stringify({
          flightNumber: editFlight.flightNumber,
          aircraft: { id: Number(editFlight.aircraftId) },
          airline: { id: Number(editFlight.airlineId) },
          gate: { id: Number(editFlight.gateId) },
          originAirport: { id: originId },
          destinationAirport: { id: destId },
          passengers: editFlight.passengerIds.map(id => ({ id: Number(id) })),
          departureTime: editFlight.departureTime ? new Date(editFlight.departureTime).toISOString() : null,
          arrivalTime: editFlight.arrivalTime ? new Date(editFlight.arrivalTime).toISOString() : null
        }),
      });
      setEditId(null);
      setEditFlight({
        flightNumber: "",
        aircraftId: "",
        airlineId: "",
        gateId: "",
        originAirportId: "",
        destinationAirportId: "",
        passengerIds: [],
        departureTime: "",
        arrivalTime: ""
      });
      setRefresh(r => !r);
    } catch (err) {
      setError("Failed to update flight");
      console.error("Update flight error:", err);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditFlight({
      flightNumber: "",
      aircraftId: "",
      airlineId: "",
      gateId: "",
      originAirportId: "",
      destinationAirportId: "",
      passengerIds: [],
      departureTime: "",
      arrivalTime: ""
    });
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
          {isAdmin && (
            <EntityCreateForm
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  if (
                    !flightNumber.trim() ||
                    !aircraftId ||
                    !airlineId ||
                    !gateId ||
                    !originAirportId ||
                    !destinationAirportId ||
                    passengerIds.length === 0 ||
                    !departureTime ||
                    !arrivalTime
                  ) {
                    setError("Please fill out all fields, including flight number, aircraft, airline, gate, origin/destination airports, at least one passenger, and both times.");
                    return;
                  }
                  // Validation: takeoff cannot be after landing, landing cannot be before takeoff
                  const dep = new Date(departureTime);
                  const arr = new Date(arrivalTime);
                  if (dep > arr) {
                    setError("Takeoff time cannot be after landing time.");
                    return;
                  }
                  if (arr < dep) {
                    setError("Landing time cannot be before takeoff time.");
                    return;
                  }
                  try {
                    await apiFetch("http://localhost:8080/flights", auth, {
                      method: "POST",
                      body: JSON.stringify({
                        flightNumber,
                        aircraft: { id: Number(aircraftId) },
                        airline: { id: Number(airlineId) },
                        gate: { id: Number(gateId) },
                        originAirport: { id: Number(originAirportId) },
                        destinationAirport: { id: Number(destinationAirportId) },
                        passengers: passengerIds.map(id => ({ id: Number(id) })),
                        departureTime: dep.toISOString(),
                        arrivalTime: arr.toISOString(),
                      }),
                    });
                    setFlightNumber("");
                    setAircraftId("");
                    setAirlineId("");
                    setGateId("");
                    setOriginAirportId("");
                    setDestinationAirportId("");
                    setPassengerIds([]);
                    setDepartureTime("");
                    setArrivalTime("");
                    setRefresh(r => !r);
                  } catch (err) {
                    setError("Failed to create flight");
                  }
                }}
                error={error}
                buttonLabel="Add Flight"
                loading={loading}
                fields={[
                  {
                    label: "Flight Number",
                    type: "text",
                    value: flightNumber,
                    onChange: e => setFlightNumber(e.target.value),
                    placeholder: "Flight Number",
                    required: true,
                  },
                  {
                    label: "Aircraft",
                    type: "select",
                    value: aircraftId,
                    onChange: e => setAircraftId(e.target.value),
                    required: true,
                    placeholder: "Select Aircraft",
                    options: aircrafts.map(a => ({ value: a.id, label: a.type })),
                  },
                  {
                    label: "Airline",
                    type: "select",
                    value: airlineId,
                    onChange: e => setAirlineId(e.target.value),
                    required: true,
                    placeholder: "Select Airline",
                    options: airlines.map(al => ({ value: al.id, label: al.name })),
                  },
                  {
                    label: "Gate",
                    type: "select",
                    value: gateId,
                    onChange: e => setGateId(e.target.value),
                    required: true,
                    placeholder: "Select Gate",
                    options: gates.map(g => ({ value: g.id, label: g.code })),
                  },
                  {
                    label: "Origin Airport",
                    type: "select",
                    value: originAirportId,
                    onChange: e => setOriginAirportId(e.target.value),
                    required: true,
                    placeholder: "Origin Airport",
                    options: airports.map(ap => ({ value: ap.id, label: ap.name })),
                  },
                  {
                    label: "Destination Airport",
                    type: "select",
                    value: destinationAirportId,
                    onChange: e => setDestinationAirportId(e.target.value),
                    required: true,
                    placeholder: "Destination Airport",
                    options: airports.map(ap => ({ value: ap.id, label: ap.name })),
                  },
                  {
                    label: "Passengers",
                    type: "custom",
                    render: () => (
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
                        <select
                          value=""
                          onChange={e => {
                            const selectedId = e.target.value;
                            if (selectedId && !passengerIds.includes(selectedId)) {
                              setPassengerIds([...passengerIds, selectedId]);
                            }
                          }}
                          style={{ minWidth: 120 }}
                        >
                          <option value="">Add Passenger...</option>
                          {passengers.filter(p => !passengerIds.includes(String(p.id))).map(p => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {passengerIds.map(id => {
                            const p = passengers.find(p => String(p.id) === String(id));
                            if (!p) return null;
                            return (
                              <span key={id} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#f0f0f0',
                                borderRadius: 12,
                                padding: '2px 8px',
                                marginRight: 4
                              }}>
                                {p.firstName} {p.lastName}
                                <button
                                  type="button"
                                  style={{ marginLeft: 4, background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
                                  onClick={() => setPassengerIds(passengerIds.filter(pid => pid !== id))}
                                  aria-label={`Remove ${p.firstName} ${p.lastName}`}
                                >×</button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: "Departure Time",
                    type: "datetime-local",
                    value: departureTime,
                    onChange: e => setDepartureTime(e.target.value),
                    required: true,
                  },
                  {
                    label: "Arrival Time",
                    type: "datetime-local",
                    value: arrivalTime,
                    onChange: e => setArrivalTime(e.target.value),
                    required: true,
                  },
                ]}
              />
          )}
          <ResizableTable
            columns={[
              { key: "id", label: "ID" },
              {
                key: "flightNumber",
                label: "Flight Number",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="text"
                      value={editFlight.flightNumber}
                      onChange={e => setEditFlight(f => ({ ...f, flightNumber: e.target.value }))}
                    />
                  ) : (
                    row.flightNumber
                  ),
              },
              {
                key: "aircraft",
                label: "Aircraft",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editFlight.aircraftId}
                      onChange={e => setEditFlight(f => ({ ...f, aircraftId: e.target.value }))}
                    >
                      <option value="">Select Aircraft</option>
                      {aircrafts.map(a => (
                        <option key={a.id} value={a.id}>{a.type}</option>
                      ))}
                    </select>
                  ) : (
                    row.aircraft?.type || ""
                  ),
              },
              {
                key: "airline",
                label: "Airline",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editFlight.airlineId}
                      onChange={e => setEditFlight(f => ({ ...f, airlineId: e.target.value }))}
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
              {
                key: "gate",
                label: "Gate",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editFlight.gateId}
                      onChange={e => setEditFlight(f => ({ ...f, gateId: e.target.value }))}
                    >
                      <option value="">Select Gate</option>
                      {gates.map(g => (
                        <option key={g.id} value={g.id}>{g.code}</option>
                      ))}
                    </select>
                  ) : (
                    row.gate?.code || ""
                  ),
              },
              {
                key: "originAirport",
                label: "Origin",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editFlight.originAirportId}
                      onChange={e => setEditFlight(f => ({ ...f, originAirportId: e.target.value }))}
                    >
                      <option value="">Origin Airport</option>
                      {airports.map(ap => (
                        <option key={ap.id} value={ap.id}>{ap.name}</option>
                      ))}
                    </select>
                  ) : (
                    row.originAirport?.name || ""
                  ),
              },
              {
                key: "destinationAirport",
                label: "Destination",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <select
                      value={editFlight.destinationAirportId}
                      onChange={e => setEditFlight(f => ({ ...f, destinationAirportId: e.target.value }))}
                    >
                      <option value="">Destination Airport</option>
                      {airports.map(ap => (
                        <option key={ap.id} value={ap.id}>{ap.name}</option>
                      ))}
                    </select>
                  ) : (
                    row.destinationAirport?.name || ""
                  ),
              },
              {
                key: "passengers",
                label: "Passengers",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <div>
                      <select
                        value=""
                        onChange={e => {
                          const selectedId = e.target.value;
                          if (selectedId && !editFlight.passengerIds.includes(selectedId)) {
                            setEditFlight(f => ({ ...f, passengerIds: [...f.passengerIds, selectedId] }));
                          }
                        }}
                      >
                        <option value="">Add Passenger...</option>
                        {passengers.filter(p => !editFlight.passengerIds.includes(String(p.id))).map(p => (
                          <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                        ))}
                      </select>
                      <div>
                        {editFlight.passengerIds.map(id => {
                          const p = passengers.find(p => String(p.id) === String(id));
                          if (!p) return null;
                          return (
                            <span key={id}>
                              {p.firstName} {p.lastName}
                              <button
                                type="button"
                                onClick={() => setEditFlight(f => ({ ...f, passengerIds: f.passengerIds.filter(pid => pid !== id) }))}
                                aria-label={`Remove ${p.firstName} ${p.lastName}`}
                              >×</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    Array.isArray(row.passengers)
                      ? row.passengers.map(p => `${p.firstName} ${p.lastName}`).join(", ")
                      : ""
                  ),
              },
              {
                key: "departureTime",
                label: "Departure",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="datetime-local"
                      value={editFlight.departureTime}
                      onChange={e => setEditFlight(f => ({ ...f, departureTime: e.target.value }))}
                    />
                  ) : (
                    row.departureTime ? new Date(row.departureTime).toLocaleString() : ""
                  ),
              },
              {
                key: "arrivalTime",
                label: "Arrival",
                render: (row) =>
                  isAdmin && editId === row.id ? (
                    <input
                      type="datetime-local"
                      value={editFlight.arrivalTime}
                      onChange={e => setEditFlight(f => ({ ...f, arrivalTime: e.target.value }))}
                    />
                  ) : (
                    row.arrivalTime ? new Date(row.arrivalTime).toLocaleString() : ""
                  ),
              },
            ]}
            data={flights}
            isAdmin={isAdmin}
            onEdit={row => handleEdit(row.id, row.flightNumber)}
            onDelete={row => handleDelete(row.id)}
            editId={editId}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            renderActions={row => (
              editId === row.id ? (
                <>
                  <button onClick={() => handleEditSave(row.id)}>Save</button>
                  <button onClick={handleEditCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(row.id, row.flightNumber)}>Edit</button>
                  <button onClick={() => handleDelete(row.id)}>Delete</button>
                </>
              )
            )}
          />
        </div>
      </div>
      {/* Cascade Delete Modal rendered at the bottom */}
      <CascadeDeleteModal
        show={showDeleteModal}
        preview={deletePreview}
        loading={deleteLoading}
        error={deleteError}
        success={deleteSuccess}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        entityName="flight"
        onClose={handleCancelDelete}
      />
    </>
  );
};

export default FlightsPage;