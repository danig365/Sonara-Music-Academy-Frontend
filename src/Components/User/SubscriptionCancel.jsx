import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const SubscriptionCancel = () => {
    const navigate = useNavigate();
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');

    useEffect(() => {
        document.title = 'Payment Cancelled | EduLearning';
        
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
        }
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
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    ✕
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '10px',
                    color: '#0f172a'
                }}>
                    Payment Cancelled
                </h1>
                <p style={{
                    color: '#64748b',
                    marginBottom: '30px'
                }}>
                    Your subscription payment was cancelled. You can try again or choose a different plan.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    <Link 
                        to='/pricing'
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        Try Again
                    </Link>
                    <Link 
                        to='/user-dashboard'
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#e2e8f0',
                            color: '#0f172a',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#cbd5e1'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCancel;
