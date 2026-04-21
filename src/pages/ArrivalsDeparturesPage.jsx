import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import { apiFetch } from "../api/apiFetch";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import ResizableTable from "../components/ResizableTable";
import { Link } from "react-router-dom";

const ArrivalsDeparturesPage = () => {
    const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState("");
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Dashboard stats
  const [stats, setStats] = useState({ flights: 0, airports: 0, airlines: 0, gates: 0, aircraft: 0, passengers: 0 });
  const { searchResults, showDropdown, setShowDropdown } = useContext(SearchContext);

  useEffect(() => {
    // Fetch airports and dashboard stats on mount
    const fetchAirports = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("http://localhost:8080/airports", auth);
        setAirports(data);
      } catch (err) {
        setError("Failed to load airports");
      } finally {
        setLoading(false);
      }
    };
    const fetchStats = async () => {
      try {
        const [flights, airports, airlines, gates, aircraft, passengers] = await Promise.all([
          apiFetch("http://localhost:8080/flights", auth),
          apiFetch("http://localhost:8080/airports", auth),
          apiFetch("http://localhost:8080/airlines", auth),
          apiFetch("http://localhost:8080/gates", auth),
          apiFetch("http://localhost:8080/aircraft", auth),
          apiFetch("http://localhost:8080/passengers", auth),
        ]);
        setStats({
          flights: flights.length,
          airports: airports.length,
          airlines: airlines.length,
          gates: gates.length,
          aircraft: aircraft.length,
          passengers: passengers.length,
        });
      } catch {}
    };
    fetchAirports();
    fetchStats();
  }, [auth]);



  const fetchFlights = async (airportId) => {
    setLoading(true);
    setError("");
    try {
      const arr = await apiFetch(`http://localhost:8080/flights/arrivals/${airportId}`, auth);
      const dep = await apiFetch(`http://localhost:8080/flights/departures/${airportId}`, auth);
      setArrivals(arr);
      setDepartures(dep);
    } catch (err) {
      setError("Failed to load flights");
    } finally {
      setLoading(false);
    }
  };

  const handleAirportChange = (e) => {
    setSelectedAirport(e.target.value);
    fetchFlights(e.target.value);
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <aside>
          <Sidebar />
        </aside>
        <div className="page-container">
          <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
          <div className="contents-holder">
            <h2>Welcome to the Flight Management System</h2>
            <p style={{ marginBottom: 24 }}>
              View real-time arrivals and departures, search for flights, and manage all aviation data. Use the navigation bar above to access admin features.
            </p>
            {/* Dashboard Stats */}
            <div className="dashboard-stats">
              <div className="dashboard-stat"><strong>Flights:</strong> <br />{stats.flights}</div>
              <div className="dashboard-stat"><strong>Airports:</strong> <br />{stats.airports}</div>
              <div className="dashboard-stat"><strong>Airlines:</strong> <br />{stats.airlines}</div>
              <div className="dashboard-stat"><strong>Gates:</strong> <br />{stats.gates}</div>
              <div className="dashboard-stat"><strong>Aircraft:</strong> <br />{stats.aircraft}</div>
              <div className="dashboard-stat"><strong>Passengers:</strong> <br />{stats.passengers}</div>
            </div>
            <h2>Arrivals & Departures</h2>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <select
              className="airport-select"
              value={selectedAirport}
              onChange={handleAirportChange}
              style={{ margin: '16px 0' }}
            >
              <option value="">Select Airport</option>
              {airports.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
              ))}
            </select>
            {selectedAirport && !loading && (
              <div className="arrivals-departures-results">
                <h3>Arrivals</h3>
                <ResizableTable
                  columns={[
                    { key: "flightNumber", label: "Flight #" },
                    { key: "airline", label: "Airline", render: f => f.airline?.name || "" },
                    { key: "aircraft", label: "Aircraft", render: f => f.aircraft?.type || "" },
                    { key: "originAirport", label: "Origin", render: f => f.originAirport ? `${f.originAirport.name} (${f.originAirport.code})` : "" },
                    { key: "arrivalTime", label: "Scheduled Arrival", render: f => f.arrivalTime ? new Date(f.arrivalTime).toLocaleString() : "" },
                    { key: "gate", label: "Gate", render: f => f.gate?.name || f.gate?.code || f.gate?.number || "-" },
                    { key: "passengers", label: "Passengers", render: f => f.passengers?.length ?? 0 },
                  ]}
                  data={arrivals}
                />
                <h3>Departures</h3>
                <ResizableTable
                  columns={[
                    { key: "flightNumber", label: "Flight #" },
                    { key: "airline", label: "Airline", render: f => f.airline?.name || "" },
                    { key: "aircraft", label: "Aircraft", render: f => f.aircraft?.type || "" },
                    { key: "destinationAirport", label: "Destination", render: f => f.destinationAirport ? `${f.destinationAirport.name} (${f.destinationAirport.code})` : "" },
                    { key: "departureTime", label: "Scheduled Departure", render: f => f.departureTime ? new Date(f.departureTime).toLocaleString() : "" },
                    { key: "gate", label: "Gate", render: f => f.gate?.name || f.gate?.code || f.gate?.number || "-" },
                    { key: "passengers", label: "Passengers", render: f => f.passengers?.length ?? 0 },
                  ]}
                  data={departures}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ArrivalsDeparturesPage;
