import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const AdminLogin = () => {
    const navigate = useNavigate();
    const [adminLoginData, setAdminLoginData] = useState({
        email: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Admin Login | EduLearning';
        const adminLoginStatus = localStorage.getItem('adminLoginStatus');
        if (adminLoginStatus === 'true') {
            navigate('/admin-dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setAdminLoginData({
            ...adminLoginData,
            [e.target.name]: e.target.value
        });
        setErrorMsg('');
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append('email', adminLoginData.email);
        formData.append('password', adminLoginData.password);

        try {
            const response = await axios.post(`${baseUrl}/admin-login`, formData);
            if (response.data.bool === true) {
                localStorage.setItem('adminLoginStatus', 'true');
                localStorage.setItem('adminId', response.data.admin_id);
                localStorage.setItem('adminRole', response.data.role);
                localStorage.setItem('adminName', response.data.name);
                navigate('/admin-dashboard');
            } else {
                setErrorMsg('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg">
                        <div className="card-header bg-dark text-white text-center py-3">
                            <h4 className="mb-0">
                                <i className="bi bi-shield-lock me-2"></i>
                                Admin Login
                            </h4>
                        </div>
                        <div className="card-body p-4">
                            {errorMsg && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMsg}
                                </div>
                            )}
                            <form onSubmit={submitForm}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <i className="bi bi-envelope me-1"></i> Email
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={adminLoginData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-key me-1"></i> Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={adminLoginData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-dark w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Login
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer text-center py-3">
                            <Link to="/" className="text-decoration-none">
                                <i className="bi bi-arrow-left me-1"></i>
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
