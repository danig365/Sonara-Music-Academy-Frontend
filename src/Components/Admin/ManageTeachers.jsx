import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

const baseUrl = 'http://127.0.0.1:8000/api';

const ManageTeachers = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        document.title = 'Manage Teachers | Admin Dashboard';
        const adminLoginStatus = localStorage.getItem('adminLoginStatus');
        if (adminLoginStatus !== 'true') {
            navigate('/admin-login');
            return;
        }
        fetchTeachers();
    }, [navigate, currentPage, searchTerm]);

    const fetchTeachers = async () => {
        try {
            let url = `${baseUrl}/admin/teachers/?page=${currentPage}`;
            if (searchTerm) {
                url += `&search=${searchTerm}`;
            }
            const response = await axios.get(url);
            if (response.data.results) {
                setTeachers(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 8));
            } else {
                setTeachers(response.data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchTeachers();
    };

    const handleDelete = async (teacherId) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await axios.delete(`${baseUrl}/teacher/${teacherId}/`);
                fetchTeachers();
            } catch (error) {
                console.error('Error deleting teacher:', error);
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
                        <i className="bi bi-person-workspace me-2"></i>
                        Manage Teachers
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

                    {/* Teachers List */}
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
                                            <th>Mobile</th>
                                            <th>Courses</th>
                                            <th>Students</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.length > 0 ? (
                                            teachers.map((teacher, index) => (
                                                <tr key={teacher.id}>
                                                    <td>{(currentPage - 1) * 8 + index + 1}</td>
                                                    <td>
                                                        {teacher.profile_img ? (
                                                            <img
                                                                src={teacher.profile_img}
                                                                alt={teacher.full_name}
                                                                className="rounded-circle"
                                                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                            />
                                                        ) : (
                                                            <i className="bi bi-person-circle fs-4"></i>
                                                        )}
                                                    </td>
                                                    <td><strong>{teacher.full_name}</strong></td>
                                                    <td>{teacher.email}</td>
                                                    <td>{teacher.mobile_no || 'N/A'}</td>
                                                    <td>
                                                        <span className="badge bg-primary">
                                                            {teacher.total_teacher_course || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success">
                                                            {teacher.teacher_courses?.length > 0 
                                                                ? teacher.teacher_courses.reduce((acc, course) => 
                                                                    acc + (course.total_enrolled_students || 0), 0)
                                                                : 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-info me-1"
                                                            onClick={() => navigate(`/teacher-detail/${teacher.id}`)}
                                                            title="View"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(teacher.id)}
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
                                                    No teachers found.
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

export default ManageTeachers;
