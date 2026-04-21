import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/apiFetch";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../AppLogin.css";

const SignupPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    country: ""
  });
  const [countries, setCountries] = useState([]);
    // Fetch countries from REST Countries API
    useEffect(() => {
      async function fetchCountries() {
        try {
          const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
          const data = await res.json();
          // Sort alphabetically
          setCountries(data.map(c => c.name.common).sort((a, b) => a.localeCompare(b)));
        } catch {
          setCountries([]);
        }
      }
      fetchCountries();
    }, []);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Basic client-side validation
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || !form.country) {
      setError("Please fill in all required fields, including country.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      // Attach country as a string
      const payload = { ...form };
      const res = await fetch("http://localhost:8080/passengers/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccess("Signup successful! You can now log in.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        // Try to parse as JSON, fallback to text
        let errorMsg = "Signup failed.";
        try {
          const data = await res.json();
          errorMsg = data.message || data.error || JSON.stringify(data);
        } catch {
          try {
            errorMsg = await res.text();
          } catch {}
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="login-flex">
      <Sidebar />
      <div className="page-container login-form-container">
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
        <div className="contents-holder">
          <h2 className="login-form-title">Sign Up</h2>
          <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
            <div className="login-form-group">
              <label htmlFor="firstName" className="login-form-label">First Name</label>
              <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} required className="login-form-input" />
            </div>
            <div className="login-form-group">
              <label htmlFor="lastName" className="login-form-label">Last Name</label>
              <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} required className="login-form-input" />
            </div>
            <div className="login-form-group">
              <label htmlFor="username" className="login-form-label">Username</label>
              <input id="username" name="username" type="text" value={form.username} onChange={handleChange} required className="login-form-input" />
            </div>
            <div className="login-form-group">
              <label htmlFor="email" className="login-form-label">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="login-form-input" />
            </div>
            <div className="login-form-group">
              <label htmlFor="phoneNumber" className="login-form-label">Phone Number</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} className="login-form-input" />
            </div>
            <div className="login-form-group">
              <label htmlFor="country" className="login-form-label">Country</label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                className="login-form-input"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div className="login-form-group login-form-password-group">
              <label htmlFor="password" className="login-form-label">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required className="login-form-input" />
            </div>
            <div className="login-form-group login-form-password-group">
              <label htmlFor="confirmPassword" className="login-form-label">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="login-form-input" />
            </div>
            <button type="submit" className="login-form-submit">Sign Up</button>
            {error && <div className="login-form-error">{error}</div>}
            {success && <div className="login-form-success">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
