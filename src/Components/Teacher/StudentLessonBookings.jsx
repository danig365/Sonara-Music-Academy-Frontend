import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const StudentLessonBookings = ({ teacherId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        total_hours: 0
    });

    useEffect(() => {
        fetchBookings();
    }, [teacherId]);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/lesson-bookings/?teacher_id=${teacherId}`);
            const allBookings = response.data;
            
            // Calculate stats
            const upcoming = allBookings.filter(b => b.status === 'scheduled').length;
            const completed = allBookings.filter(b => b.status === 'completed').length;
            const cancelled = allBookings.filter(b => b.status === 'cancelled').length;
            const totalMinutes = allBookings.reduce((sum, b) => sum + (b.duration_minutes || 0), 0);
            
            setStats({
                upcoming,
                completed,
                cancelled,
                total_hours: Math.floor(totalMinutes / 60)
            });
            
            // Show upcoming bookings first
            const sorted = allBookings.sort((a, b) => {
                if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
                if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
                return new Date(b.scheduled_date) - new Date(a.scheduled_date);
            });
            
            setBookings(sorted.slice(0, 10));
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsComplete = async (bookingId) => {
        try {
            await axios.post(`${API_BASE_URL}/lesson-booking/${bookingId}/complete/`, {
                feedback: 'Great lesson!',
                progress_notes: 'Student showed good progress.'
            });
            fetchBookings();
        } catch (error) {
            console.error('Error completing booking:', error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled': return 'badge-info';
            case 'completed': return 'badge-success';
            case 'cancelled': return 'badge-danger';
            case 'no_show': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-gradient" style={{ background: `linear-gradient(135deg, #4285f4 0%, #34a853 100%)` }}>
                <h5 className="mb-0 text-white">
                    <i className="bi bi-calendar-check me-2"></i>
                    Student Lesson Bookings
                </h5>
            </div>
            <div className="card-body">
                {/* Stats Row */}
                <div className="row g-2 mb-4">
                    <div className="col-3">
                        <div className="stat-box rounded p-2 bg-light text-center">
                            <div className="h6 text-primary mb-0">{stats.upcoming}</div>
                            <small className="text-muted">Upcoming</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-box rounded p-2 bg-light text-center">
                            <div className="h6 text-success mb-0">{stats.completed}</div>
                            <small className="text-muted">Completed</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-box rounded p-2 bg-light text-center">
                            <div className="h6 text-danger mb-0">{stats.cancelled}</div>
                            <small className="text-muted">Cancelled</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-box rounded p-2 bg-light text-center">
                            <div className="h6 text-warning mb-0">{stats.total_hours}h</div>
                            <small className="text-muted">Total</small>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center text-muted py-4">
                        <i className="bi bi-calendar-x" style={{ fontSize: '2.5rem', opacity: '0.5' }}></i>
                        <p className="mt-2">No lesson bookings yet</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Student</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <small className="fw-bold">{booking.student_name}</small>
                                        </td>
                                        <td>
                                            <small>
                                                {new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </small>
                                        </td>
                                        <td>
                                            <small>{booking.scheduled_time}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'scheduled' && (
                                                <button
                                                    className="btn btn-xs btn-success"
                                                    onClick={() => markAsComplete(booking.id)}
                                                    title="Mark as completed"
                                                >
                                                    <i className="bi bi-check-lg"></i>
                                                </button>
                                            )}
                                            {booking.meeting_link && (
                                                <a
                                                    href={booking.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-xs btn-primary"
                                                    title="Join meeting"
                                                >
                                                    <i className="bi bi-link-45deg"></i>
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLessonBookings;
