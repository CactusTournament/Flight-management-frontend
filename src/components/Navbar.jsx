import React, { useContext, useState } from "react";
// Ensure React is in scope for hooks in UserProfileLink
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SearchContext } from "../context/SearchContext";
import { apiFetch } from "../api/apiFetch";
import "../Navbar.css";

const Navbar = () => {

  const { auth, setAuth } = useContext(AuthContext);
  const { setSearchResults, setShowDropdown, searchResults, showDropdown } = useContext(SearchContext);
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = () => {
    setAuth({ user: null, password: null });
    setSearchResults([]);
    setShowDropdown(false);
    navigate("/login");
  };


  const [search, setSearch] = useState("");
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResults([]);
    setShowDropdown(false);
    if (!search) return;
    try {
      // Search flights, airports, passengers by keyword
      const [flights, airports, passengers] = await Promise.all([
        apiFetch("http://localhost:8080/flights", auth),
        apiFetch("http://localhost:8080/airports", auth),
        apiFetch("http://localhost:8080/passengers", auth),
      ]);
      const results = [
        ...flights.map(f => ({ ...f, _type: "flight" })).filter(f => f.flightNumber?.toLowerCase().includes(search.toLowerCase())),
        ...airports.map(a => ({ ...a, _type: "airport" })).filter(a => a.name?.toLowerCase().includes(search.toLowerCase())),
        ...passengers.map(p => ({ ...p, _type: "passenger" })).filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())),
      ];
      setSearchResults(results);
      setShowDropdown(true);
    } catch {}
  };

  // Clear search results on route change
  React.useEffect(() => {
    setSearchResults([]);
    setShowDropdown(false);
  }, [location.pathname]);



  return (
    <nav className="navbar">
      <div className="navbar-links">
        {auth.user && (
          <UserProfileLink username={auth.user} auth={auth} />
        )}
      </div>
      <div style={{position: 'relative', display: 'inline-block'}}>
        <form className="navbar-search-form" onSubmit={handleSearch} autoComplete="off">
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
        </form>
        {showDropdown && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 100,
            width: 350,
            maxHeight: 250,
            overflowY: 'auto',
            padding: 0
          }}>
            {searchResults.map((r, i) => (
              <div key={r.id || i} style={{padding: '8px 12px', borderBottom: '1px solid #eee'}}>
                {r._type === 'flight' ? (
                  <Link to={`/admin/flights`} style={{textDecoration: 'none'}} onClick={()=>setShowDropdown(false)}>
                    ✈️ Flight: {r.flightNumber}
                  </Link>
                ) : r._type === 'airport' ? (
                  <Link to={`/admin/airports`} style={{textDecoration: 'none'}} onClick={()=>setShowDropdown(false)}>
                    🛬 Airport: {r.name}
                  </Link>
                ) : r._type === 'passenger' ? (
                  <Link to={`/admin/passengers`} style={{textDecoration: 'none'}} onClick={()=>setShowDropdown(false)}>
                    👤 Passenger: {r.firstName} {r.lastName}
                  </Link>
                ) : (
                  <span>Result</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="navbar-auth">
        {auth.user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

// Helper component to fetch user id and link to profile
function UserProfileLink({ username, auth }) {
  const [id, setId] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    async function fetchId() {
      try {
        const passengers = await apiFetch("http://localhost:8080/passengers", auth);
        const flat = Array.isArray(passengers[0]) ? passengers[0] : passengers;
        const match = flat.find(p => p.username === username);
        if (mounted && match) setId(match.id);
      } catch (e) {}
    }
    fetchId();
    return () => { mounted = false; };
  }, [username, auth]);
  const profileLink = id ? `/passenger/${id}` : "/profile";
  return (
    <Link
      to={profileLink}
      style={{
        fontWeight: 600,
        fontSize: '1.48em',
        color: '#ff7220',
        textDecoration: 'none',
        marginRight: 16
      }}
    >
      {username}
    </Link>
  );
}

export default Navbar;
