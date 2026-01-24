import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import './MyCourses.css';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const MyCourses = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId');
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');
    const [courseData, setCourseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Authentication check and redirect
    useEffect(() => {
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
        }
    }, [studentLoginStatus, navigate]);

    useEffect(() => {
        document.title = 'LMS | My Courses';
    }, []);

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
        if (studentLoginStatus === 'true') {
            const fetchCourses = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/fetch-enrolled-courses/${studentId}`);
                    setCourseData(response.data);
                    setLoading(false);
                } catch (error) {
                    console.log('Error fetching courses:', error);
                    setLoading(false);
                }
            };
            if (studentId) {
                fetchCourses();
            }
        }
    }, [studentId, studentLoginStatus]);

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
                        <div className="logo-mini">EduLearning</div>
                    </div>
                    <div className="dashboard-main">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
            
            {/* Mobile overlay when sidebar is open */}
            {isMobile && sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            
            <div className="dashboard-content">
                {/* Mobile Header with Toggle */}
                <div className="mobile-header">
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <div className="logo-mini">EduLearning</div>
                </div>

                <div className="dashboard-main">
                    {/* Header */}
                    <div className="page-header"> 
                        <h2>
                            <i className="bi bi-book me-2" style={{ color: '#3b82f6' }}></i>
                            My Courses
                        </h2>
                        <p>
                            {courseData.length} course{courseData.length !== 1 ? 's' : ''} enrolled
                        </p>
                    </div>

                    {/* Courses Grid */}
                    {courseData.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <h5>No Courses Yet</h5>
                            <p>Start learning by enrolling in courses</p>
                            <Link 
                                to="/all-courses" 
                                className="btn btn-primary"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="courses-grid">
                            {courseData.map((enrollment, index) => (
                                <div
                                    key={index}
                                    className="course-card"
                                >
                                    {/* Course Image */}
                                    <Link to={`/detail/${enrollment.course.id}`} className="course-image-link">
                                        <div className="course-image">
                                            {enrollment.course.featured_img ? (
                                                <img
                                                    src={enrollment.course.featured_img}
                                                    alt={enrollment.course.title}
                                                    className="course-img"
                                                />
                                            ) : (
                                                <i className="bi bi-book"></i>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Course Content */}
                                    <div className="course-content text-dark">
                                        {/* Course Title */}
                                        <Link 
                                            to={`/detail/${enrollment.course.id}`}
                                            className="course-title-link text-dark" 
                                        >
                                            <h6 className="course-title">
                                                {enrollment.course.title}
                                            </h6>
                                        </Link>

                                        {/* Instructor */}
                                        <Link
                                            to={`/teacher-detail/${enrollment.course.teacher.id}`}
                                            className="instructor-link"
                                        >
                                            <div className="instructor-avatar">
                                                {enrollment.course.teacher.profile_img ? (
                                                    <img
                                                        src={enrollment.course.teacher.profile_img}
                                                        alt={enrollment.course.teacher.full_name}
                                                        className="avatar-img"
                                                    />
                                                ) : (
                                                    <span>{enrollment.course.teacher.full_name?.substring(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="instructor-info">
                                                <p className="instructor-name">
                                                    {enrollment.course.teacher.full_name}
                                                </p>
                                                <p className="instructor-role">
                                                    Instructor
                                                </p>
                                            </div>
                                        </Link>

                                        {/* Category Tag */}
                                        {enrollment.course.category && (
                                            <div className="category-tags">
                                                <span className="category-badge">
                                                    {enrollment.course.category.title}
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="action-buttons">
                                            <Link
                                                to={`/detail/${enrollment.course.id}`}
                                                className="btn btn-continue"
                                            >
                                                <i className="bi bi-play-fill me-1"></i> Continue
                                            </Link>
                                            <Link
                                                to={`/user/study-material/${enrollment.course.id}`}
                                                className="btn btn-materials"
                                            >
                                                <i className="bi bi-file-earmark me-1"></i> Materials
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
