import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('adminLoginStatus');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminName');
        navigate('/admin-login');
    }, [navigate]);

    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Logging out...</span>
            </div>
            <p className="mt-3">Logging out...</p>
        </div>
    );
};

export default AdminLogout;
