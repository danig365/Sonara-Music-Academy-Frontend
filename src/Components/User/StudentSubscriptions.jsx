import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import './StudentSubscriptions.css';
import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QriK4FvQfkVZfKcMNu8LHUqNl4qZP2jFpYXGqCu5pQY9FmxNgVRUQ9q4rMxKPQqsGVuGrL4pGDSuTLNTNSs0006002mxKxbv';
const stripePromise = loadStripe(stripePublicKey);

// Payment Form Component
const PaymentForm = ({ plan, studentId, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // Validate input
            if (!name.trim()) {
                setError('Please enter your full name');
                setLoading(false);
                return;
            }
            if (!email.trim()) {
                setError('Please enter your email address');
                setLoading(false);
                return;
            }
            
            // Validate studentId
            if (!studentId) {
                setError('Student ID not found. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Validate plan
            if (!plan || !plan.id || !plan.final_price) {
                setError('Invalid plan information. Please try again.');
                setLoading(false);
                return;
            }

            const paymentData = {
                plan_id: parseInt(plan.id),
                student_id: parseInt(studentId),
                amount: Math.round(parseFloat(plan.final_price) * 100),
                email: email.trim(),
                name: name.trim()
            };
            
            console.log('='*80);
            console.log('📤 SENDING PAYMENT INTENT REQUEST');
            console.log('Plan object:', plan);
            console.log('StudentID type:', typeof studentId, 'value:', studentId);
            console.log('Plan ID type:', typeof plan.id, 'value:', plan.id);
            console.log('Plan final_price type:', typeof plan.final_price, 'value:', plan.final_price);
            console.log('Final payload being sent:', paymentData);
            console.log('Payload JSON:', JSON.stringify(paymentData, null, 2));
            console.log('='*80);

            // Create payment intent on backend
            const response = await axios.post(`${baseUrl}/subscription/create-payment-intent/`, paymentData);

            console.log('Payment intent response:', response.data);

            if (!response.data.clientSecret) {
                const errorMsg = 'Failed to initialize payment. Please try again.';
                console.error('❌ ' + errorMsg);
                console.error('Response was:', response.data);
                setError(errorMsg);
                setLoading(false);
                return;
            }

            const { clientSecret } = response.data;

            // Confirm payment with Stripe using confirmCardPayment (for CardElement)
            const cardElement = elements.getElement(CardElement);
            console.log('Card element:', cardElement);
            
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: name,
                        email: email
                    }
                }
            });

            if (error) {
                setError(error.message || 'Payment failed');
                console.error('Stripe error:', error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment successful - create subscription in database
                try {
                    await createSubscription(plan.id, studentId);
                    onSuccess();
                } catch (subscriptionError) {
                    console.error('Subscription creation error:', subscriptionError);
                    setError('Payment succeeded but failed to create subscription. Please contact support.');
                }
            } else if (paymentIntent && paymentIntent.status === 'processing') {
                setError('Payment is being processed. Please wait...');
            } else {
                setError('Payment was not completed. Please try again.');
            }
        } catch (err) {
            console.error('='*80);
            console.error('❌ PAYMENT ERROR OCCURRED');
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Full error:', err);
            
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
                console.error('Response headers:', err.response.headers);
            } else if (err.request) {
                console.error('Request was made but no response:', err.request);
            } else {
                console.error('Error setting up request:', err.message);
            }
            console.error('='*80);
            
            const errorMessage = err.response?.data?.error || err.message || 'Payment failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const createSubscription = async (planId, studentId) => {
        try {
            const today = new Date();
            const endDate = new Date(today);
            
            // Calculate end date based on plan duration
            if (plan.duration === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.duration === 'quarterly') {
                endDate.setMonth(endDate.getMonth() + 3);
            } else if (plan.duration === 'semi_annual') {
                endDate.setMonth(endDate.getMonth() + 6);
            } else if (plan.duration === 'annual') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            await axios.post(`${baseUrl}/subscriptions/`, {
                student: studentId,
                plan: planId,
                start_date: today.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                price_paid: plan.final_price,
                is_paid: true,
                status: 'active',
                auto_renew: true,
                lessons_used_this_month: 0,
                courses_accessed: 0,
                lessons_accessed: 0,
                current_week_lessons: 0,
                last_reset_date: today.toISOString().split('T')[0]
            });
        } catch (err) {
            console.error('Error creating subscription record:', err);
            throw err;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            {error && (
                <div className="alert alert-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}
            
            <div className="form-group">
                <label htmlFor="fullName">
                    <i className="bi bi-person me-2"></i>Full Name
                </label>
                <input
                    id="fullName"
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="email">
                    <i className="bi bi-envelope me-2"></i>Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="cardElement">
                    <i className="bi bi-credit-card me-2"></i>Card Information
                </label>
                <CardElement 
                    id="cardElement"
                    className="form-control card-element" 
                    options={{
                        hidePostalCode: true,
                        style: {
                            base: {
                                fontSize: '1rem',
                                color: '#495057',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                '::placeholder': {
                                    color: '#adb5bd'
                                }
                            },
                            invalid: {
                                color: '#dc3545'
                            }
                        }
                    }}
                />
            </div>

            <div className="d-flex gap-2 mt-4">
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="btn btn-success flex-grow-1"
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-lock me-2"></i>
                            Pay ${parseFloat(plan.final_price).toFixed(2)}
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// Main Component
const StudentSubscriptions = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [activeTab, setActiveTab] = useState('plans');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');

    // Handle window resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
        } else {
            document.title = 'Subscribe to Plans | EduLearning';
            getStudentId();
        }
    }, [studentLoginStatus, navigate]);

    const getStudentId = async () => {
        try {
            // Get student ID from localStorage or session
            const storedId = localStorage.getItem('studentId');
            console.log('Retrieved studentId from localStorage:', storedId);
            
            if (storedId) {
                setStudentId(storedId);
                fetchData(storedId);
            } else {
                // If no student ID in localStorage, try to fetch from API
                try {
                    const response = await axios.get(`${baseUrl}/student/`);
                    if (response.data && response.data.id) {
                        console.log('Retrieved studentId from API:', response.data.id);
                        setStudentId(response.data.id);
                        fetchData(response.data.id);
                    } else {
                        console.warn('Student data not found in API response');
                        setLoading(false);
                    }
                } catch (apiError) {
                    console.warn('Student ID not found. Please log in.');
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error getting student ID:', error);
            setLoading(false);
        }
    };

    const fetchData = async (id) => {
        try {
            setLoading(true);
            const [plansRes, subsRes] = await Promise.all([
                axios.get(`${baseUrl}/subscription-plans/`),
                axios.get(`${baseUrl}/subscriptions/?student_id=${id}`)
            ]);

            setPlans(plansRes.data.results || plansRes.data);
            setUserSubscriptions(subsRes.data.results || subsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isSubscribedToPlan = (planId) => {
        return userSubscriptions.some(
            sub => sub.plan === planId && (sub.status === 'active' || sub.status === 'pending')
        );
    };

    const handleSubscriptionSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: '🎉 Subscription Successful!',
            html: '<div style="text-align:center"><p style="font-size:16px;margin-bottom:10px">Thank you for subscribing!</p><div style="font-size:32px;margin:15px 0">✓</div><p style="color:#6b7280;font-size:14px">Your subscription is now active.</p></div>',
            timer: 3000,
            showConfirmButton: true,
            confirmButtonText: 'Got it!',
            allowOutsideClick: false,
            background: '#ffffff',
            color: '#111827'
        }).then(() => {
            setSelectedPlan(null);
            if (studentId) {
                fetchData(studentId);
            }
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
                <div className="dashboard-content">
                    <div className="mobile-header">
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <i className="bi bi-list"></i>
                        </button>
                    </div>
                    <div className="container mt-5 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!studentId) {
        return (
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
                <div className="dashboard-content">
                    <div className="mobile-header">
                        <button 
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle sidebar"
                        >
                            <i className="bi bi-list"></i>
                        </button>
                    </div>
                    <div className="container mt-5">
                        <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Please log in to subscribe to plans.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
            <div className="dashboard-content">
                <div className="mobile-header">
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <i className="bi bi-list"></i>
                    </button>
                </div>
                <div className="content-wrapper">
                    <div className="student-subscriptions">
            <h2 className="mb-4 subscription-header">
                <i className="bi bi-credit-card-2-front me-2"></i>
                Subscribe to Plans
            </h2>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'plans' ? 'active' : ''}`}
                        onClick={() => setActiveTab('plans')}
                    >
                        <i className="bi bi-box me-2"></i>Available Plans
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`nav-link ${activeTab === 'my-subscriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-subscriptions')}
                    >
                        <i className="bi bi-check-circle me-2"></i>My Subscriptions
                    </button>
                </li>
            </ul>

            {/* Available Plans Tab */}
            {activeTab === 'plans' && (
                <div>
                    <div className="plans-grid">
                        {plans.map(plan => (
                            <div key={plan.id} className="plan-card">
                                <div className="plan-header">
                                    <h5>{plan.name}</h5>
                                    <span className={`badge bg-${plan.status === 'active' ? 'success' : 'secondary'}`}>
                                        {plan.status}
                                    </span>
                                </div>
                                <p className="plan-description">{plan.description}</p>
                                
                                <div className="plan-price">
                                    <div className="price-main">${plan.final_price}</div>
                                    <div className="price-duration">/ {plan.duration}</div>
                                    {plan.discount_price && (
                                        <div className="price-discount">
                                            Was ${plan.price}
                                        </div>
                                    )}
                                </div>

                                <ul className="plan-features">
                                    <li className="feature">
                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                        Max {plan.max_courses} Courses
                                    </li>
                                    <li className="feature">
                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                        Max {plan.max_lessons} Lessons
                                    </li>
                                    {plan.lessons_per_week && (
                                        <li className="feature">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            {plan.lessons_per_week} Lessons/Week
                                        </li>
                                    )}
                                    {plan.features_list && plan.features_list.map((feature, idx) => (
                                        <li key={idx} className="feature">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => {
                                        console.log('Subscribe button clicked for plan:', plan);
                                        setSelectedPlan(plan);
                                    }}
                                    disabled={isSubscribedToPlan(plan.id)}
                                    className={`btn w-100 ${
                                        isSubscribedToPlan(plan.id)
                                            ? 'btn-secondary'
                                            : 'btn-primary'
                                    }`}
                                >
                                    {isSubscribedToPlan(plan.id) ? (
                                        <>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Already Subscribed
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-cart-plus me-2"></i>
                                            Subscribe Now
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Subscriptions Tab */}
            {activeTab === 'my-subscriptions' && (
                <div>
                    {userSubscriptions.length === 0 ? (
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            You don't have any active subscriptions yet. Browse our plans and subscribe to get started!
                        </div>
                    ) : (
                        <div className="row">
                            {userSubscriptions.map(sub => (
                                <div key={sub.id} className="col-md-6 col-lg-4 mb-4">
                                    <div className="card h-100 subscription-card">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                {sub.plan_details?.name || 'Plan'}
                                            </h5>
                                            <div className="mb-3">
                                                <span className={`badge bg-${
                                                    sub.status === 'active' ? 'success' :
                                                    sub.status === 'pending' ? 'warning' :
                                                    'danger'
                                                }`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <ul className="subscription-details">
                                                <li>
                                                    <strong>Price:</strong> ${sub.price_paid}
                                                </li>
                                                <li>
                                                    <strong>Start:</strong> {new Date(sub.start_date).toLocaleDateString()}
                                                </li>
                                                <li>
                                                    <strong>End:</strong> {new Date(sub.end_date).toLocaleDateString()}
                                                </li>
                                                {sub.is_active_status && (
                                                    <li className="text-success">
                                                        <strong>Days Remaining:</strong> {sub.days_remaining}
                                                    </li>
                                                )}
                                                <li>
                                                    <strong>Max Courses:</strong> {sub.plan_details?.max_courses}
                                                </li>
                                                <li>
                                                    <strong>Max Lessons:</strong> {sub.plan_details?.max_lessons}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {selectedPlan && (
                <div className="modal d-block show" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="modal-title mb-1">
                                        Complete Your Purchase
                                    </h5>
                                    <p style={{fontSize: '0.85rem', margin: 0, opacity: 0.9}}>
                                        {selectedPlan.name} Plan
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedPlan(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Plan Summary */}
                                <div className="plan-summary">
                                    <div style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid #e9ecef'}}>
                                        <h6 style={{color: '#6c757d', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0}}>
                                            Order Summary
                                        </h6>
                                    </div>
                                    
                                    <div className="summary-item">
                                        <span>{selectedPlan.name} Plan</span>
                                        <span>${parseFloat(selectedPlan.price).toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="summary-item">
                                        <span>Duration</span>
                                        <span style={{textTransform: 'capitalize'}}>{selectedPlan.duration.replace('_', ' ')}</span>
                                    </div>
                                    
                                    {selectedPlan.discount_price && (
                                        <div className="summary-item discount">
                                            <span><i className="bi bi-tag-fill me-2"></i>Special Offer</span>
                                            <span>-${(parseFloat(selectedPlan.price) - parseFloat(selectedPlan.discount_price)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="summary-item total">
                                        <span>You Pay</span>
                                        <span>${parseFloat(selectedPlan.final_price).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Form */}
                                <Elements stripe={stripePromise}>
                                    <PaymentForm
                                        plan={selectedPlan}
                                        studentId={studentId}
                                        onSuccess={handleSubscriptionSuccess}
                                        onCancel={() => setSelectedPlan(null)}
                                    />
                                </Elements>
                                
                                {/* Security Info */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    color: '#6c757d'
                                }}>
                                    <i className="bi bi-shield-check" style={{color: '#28a745', marginRight: '0.5rem'}}></i>
                                    Secure payment powered by <strong>Stripe</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSubscriptions;
