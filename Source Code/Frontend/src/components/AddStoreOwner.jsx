import React, { useState } from "react";
import axios from "axios";
import imgSrc from "../imgs/account.svg";

const AddStoreOwner = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    storeName: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Token (would normally come from authentication process)
  const token = localStorage.getItem("authToken"); // Example of token storage

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        "/api/admin/add-store-owner",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("Store owner added successfully!");
      setError(""); // clear any previous error
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        storeName: "",
      });
    } catch (err) {
      setError("An error occurred while adding the store owner.");
      setMessage(""); // clear any previous success message
    }
  };

  return (
    <section className="vh-100 d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row d-flex justify-content-around align-items-center h-100">
          <div className="col-md-6 d-none d-lg-block">
            <img src={imgSrc} className="img-fluid" alt="Sample" width={400} />
          </div>

          <div className="card shadow-lg p-3 mb-5 bg-white rounded col-md-6 col-lg-5">
            <h3 className="card-header bg-secondary  text-white text-center">
              Add Store Owner
            </h3>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="name">Owner's Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter owner's name"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter owner's email"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="storeName">Store Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add Store Owner
                </button>
              </form>
              {/* Display success or error message */}
              {message && (
                <div className="alert alert-success mt-3">{message}</div>
              )}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddStoreOwner;
