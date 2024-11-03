import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import loginImg from "../../images/greenLogin.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    try {
      // Send login request
      const response = await axios.post("http://127.0.0.1:8000/login/", {
        email: email,
        password: password,
      });

      // const { token, role } = response.data;
      const role = response.data.user.account_type;
      localStorage.setItem("access_token", response.data.access_token); // Store token in localStorage
      localStorage.setItem("role", role); // Store role in localStorage

      // Redirect based on role
      if (role === "system_owner") {
        window.location.href = 'http://127.0.0.1:8000//admin';
      }
      else if (role === "store_owner") {
        navigate("/store-dashboard");
        window.location.reload();
      }
      else if (role === "customer") {
        navigate("/");
        window.location.reload();
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } catch (err) {
      // Handle error
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <section className="vh-100 d-flex justify-content-center align-items-center">
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-6 d-none d-lg-block">
            <img
              src={loginImg}
              className="img-fluid"
              alt="Sample"
              width={450}
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <h2 className="mb-4 text-center">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-outline mb-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter a valid email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary btn-block">
                  Login
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                Don't have an account?{" "}
                <Link to="/sign-up" className="text-primary">
                  sign up here
                </Link>
              </p>
            </div>
            {/* Error display */}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
