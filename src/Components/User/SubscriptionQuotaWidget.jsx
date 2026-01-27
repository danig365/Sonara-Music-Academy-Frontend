import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const SubscriptionQuotaWidget = ({ studentId }) => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptionData();
    }, [studentId]);

    const fetchSubscriptionData = async () => {
        try {
            // Fetch subscription data
            const subResponse = await axios.get(`${API_BASE_URL}/student/${studentId}/subscription/`);
            setSubscription(subResponse.data);
        } catch (error) {
            console.log('No active subscription found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card border-0 h-100">
                <div className="card-body text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="card border-0 bg-light h-100">
                <div className="card-header bg-gradient">
                    <h5 className="mb-0">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        No Active Subscription
                    </h5>
                </div>
                <div className="card-body text-center">
                    <p className="text-muted mb-3">Upgrade to get private lessons with a teacher!</p>
                    <Link to="/pricing" className="btn btn-primary btn-sm">
                        <i className="bi bi-lightning-charge me-2"></i>
                        View Plans
                    </Link>
                </div>
            </div>
        );
    }

    const quotaPercentage = (subscription.lessons_used_this_month / (subscription.plan_details?.lessons_per_month || 1)) * 100;
    const lessonsRemaining = subscription.lessons_remaining || 0;
    const planName = subscription.plan_details?.name?.toUpperCase() || 'UNKNOWN';
    const planPrice = subscription.plan_details?.monthly_price || 0;

    const getQuotaColor = () => {
        if (quotaPercentage < 50) return 'success';
        if (quotaPercentage < 80) return 'warning';
        return 'danger';
    };

    return (
        <div className="card border-0 h-100 shadow-sm">
            <div className="card-header bg-gradient" style={{ background: `linear-gradient(135deg, #4285f4 0%, #34a853 100%)` }}>
                <h5 className="mb-0 text-white">
                    <i className="bi bi-calendar-check me-2"></i>
                    Subscription Status
                </h5>
            </div>
            <div className="card-body">
                {/* Plan Badge */}
                <div className="mb-3 text-center">
                    <span className="badge bg-primary px-3 py-2">
                        <i className="bi bi-gem me-1"></i>
                        {planName} Plan - ${planPrice}/month
                    </span>
                </div>

                {/* Status */}
                <div className="mb-3 text-center">
                    <span className={`badge bg-${subscription.is_valid ? 'success' : 'danger'}`}>
                        {subscription.status.toUpperCase()}
                    </span>
                </div>

                {/* Quota Progress */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Lesson Quota</small>
                        <small className="fw-bold">
                            {subscription.lessons_used_this_month}/{subscription.plan_details?.lessons_per_month || 0}
                        </small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                        <div
                            className={`progress-bar bg-${getQuotaColor()}`}
                            role="progressbar"
                            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Lessons Remaining */}
                <div className="alert alert-info mb-0" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>{lessonsRemaining} lessons</strong> remaining this month
                </div>

                {/* Action Button */}
                <div className="mt-3">
                    {lessonsRemaining > 0 ? (
                        <Link to="/book-lesson" className="btn btn-primary btn-sm w-100">
                            <i className="bi bi-plus-circle me-2"></i>
                            Book a Lesson
                        </Link>
                    ) : (
                        <div className="alert alert-warning mb-0">
                            <small>Quota exhausted. Lessons reset monthly.</small>
                        </div>
                    )}
                </div>

                {/* Subscription Dates */}
                <div className="mt-3 pt-3 border-top">
                    <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
                    </small>
                    <small className="text-muted d-block">
                        <i className="bi bi-arrow-repeat me-1"></i>
                        {subscription.auto_renew ? 'Auto-renews' : 'Expires on renewal date'}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionQuotaWidget;
