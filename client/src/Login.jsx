import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send request to the backend to check if the email exists in the database
    try {
      const response = await fetch('http://localhost:5000/login', { // Fixed URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      // If the email exists in the database, redirect to home page
      if (response.status === 200) { // Backend sends 200 status if email exists
        navigate('/home');
      } else {
        // Show error if email not found
        setError(data.message || 'Email not found');
      }
    } catch (error) {
      console.error(error);
      setError('Error connecting to server');
    }
  };

  


  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h5 className="modal-title mx-auto py-3">Login</h5>
            </div>
            <div className="modal-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-dark w-100 py-2 fw-semibold mb-3">
                  Submit
                </button>

                <button 
                  type="button" 
                  className="btn btn-dark w-100 py-2 fw-semibold"
                  onclick="window.location.href='/auth/login';">
                  Login with Entra ID
                </button>

                {error && <p className="text-danger mt-3">{error}</p>}
              </form>
            </div>
            <div className="modal-footer border-0 text-center bg-light rounded-bottom-4">
              <p className="mb-0">
                Don't have an account?{" "}
                <a href="/signup" className="text-primary fw-bold">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
