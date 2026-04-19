import "./App.css";
import "./Navbar.css";
import "./AppLogin.css";
import "./index.css";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
// Wrapper to redirect /profile to the correct user profile or admin dashboard
import { useEffect } from "react";
import { apiFetch } from "./api/apiFetch";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ArrivalsDeparturesPage from "./pages/ArrivalsDeparturesPage";
import AdminDashboard from "./pages/AdminDashboard";
import FlightsPage from "./pages/FlightsPage";
import AircraftPage from "./pages/AircraftPage";
import AirlinesPage from "./pages/AirlinesPage";
import GatesPage from "./pages/GatesPage";
import AirportsPage from "./pages/AirportsPage";
import CitiesPage from "./pages/CitiesPage";
import PassengersPage from "./pages/PassengersPage";
import PassengerProfilePage from "./pages/PassengerProfilePage";
import SignupPage from "./pages/SignupPage";


import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";

import Navbar from "./components/Navbar";









const App = () => (
  <AuthProvider>
    <SearchProvider>
      <Router>
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1}}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ArrivalsDeparturesPage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* Admin routes, only accessible for admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/flights" element={<FlightsPage adminMode={true} />} />
              <Route path="/admin/aircraft" element={<AircraftPage adminMode={true} />} />
              <Route path="/admin/airlines" element={<AirlinesPage adminMode={true} />} />
              <Route path="/admin/gates" element={<GatesPage adminMode={true} />} />
              <Route path="/admin/airports" element={<AirportsPage adminMode={true} />} />
              <Route path="/admin/cities" element={<CitiesPage adminMode={true} />} />
              <Route path="/admin/passengers" element={<PassengersPage adminMode={true} />} />
              {/* Regular user routes */}
              <Route path="/flights" element={<FlightsPage adminMode={false} />} />
              <Route path="/aircraft" element={<AircraftPage adminMode={false} />} />
              <Route path="/airlines" element={<AirlinesPage adminMode={false} />} />
              <Route path="/gates" element={<GatesPage adminMode={false} />} />
              <Route path="/airports" element={<AirportsPage adminMode={false} />} />
              <Route path="/cities" element={<CitiesPage adminMode={false} />} />
              <Route path="/passengers" element={<PassengersPage adminMode={false} />} />
              <Route path="/passenger/:id" element={<PassengerProfilePage />} />
              <Route path="/profile" element={<PassengerProfilePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          {/* Footer will be added in a feature branch */}
        </div>
      </Router>
    </SearchProvider>
  </AuthProvider>
);

export default App;
