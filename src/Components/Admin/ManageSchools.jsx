import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

const baseUrl = 'http://127.0.0.1:8000/api';

const ManageSchools = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        website: '',
        status: 'trial',
        max_teachers: 10,
        max_students: 100,
        max_courses: 50
    });

    useEffect(() => {
        document.title = 'Manage Schools | Admin Dashboard';
        const adminLoginStatus = localStorage.getItem('adminLoginStatus');
        if (adminLoginStatus !== 'true') {
            navigate('/admin-login');
            return;
        }
        fetchSchools();
    }, [navigate]);

    const fetchSchools = async () => {
        try {
            const response = await axios.get(`${baseUrl}/schools/`);
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSchool) {
                await axios.put(`${baseUrl}/schools/${editingSchool.id}/`, formData);
            } else {
                await axios.post(`${baseUrl}/schools/`, formData);
            }
            fetchSchools();
            closeModal();
        } catch (error) {
            console.error('Error saving school:', error);
        }
    };

    const handleEdit = (school) => {
        setEditingSchool(school);
        setFormData({
            name: school.name,
            email: school.email,
            phone: school.phone || '',
            address: school.address || '',
            city: school.city || '',
            state: school.state || '',
            country: school.country || 'India',
            website: school.website || '',
            status: school.status,
            max_teachers: school.max_teachers,
            max_students: school.max_students,
            max_courses: school.max_courses
        });
        setShowModal(true);
    };

    const handleDelete = async (schoolId) => {
        if (window.confirm('Are you sure you want to delete this school?')) {
            try {
                await axios.delete(`${baseUrl}/schools/${schoolId}/`);
                fetchSchools();
            } catch (error) {
                console.error('Error deleting school:', error);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSchool(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            website: '',
            status: 'trial',
            max_teachers: 10,
            max_students: 100,
            max_courses: 50
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            suspended: 'bg-danger',
            trial: 'bg-warning text-dark'
        };
        return badges[status] || 'bg-secondary';
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
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <AdminSidebar />
                </aside>

                <section className="col-md-9">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i className="bi bi-building me-2"></i>
                            Manage Schools
                        </h2>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add School
                        </button>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>City</th>
                                            <th>Status</th>
                                            <th>Teachers</th>
                                            <th>Students</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schools.length > 0 ? (
                                            schools.map((school, index) => (
                                                <tr key={school.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <strong>{school.name}</strong>
                                                    </td>
                                                    <td>{school.email}</td>
                                                    <td>{school.city || 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(school.status)}`}>
                                                            {school.status}
                                                        </span>
                                                    </td>
                                                    <td>{school.total_teachers || 0}</td>
                                                    <td>{school.total_students || 0}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => handleEdit(school)}
                                                            title="Edit"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(school.id)}
                                                            title="Delete"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">
                                                    No schools found. Click "Add School" to create one.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add/Edit School Modal */}
            {showModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSchool ? 'Edit School' : 'Add New School'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">School Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Website</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Address</label>
                                            <textarea
                                                className="form-control"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="2"
                                            ></textarea>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">State</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Country</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                            >
                                                <option value="trial">Trial</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Max Teachers</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="max_teachers"
                                                value={formData.max_teachers}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Max Students</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="max_students"
                                                value={formData.max_students}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Max Courses</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="max_courses"
                                                value={formData.max_courses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingSchool ? 'Update School' : 'Create School'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSchools;
