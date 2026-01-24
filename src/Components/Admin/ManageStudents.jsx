import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const ManageStudents = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        document.title = 'Manage Students | Admin Dashboard';
        const adminLoginStatus = localStorage.getItem('adminLoginStatus');
        if (adminLoginStatus !== 'true') {
            navigate('/admin-login');
            return;
        }
        fetchStudents();
    }, [navigate, currentPage, searchTerm]);

    const fetchStudents = async () => {
        try {
            let url = `${baseUrl}/admin/students/?page=${currentPage}`;
            if (searchTerm) {
                url += `&search=${searchTerm}`;
            }
            const response = await axios.get(url);
            if (response.data.results) {
                setStudents(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 8));
            } else {
                setStudents(response.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchStudents();
    };

    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`${baseUrl}/student/${studentId}/`);
                fetchStudents();
            } catch (error) {
                console.error('Error deleting student:', error);
            }
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
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <AdminSidebar />
                </aside>

                <section className="col-md-9">
                    <h2 className="mb-4">
                        <i className="bi bi-mortarboard me-2"></i>
                        Manage Students
                    </h2>

                    {/* Search */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <form onSubmit={handleSearch}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="btn btn-primary" type="submit">
                                        <i className="bi bi-search me-1"></i> Search
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Photo</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Username</th>
                                            <th>Enrolled</th>
                                            <th>Favorites</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length > 0 ? (
                                            students.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td>{(currentPage - 1) * 8 + index + 1}</td>
                                                    <td>
                                                        {student.profile_img ? (
                                                            <img
                                                                src={student.profile_img}
                                                                alt={student.fullname}
                                                                className="rounded-circle"
                                                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                            />
                                                        ) : (
                                                            <i className="bi bi-person-circle fs-4"></i>
                                                        )}
                                                    </td>
                                                    <td><strong>{student.fullname}</strong></td>
                                                    <td>{student.email}</td>
                                                    <td>{student.username || 'N/A'}</td>
                                                    <td>
                                                        <span className="badge bg-primary">
                                                            {student.enrolled_courses || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-warning text-dark">
                                                            {student.favorite_courses || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(student.id)}
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
                                                    No students found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="mt-3">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => setCurrentPage(prev => prev - 1)}
                                            >
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <li 
                                                key={i} 
                                                className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                            >
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => setCurrentPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ManageStudents;
