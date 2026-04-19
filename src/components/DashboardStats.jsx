import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiFetch } from "../api/apiFetch";

const DashboardStats = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({ flights: 0, airports: 0, airlines: 0, gates: 0, aircraft: 0, passengers: 0 });
  useEffect(() => {
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
    fetchStats();
  }, [auth]);
  return (
    <>
      <h2>Welcome to the Flight Management System</h2>
        <p style={{marginBottom: 24}}>View real-time arrivals and departures, search for flights, and manage all aviation data. Use the navigation bar above to access admin features.</p>

        {/* Dashboard Stats */}
        <div className="dashboard-stats" >
          <div className="dashboard-stat"><strong>Flights:</strong> <br/>{stats.flights}</div>
          <div className="dashboard-stat"><strong>Airports:</strong> <br/>{stats.airports}</div>
          <div className="dashboard-stat"><strong>Airlines:</strong> <br/>{stats.airlines}</div>
          <div className="dashboard-stat"><strong>Gates:</strong> <br/>{stats.gates}</div> 
          <div className="dashboard-stat"><strong>Aircraft:</strong> <br/>{stats.aircraft}</div>
          <div className="dashboard-stat"><strong>Passengers:</strong> <br/>{stats.passengers}</div>
        </div>
    </>
  );
};

export default DashboardStats;