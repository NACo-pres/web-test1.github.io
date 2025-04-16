import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');

  // Handle changes in form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation before making the API call
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // If passwords match, make the API call to the backend to check if the email exists
    axios.post('http://localhost:5000/api/signup', formData)
      .then((result) => {
        // If successful, you can redirect the user to the login page or home page
        if (result.data.success) {
          alert('User created successfully! You can now log in.');
          // Optionally redirect the user to the login page
          window.location.href = '/login';
        }
      })
      .catch((err) => {
        console.error(err);
        // Handle any errors from the API call, for example, if email already exists
        if (err.response && err.response.data) {
          setError(err.response.data.message);  // Show error message from API
        } else {
          setError('An error occurred. Please try again later.');
        }
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header bg-dark text-white rounded-top-4">
              <h5 className="modal-title mx-auto py-3">Sign Up</h5>
            </div>
            <div className="modal-body p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter your name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100 py-2 fw-semibold">
                  Register
                </button>
              </form>

              {/* Display error message if any */}
              {error && <p className="text-danger mt-3">{error}</p>}
            </div>
            <div className="modal-footer border-0 text-center bg-light rounded-bottom-4">
              <p className="mb-0">
                Already have an account?{" "}
                <a href="/login" className="text-primary fw-bold">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
