import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SchoolLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('schoolLoginStatus');
        localStorage.removeItem('schoolUserId');
        localStorage.removeItem('schoolId');
        localStorage.removeItem('schoolName');
        localStorage.removeItem('schoolEmail');
        navigate('/school-login');
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

export default SchoolLogout;
