import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const SchoolLogin = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'School Login | Sonara Music Academy';
        const schoolLoginStatus = localStorage.getItem('schoolLoginStatus');
        if (schoolLoginStatus === 'true') {
            navigate('/school-dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
        setErrorMsg('');
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append('email', loginData.email);
        formData.append('password', loginData.password);

        try {
            const response = await axios.post(`${baseUrl}/school-login`, formData);
            if (response.data.bool === true) {
                localStorage.setItem('schoolLoginStatus', 'true');
                localStorage.setItem('schoolUserId', response.data.school_user_id);
                localStorage.setItem('schoolId', response.data.school_id);
                localStorage.setItem('schoolName', response.data.school_name);
                localStorage.setItem('schoolEmail', response.data.school_email);
                navigate('/school-dashboard');
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
                        <div className="card-header text-white text-center py-3" style={{ backgroundColor: '#0d6efd' }}>
                            <h4 className="mb-0">
                                <i className="bi bi-building me-2"></i>
                                School Login
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
                                        value={loginData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your school email"
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
                                        value={loginData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-100"
                                    style={{ backgroundColor: '#0d6efd', color: '#fff' }}
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

export default SchoolLogin;
