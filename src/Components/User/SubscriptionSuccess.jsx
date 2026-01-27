import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

const SubscriptionSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');

    useEffect(() => {
        document.title = 'Subscription Successful | EduLearning';
        
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
            return;
        }

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your subscription has been activated. You can now book lessons!',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: (modal) => {
                setTimeout(() => {
                    navigate('/user-dashboard');
                }, 3000);
            }
        }).then(() => {
            navigate('/user-dashboard');
        });
    }, [studentLoginStatus, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    ✓
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    color: '#0f172a'
                }}>
                    Payment Successful!
                </h1>
                <p style={{
                    color: '#64748b',
                    marginBottom: '20px'
                }}>
                    Your subscription has been activated. You will be redirected to your dashboard shortly...
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite'
                    }}></div>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite',
                        animationDelay: '0.2s'
                    }}></div>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'pulse 1s infinite',
                        animationDelay: '0.4s'
                    }}></div>
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default SubscriptionSuccess;
