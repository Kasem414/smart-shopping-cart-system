import React, { useState } from 'react'
import axios from "axios";
import loginImg from '../imgs/login.svg'


function LoginForm() {


        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        
        const handleLogin = async (e) => {
          e.preventDefault();
          
          try {
            const response = await axios.post('http://localhost:8000/login/', {
              email: email,
              password: password
            });
            
            // Handle success
            console.log(response.data);
            alert("Login successful!");
            
          } catch (err) {
            // Handle error
            console.error(err);
            setError("Invalid email or password.");
            console.log(error);
            
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
                    width={400}
                    />
                </div>
                <div className="col-md-6 col-lg-4">
                    <h2 className='mb-4 text-center'>Login</h2>
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
                        <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        >
                        Login
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
        </section>
    )
}

export default LoginForm
