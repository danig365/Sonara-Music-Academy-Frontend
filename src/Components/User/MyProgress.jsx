import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import './MyProgress.css';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const MyProgress = () => {
    const navigate = useNavigate();
    const [courseProgress, setCourseProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const studentId = localStorage.getItem('studentId');
    const studentLoginStatus = localStorage.getItem('studentLoginStatus');

    // Authentication check
    useEffect(() => {
        if (studentLoginStatus !== 'true') {
            navigate('/user-login');
        }
    }, [studentLoginStatus, navigate]);

    // Responsive detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.title = 'LMS | My Progress';
    }, []);

    useEffect(() => {
        if (studentLoginStatus === 'true') {
            fetchProgress();
        }
    }, [studentLoginStatus, studentId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/student/course-progress/${studentId}/`);
            setCourseProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProgress();
        setRefreshing(false);
    };

    const filteredProgress = courseProgress.filter(cp => {
        if (filter === 'completed') return cp.is_completed;
        if (filter === 'in-progress') return !cp.is_completed && cp.progress_percentage > 0;
        if (filter === 'not-started') return cp.progress_percentage === 0;
        return true;
    });

    const stats = {
        total: courseProgress.length,
        completed: courseProgress.filter(cp => cp.is_completed).length,
        inProgress: courseProgress.filter(cp => !cp.is_completed && cp.progress_percentage > 0).length,
        notStarted: courseProgress.filter(cp => cp.progress_percentage === 0).length,
        totalTime: courseProgress.reduce((sum, cp) => sum + (cp.total_time_spent_seconds || 0), 0),
        avgProgress: courseProgress.length > 0 
            ? Math.round(courseProgress.reduce((sum, cp) => sum + (cp.progress_percentage || 0), 0) / courseProgress.length)
            : 0
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (studentLoginStatus !== 'true') {
        return null;
    }

    return (
        <div className="progress-container">
            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
                isMobile={isMobile}
            />

            {/* Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="progress-content">
                {/* Mobile Header */}
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

                <div className="progress-main">
                    {/* Header */}
                    <div className="progress-header">
                        <div>
                            <h2>
                                <i className="bi bi-graph-up me-2"></i>
                                My Learning Progress
                            </h2>
                            <p>Track your course completion and learning time</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="refresh-btn"
                        >
                            <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin' : ''}`}></i>
                            Refresh
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: '#eff6ff' }}>
                                <i className="bi bi-book" style={{ color: '#4285f4' }}></i>
                            </div>
                            <div className="stat-content">
                                <h4>{stats.total}</h4>
                                <p>Total Courses</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: '#f0fdf4' }}>
                                <i className="bi bi-check-circle" style={{ color: '#10b981' }}></i>
                            </div>
                            <div className="stat-content">
                                <h4>{stats.completed}</h4>
                                <p>Completed</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: '#fffbeb' }}>
                                <i className="bi bi-clock" style={{ color: '#f59e0b' }}></i>
                            </div>
                            <div className="stat-content">
                                <h4>{formatTime(stats.totalTime)}</h4>
                                <p>Time Spent</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: '#f0f9ff' }}>
                                <i className="bi bi-percent" style={{ color: '#0ea5e9' }}></i>
                            </div>
                            <div className="stat-content">
                                <h4>{stats.avgProgress}%</h4>
                                <p>Avg Progress</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="filter-pills">
                        {[
                            { key: 'all', label: 'All', count: stats.total },
                            { key: 'in-progress', label: 'In Progress', count: stats.inProgress },
                            { key: 'completed', label: 'Completed', count: stats.completed },
                            { key: 'not-started', label: 'Not Started', count: stats.notStarted }
                        ].map(btn => (
                            <button
                                key={btn.key}
                                onClick={() => setFilter(btn.key)}
                                className={`filter-btn ${filter === btn.key ? 'active' : ''}`}
                            >
                                {btn.label} ({btn.count})
                            </button>
                        ))}
                    </div>

                    {/* Course Progress List */}
                    {loading ? (
                        <div className="spinner-container">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredProgress.length > 0 ? (
                        <div className="progress-list">
                            {filteredProgress.map((cp, index) => (
                                <div key={index} className="progress-item">
                                    <div className="progress-item-grid">
                                        {/* Course Image */}
                                        {cp.course?.featured_img ? (
                                            <img 
                                                src={cp.course.featured_img} 
                                                alt={cp.course?.title}
                                                className="course-image"
                                            />
                                        ) : (
                                            <div className="course-placeholder">
                                                <i className="bi bi-book"></i>
                                            </div>
                                        )}

                                        {/* Course Info */}
                                        <div className="course-info">
                                            <h5>
                                                <Link 
                                                    to={`/detail/${cp.course?.id}`}
                                                >
                                                    {cp.course?.title}
                                                </Link>
                                            </h5>
                                            <p>
                                                <i className="bi bi-person me-1"></i>
                                                {cp.course?.teacher?.full_name}
                                            </p>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar">
                                                    <div 
                                                        className={`progress-bar-fill ${cp.is_completed ? 'completed' : ''}`}
                                                        style={{ width: `${cp.progress_percentage || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <small className="progress-text">
                                                {cp.completed_chapters || 0}/{cp.total_chapters || 0} chapters • {cp.progress_percentage || 0}%
                                            </small>
                                        </div>

                                        {/* Time */}
                                        <div className="time-display">
                                            <p>
                                                <i className="bi bi-clock me-1"></i>
                                                {cp.time_spent_formatted || formatTime(cp.total_time_spent_seconds)}
                                            </p>
                                        </div>

                                        {/* Action */}
                                        <div className="action-button">
                                            {cp.is_completed ? (
                                                <span className="action-btn completed">
                                                    <i className="bi bi-check-lg"></i>
                                                </span>
                                            ) : (
                                                <Link 
                                                    to={`/detail/${cp.course?.id}`}
                                                    className="action-btn continue"
                                                >
                                                    <i className="bi bi-play-fill"></i>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="bi bi-graph-up"></i>
                            <h5>No courses found</h5>
                            <p>
                                {filter === 'all' 
                                    ? 'You have not enrolled in any courses yet.' 
                                    : `No courses found with status: ${filter}`}
                            </p>
                            <Link 
                                to="/all-courses"
                                className="browse-btn"
                            >
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProgress;
