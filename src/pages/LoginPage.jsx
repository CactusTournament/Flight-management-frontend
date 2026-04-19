import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "../AppLogin.css";

const LoginPage = () => {
  const { setAuth } = useContext(AuthContext);

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if (!user || !password) {
        setError("Please enter username and password");
        return;
      }
      const result = await setAuth({ user, password });
      if (result && result.success) {
        setTimeout(() => {
          const auth = JSON.parse(localStorage.getItem("auth"));
          if (auth && auth.role === "ADMIN") {
            navigate("/admin");
          } else if (auth && auth.user) {
            navigate("/profile");
          } else {
            navigate("/login");
          }
        }, 100);
      } else {
        setError(result && result.error ? result.error : "Login failed");
      }
    };

  return (
    <div className="login-flex">
      <Sidebar />
      <div className="page-container login-form-container">
        <button onClick={() => navigate(-1)} className="go-back-btn">Go Back</button>
        <div className="contents-holder">
          <h2 className="login-form-title">Sign in</h2>
          <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
            <div className="login-form-group">
              <label htmlFor="username" className="login-form-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={user}
                onChange={e => setUser(e.target.value)}
                required
                className="login-form-input"
              />
            </div>
            <div className="login-form-group login-form-password-group">
              <label htmlFor="password" className="login-form-label">Password</label>
              <input
                id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="login-form-input"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              className="login-form-password-toggle"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            type="submit"
            className="login-form-submit"
          >
            Login
          </button>
          <button
            type="button"
            className="login-form-submit"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <div className="login-form-hint">
          </div>
          {error && <div className="login-form-error">{error}</div>}
        </form>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
