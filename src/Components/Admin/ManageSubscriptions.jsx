import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageSubscriptions.css';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const ManageSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState({
        school: '',
        plan: 'free',
        status: 'pending',
        price: 0,
        start_date: '',
        end_date: '',
        auto_renew: false
    });

    useEffect(() => {
        document.title = 'Manage Subscriptions | Admin Dashboard';
        fetchSchools();
        fetchSubscriptions();
    }, [filterStatus]);

    const fetchSchools = async () => {
        try {
            const response = await axios.get(`${baseUrl}/schools/`);
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            let url = `${baseUrl}/subscriptions/`;
            if (filterStatus) {
                url += `?status=${filterStatus}`;
            }
            const response = await axios.get(url);
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubscription) {
                await axios.put(`${baseUrl}/subscriptions/${editingSubscription.id}/`, formData);
            } else {
                await axios.post(`${baseUrl}/subscriptions/`, formData);
            }
            fetchSubscriptions();
            closeModal();
        } catch (error) {
            console.error('Error saving subscription:', error);
        }
    };

    const handleEdit = (subscription) => {
        setEditingSubscription(subscription);
        setFormData({
            school: subscription.school?.id || subscription.school,
            plan: subscription.plan,
            status: subscription.status,
            price: subscription.price,
            start_date: subscription.start_date,
            end_date: subscription.end_date,
            auto_renew: subscription.auto_renew
        });
        setShowModal(true);
    };

    const handleDelete = async (subscriptionId) => {
        if (window.confirm('Are you sure you want to delete this subscription?')) {
            try {
                await axios.delete(`${baseUrl}/subscriptions/${subscriptionId}/`);
                fetchSubscriptions();
            } catch (error) {
                console.error('Error deleting subscription:', error);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSubscription(null);
        setFormData({
            school: '',
            plan: 'free',
            status: 'pending',
            price: 0,
            start_date: '',
            end_date: '',
            auto_renew: false
        });
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

    const getPlanBadge = (plan) => {
        const badges = {
            free: 'bg-secondary',
            basic: 'bg-info',
            pro: 'bg-primary',
            enterprise: 'bg-dark'
        };
        return badges[plan] || 'bg-secondary';
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
        <>
            <div className="d-flex justify-content-between align-items-center subscriptions-header-wrapper">
                <h2 className="subscriptions-header mb-0">
                    <i className="bi bi-credit-card me-2"></i>
                    Manage Subscriptions
                </h2>
                <button 
                    className="btn subscriptions-add-btn"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Subscription
                </button>
            </div>

            {/* Filter */}
            <div className="card subscriptions-filter-card">
                <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-3">
                                    <label className="form-label">Filter by Status:</label>
                                </div>
                                <div className="col-md-6">
                                    <select
                                        className="form-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">All Subscriptions</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions Table */}
                    <div className="card subscriptions-table-card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover subscriptions-table">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>School</th>
                                            <th>Plan</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Auto Renew</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.length > 0 ? (
                                            subscriptions.map((subscription, index) => (
                                                <tr key={subscription.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{subscription.school?.name || 'Unknown'}</td>
                                                    <td>
                                                        <span className={`badge ${getPlanBadge(subscription.plan)}`}>
                                                            {subscription.plan?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(subscription.status)}`}>
                                                            {subscription.status}
                                                        </span>
                                                    </td>
                                                    <td>₹{subscription.price}</td>
                                                    <td>{subscription.start_date}</td>
                                                    <td>{subscription.end_date}</td>
                                                    <td>
                                                        {subscription.auto_renew ? (
                                                            <i className="bi bi-check-circle text-success"></i>
                                                        ) : (
                                                            <i className="bi bi-x-circle text-danger"></i>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => handleEdit(subscription)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(subscription.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center text-muted py-4">
                                                    No subscriptions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

            {/* Add/Edit Subscription Modal */}
            {showModal && (
                <div className="modal show d-block subscriptions-modal" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">School *</label>
                                        <select
                                            className="form-select"
                                            name="school"
                                            value={formData.school}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select School</option>
                                            {schools.map(school => (
                                                <option key={school.id} value={school.id}>
                                                    {school.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Plan *</label>
                                            <select
                                                className="form-select"
                                                name="plan"
                                                value={formData.plan}
                                                onChange={handleChange}
                                            >
                                                <option value="free">Free</option>
                                                <option value="basic">Basic</option>
                                                <option value="pro">Professional</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status *</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                                <option value="expired">Expired</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Price (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Start Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">End Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="autoRenew"
                                            name="auto_renew"
                                            checked={formData.auto_renew}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="autoRenew">
                                            Auto Renew
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingSubscription ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageSubscriptions;
