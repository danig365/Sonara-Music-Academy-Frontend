import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';

const PricingPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const studentId = localStorage.getItem('studentId');
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');

    useEffect(() => {
        document.title = 'Pricing Plans | EduLearning';
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
        } else {
            fetchPlans();
        }
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/subscription-plans/`);
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load pricing plans'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (planId) => {
        setSelectedPlan(planId);
        try {
            const response = await axios.post(`${API_BASE_URL}/subscription/checkout/`, {
                student_id: studentId,
                plan_id: planId
            });

            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.error || 'Failed to create checkout session'
            });
            setSelectedPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="pricing-page py-5 bg-light">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold mb-3">Choose Your Plan</h1>
                    <p className="lead text-muted">Start learning with a private tutor today</p>
                </div>

                {/* Pricing Cards */}
                <div className="row g-4">
                    {plans.map((plan, index) => (
                        <div key={plan.id} className="col-md-4">
                            <div className={`card pricing-card h-100 ${index === 1 ? 'border-primary shadow-lg' : ''}`}>
                                {index === 1 && (
                                    <div className="badge bg-primary position-absolute" style={{ top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                                        Most Popular
                                    </div>
                                )}

                                <div className="card-body d-flex flex-column">
                                    {/* Plan Name */}
                                    <h3 className="card-title mb-2">
                                        {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan
                                    </h3>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className="display-5 fw-bold">${plan.monthly_price}</span>
                                        <span className="text-muted">/month</span>
                                    </div>

                                    {/* Lessons Count */}
                                    <div className="alert alert-info mb-4">
                                        <i className="bi bi-calendar-check me-2"></i>
                                        <strong>{plan.lessons_per_month} lesson{plan.lessons_per_month > 1 ? 's' : ''}/month</strong>
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted mb-4">{plan.description}</p>

                                    {/* Features */}
                                    <div className="mb-4 flex-grow-1">
                                        <h6 className="mb-3">What's included:</h6>
                                        <ul className="list-unstyled">
                                            {plan.lessons_per_month === 1 && (
                                                <>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>1 private lesson per month</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Teacher feedback</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Progress notes</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Access to lesson materials</span>
                                                    </li>
                                                </>
                                            )}
                                            {plan.lessons_per_month === 4 && (
                                                <>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>4 private lessons per month</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Weekly lesson schedule</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Teacher attendance tracking</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Comprehensive progress notes</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Student dashboard with progress</span>
                                                    </li>
                                                </>
                                            )}
                                            {plan.lessons_per_month === 8 && (
                                                <>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>8 private lessons per month</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Bi-weekly lessons (2 per week)</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Advanced progress tracking</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Personalized curriculum</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Priority scheduling support</span>
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        <span>Full access to lesson materials</span>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        className={`btn ${index === 1 ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100`}
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={selectedPlan !== null}
                                    >
                                        {selectedPlan === plan.id ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-credit-card me-2"></i>
                                                Choose Plan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 bg-white">
                            <div className="card-body p-5">
                                <h3 className="mb-4">Frequently Asked Questions</h3>
                                
                                <div className="accordion" id="pricingFAQ">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                                Can I change my plan anytime?
                                            </button>
                                        </h2>
                                        <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#pricingFAQ">
                                            <div className="accordion-body">
                                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                                What payment methods do you accept?
                                            </button>
                                        </h2>
                                        <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                                            <div className="accordion-body">
                                                We accept all major credit and debit cards through Stripe secure checkout.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                                Can I cancel my subscription?
                                            </button>
                                        </h2>
                                        <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                                            <div className="accordion-body">
                                                Yes, you can cancel anytime. Your access continues until the end of your billing period.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                                                What if I can't use my lessons?
                                            </button>
                                        </h2>
                                        <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                                            <div className="accordion-body">
                                                Lessons expire at the end of each month. We recommend planning your lessons in advance. Contact support if you have scheduling conflicts.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pricing-page {
                    min-height: 100vh;
                }

                .pricing-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 2px solid #e0e0e0;
                }

                .pricing-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }

                .pricing-card.border-primary {
                    border: 2px solid #0d6efd;
                }
            `}</style>
        </div>
    );
};

export default PricingPage;
