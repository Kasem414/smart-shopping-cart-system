import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import img from "../imgs/password.svg";

// Function to extract token from URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SetPassword = () => {
  const query = useQuery();
  const token = query.get("token"); // Get token from URL

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    token: token || "", // Save the token from the URL
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Check password match in real-time
    if (name === "confirmPassword" || name === "password") {
      if (
        (formData.password !== value && name === "confirmPassword") ||
        (formData.password !== value && name === "password")
      ) {
        setPasswordError("Passwords do not match.");
      } else {
        setPasswordError("");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to the server with token, email, and password
      const response = await axios.post("/api/set-password", formData);
      setMessage("Password has been set successfully!");
      setError(""); // Clear previous errors
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        token: "", // Clear token after success
      });
    } catch (err) {
      setError("An error occurred. Please try again.");
      setMessage(""); // Clear previous success message
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No token found. Please use the link sent to your email.");
    }
  }, [token]);

  return (
    <section className="vh-100 d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-6 d-none d-lg-block">
            <img src={img} className="img-fluid" alt="Sample" width={400} />
          </div>

          <div className="card shadow-lg p-4 bg-white rounded col-md-6 col-lg-4">
            <h3 className="card-header bg-primary text-white text-center">
              Set Your Password
            </h3>
            <div className="card-body">
              {!error && (
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control ${
                        passwordError ? "is-invalid" : ""
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                    {passwordError && (
                      <div className="invalid-feedback">{passwordError}</div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={passwordError}
                  >
                    Set Password
                  </button>
                </form>
              )}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {message && (
                <div className="alert alert-success mt-3">{message}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetPassword;
