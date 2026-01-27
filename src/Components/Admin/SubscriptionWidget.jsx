import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ManageSubscriptions.css';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const SubscriptionWidget = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [stats, setStats] = useState({
        active: 0,
        pending: 0,
        expired: 0,
        total_revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('active');

    useEffect(() => {
        fetchSubscriptions();
    }, [filterStatus]);

    const fetchSubscriptions = async () => {
        try {
            const response = await axios.get(`${baseUrl}/subscriptions/?status=${filterStatus}`);
            setSubscriptions(response.data);
            
            // Calculate stats
            const allSubs = await axios.get(`${baseUrl}/subscriptions/`);
            const data = allSubs.data;
            setStats({
                active: data.filter(s => s.status === 'active').length,
                pending: data.filter(s => s.status === 'pending').length,
                expired: data.filter(s => s.status === 'expired').length,
                total_revenue: data.reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
            });
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-success',
            expired: 'bg-danger',
            cancelled: 'bg-secondary',
            pending: 'bg-warning text-dark'
        };
        return badges[status] || 'bg-secondary';
    };

    return (
        <div className="card admin-content-card">
            <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="bi bi-credit-card-2-front me-2"></i>
                        Subscriptions Management
                    </h5>
                    <Link to="/admin/subscriptions" className="btn btn-sm btn-primary">
                        <i className="bi bi-gear me-1"></i>
                        Manage
                    </Link>
                </div>
            </div>
            <div className="card-body">
                {/* Stats Row */}
                <div className="row g-2 mb-3">
                    <div className="col-4">
                        <div className="stat-box bg-light rounded p-2 text-center">
                            <div className="stat-number text-success">{stats.active}</div>
                            <small className="text-muted">Active</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="stat-box bg-light rounded p-2 text-center">
                            <div className="stat-number text-warning">{stats.pending}</div>
                            <small className="text-muted">Pending</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="stat-box bg-light rounded p-2 text-center">
                            <div className="stat-number text-danger">{stats.expired}</div>
                            <small className="text-muted">Expired</small>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <small className="text-muted">
                        <i className="bi bi-cash-coin me-1"></i>
                        Total Revenue: <strong>${stats.total_revenue.toFixed(2)}</strong>
                    </small>
                </div>

                {/* Recent Subscriptions Table */}
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : subscriptions.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.slice(0, 5).map((sub) => (
                                    <tr key={sub.id}>
                                        <td className="small">{sub.student_name || 'N/A'}</td>
                                        <td className="small">{sub.plan_details?.name || sub.plan || 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(sub.status)} badge-sm`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="small">
                                            {new Date(sub.end_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted text-center mb-0">No subscriptions found</p>
                )}
            </div>
        </div>
    );
};

export default SubscriptionWidget;
