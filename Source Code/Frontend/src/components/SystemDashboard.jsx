import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SystemDashboard = () => {
  const [storeOwners, setStoreOwners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch store owners from the backend
    axios
      .get("http://127.0.0.1:8000/GetStoreOwner/")
      .then((response) => {
        setStoreOwners(response.data);
      })
      .catch((error) => {
        console.error("Error fetching store owners:", error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const deactivateOwner = (id) => {
    axios
      .patch(`http://127.0.0.1:8000/GetStoreOwner/${id}/deactivate/`)
      .then((response) => {
        // Update the UI after deactivation
        setStoreOwners((prevOwners) =>
          prevOwners.filter((owner) => owner.id !== id)
        );
      })
      .catch((error) => {
        console.error("Error deactivating store owner:", error);
      });
  };

  return (
    <div className="">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Admin Dashboard
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Store Owners List */}
      <div className="container">
        <h2 className="mb-4">Store Owners</h2>
        <div className="row">
          {storeOwners.map((owner) => (
            <div className="col-md-4 mb-4" key={owner.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    {owner.first_name + " " + owner.last_name}
                  </h5>
                  <p className="card-text">
                    Email: {owner.email} <br />
                    Status: {owner.is_active ? "Active" : "Inactive"}
                  </p>
                  <button
                    className="btn btn-danger"
                    onClick={() => deactivateOwner(owner.id)}
                    disabled={!owner.is_active}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;
