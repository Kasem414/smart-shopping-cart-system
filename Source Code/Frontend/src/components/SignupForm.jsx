import React, { useState } from "react";
import axios from "axios";
import img from "../imgs/signup.svg";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    account_type: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  // Handle change in form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Check password match in real-time
    const { name, value } = e.target;
    if (name === "confirmPassword" || name === "password") {
      if (
        (formData.password !== value && name === "confirmPassword") ||
        (formData.confirmPassword !== value && name === "password")
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
    setErrors("");
    console.log(formData);

    try {
      // Send the signup request to the backend
      const response = await axios.post("http://127.0.0.1:8000/signup/", {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        date_of_birth: formData.date_of_birth,
        account_type: formData.account_type,
      });

      if (response.data && response.data.token) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          date_of_birth: "",
        });
        setErrors("");
        navigate("/login");
      } else {
        setErrors("Failed to create account. Try again later.");
      }
    } catch (error) {
      setErrors("An error occurred during sign-up. Please try again.");
    }
  };

  return (
    <section className="vh-100 d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row d-flex justify-content-around align-items-center h-100">
          <div className="col-md-6 col-lg-4">
            {errors && <div className="alert alert-danger mt-3">{errors}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-outline mb-4">
                <input
                  id="first-name"
                  className="form-control"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  id="last-name"
                  className="form-control"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  className="form-control"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-outline mb-4">
                <input
                  className="form-control"
                  type="date"
                  id="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  className="form-control"
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  className={`form-control ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
              </div>

              <div className="form-outline mb-4">
                <select
                  name="account_type"
                  className="form-select"
                  value={formData.account_type}
                  onChange={handleChange}
                  required
                >
                  <option value="store_owner" selected>Store Owner</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary btn-block">
                  Sign Up
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  login here
                </Link>
              </p>
            </div>
          </div>

          <div className="col-md-5 d-none d-lg-block">
            <h2 className="mb-4">Sign Up</h2>
            <img src={img} className="img-fluid" alt="Sample" width={460} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
