import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;
const mediaUrl = API_BASE_URL.replace('/api', ''); // Extract base domain from API URL

const TeacherOverview = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  
  const teacherId = localStorage.getItem('teacherId')

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${baseUrl}/teacher/overview/${teacherId}/`)
      setData(response.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    document.title = 'Sonara | Teacher Dashboard'
    window.scrollTo(0, 0)
    fetchDashboardData()
  }, [fetchDashboardData])

  const getActivityIcon = (type) => {
    const icons = {
      check: 'bi-check-lg',
      document: 'bi-file-text',
      play: 'bi-play-fill',
      comment: 'bi-chat-dots',
      download: 'bi-download',
      calendar: 'bi-calendar-check',
      trophy: 'bi-trophy-fill',
      'person-plus': 'bi-person-plus-fill',
      default: 'bi-circle'
    }
    return icons[type] || icons.default
  }

  const getActivityColor = (type) => {
    const colors = {
      check: { bg: '#dcfce7', color: '#16a34a' },
      play: { bg: '#dbeafe', color: '#3b82f6' },
      comment: { bg: '#fef3c7', color: '#d97706' },
      document: { bg: '#f3e8ff', color: '#9333ea' },
      download: { bg: '#e0f2fe', color: '#0284c7' },
      calendar: { bg: '#fce7f3', color: '#db2777' },
      trophy: { bg: '#fef9c3', color: '#ca8a04' },
      'person-plus': { bg: '#dbeafe', color: '#2563eb' },
    }
    return colors[type] || { bg: '#f1f5f9', color: '#64748b' }
  }

  const getActivityVerb = (type) => {
    const verbs = {
      lesson_completed: 'completed lesson',
      assignment_submitted: 'submitted assignment for',
      course_started: 'started course',
      comment_added: 'commented on',
      material_downloaded: 'downloaded material from',
      session_attended: 'attended session',
      course_completed: 'completed course',
      enrolled: 'enrolled in',
    }
    return verbs[type] || type
  }

  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p className='text-muted mt-3'>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='d-flex flex-column align-items-center justify-content-center' style={{ minHeight: 400 }}>
        <i className="bi bi-exclamation-triangle display-3 text-warning mb-3"></i>
        <h4>{error}</h4>
        <button className='btn-primary-custom mt-3' onClick={fetchDashboardData}>
          <i className="bi bi-arrow-clockwise me-2"></i>Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      {/* Header */}
      <div className='dashboard-header'>
        <div className='header-title'>
          <h1>Dashboard Overview</h1>
          <p className='header-subtitle'>Welcome back, {data.teacher_name}. Here's your teaching summary.</p>
        </div>
        <div className='header-actions'>
          <button className='btn-secondary-custom' onClick={fetchDashboardData}>
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
          <Link to='/teacher-students' className='btn-secondary-custom' style={{ textDecoration: 'none' }}>
            <i className="bi bi-people"></i>
            View Students
          </Link>
          <Link to='/teacher-course-management' className='btn-primary-custom' style={{ textDecoration: 'none' }}>
            <i className="bi bi-journal-richtext"></i>
            Manage Courses
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className='metrics-row'>
        {/* Total Students */}
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#dbeafe', color: '#3b82f6' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Total Students</div>
            <div className='metric-value'>{data.total_students}</div>
            {data.new_students_this_month > 0 && (
              <div className='metric-trend up'>
                <i className="bi bi-arrow-up"></i>
                {data.new_students_this_month} new this month
              </div>
            )}
          </div>
        </div>

        {/* Total Courses */}
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="bi bi-journal-richtext"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>My Courses</div>
            <div className='metric-value'>{data.total_courses}</div>
            <div className='metric-trend' style={{ color: '#64748b' }}>
              {data.total_chapters} chapter{data.total_chapters !== 1 ? 's' : ''} · {data.total_lessons} lesson{data.total_lessons !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Enrollments */}
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#dcfce7', color: '#22c55e' }}>
            <i className="bi bi-person-check-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Enrollments</div>
            <div className='metric-value'>{data.total_enrollments}</div>
            {data.new_enrollments_this_week > 0 ? (
              <div className='metric-trend up'>
                <i className="bi bi-arrow-up"></i>
                {data.new_enrollments_this_week} this week
              </div>
            ) : (
              <div className='metric-trend' style={{ color: '#64748b' }}>
                {data.active_enrollments} active
              </div>
            )}
          </div>
        </div>

        {/* Completion Rate */}
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#fce7f3', color: '#ec4899' }}>
            <i className="bi bi-trophy-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Completion Rate</div>
            <div className='metric-value'>
              {data.total_enrollments > 0 ? `${data.completion_rate}%` : '—'}
            </div>
            <div className='metric-trend' style={{ color: '#64748b' }}>
              {data.completed_courses} of {data.total_enrollments} completed
            </div>
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      {data.courses && data.courses.length > 0 && (
        <div className='content-card' style={{ marginBottom: 24 }}>
          <div className='content-card-header'>
            <h2 className='content-card-title'>My Courses</h2>
            <Link to='/teacher-course-management' className='view-all-link'>Manage All</Link>
          </div>
          <div className='d-flex flex-wrap gap-3'>
            {data.courses.map(course => (
              <div key={course.id}
                style={{
                  flex: '1 1 280px', maxWidth: 360,
                  border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden',
                  background: '#fff', transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height: 6, background: course.total_enrolled > 0 ? '#3b82f6' : '#e2e8f0' }}></div>
                <div style={{ padding: '16px 20px' }}>
                  <div className='d-flex align-items-start gap-3'>
                    {course.featured_img ? (
                      <img src={`${mediaUrl}${course.featured_img}`} alt=""
                        style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 48, height: 36, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="bi bi-journal text-muted"></i>
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h6 className='mb-1' style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </h6>
                      <div className='d-flex gap-3 text-muted' style={{ fontSize: 12 }}>
                        <span><i className="bi bi-people me-1"></i>{course.total_enrolled} enrolled</span>
                        <span><i className="bi bi-collection me-1"></i>{course.chapter_count} ch · {course.lesson_count} lessons</span>
                      </div>
                    </div>
                  </div>
                  {course.total_enrolled > 0 && (
                    <div className='mt-2'>
                      <div className='d-flex justify-content-between' style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                        <span>Avg student progress</span>
                        <span>{course.avg_progress}%</span>
                      </div>
                      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                        <div style={{
                          width: `${course.avg_progress}%`, height: '100%', borderRadius: 2,
                          background: course.avg_progress >= 70 ? '#22c55e' : course.avg_progress >= 40 ? '#f59e0b' : '#3b82f6'
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Row: Activities + Sessions */}
      <div className='content-row'>
        {/* Recent Activity */}
        <div className='content-card'>
          <div className='content-card-header'>
            <h2 className='content-card-title'>Recent Activity</h2>
          </div>
          {data.recent_activities && data.recent_activities.length > 0 ? (
            <ul className='activity-list'>
              {data.recent_activities.map((activity) => {
                const ac = getActivityColor(activity.icon_type)
                return (
                  <li key={activity.id} className='activity-item'>
                    <div className='activity-icon' style={{ background: ac.bg, color: ac.color }}>
                      <i className={`bi ${getActivityIcon(activity.icon_type)}`}></i>
                    </div>
                    <div className='activity-content'>
                      <p className='activity-text'>
                        <strong>{activity.student_name}</strong> {getActivityVerb(activity.activity_type)}{' '}
                        {activity.target_id ? (
                          <Link to={`/detail/${activity.target_id}`} className='activity-link'>
                            {activity.target_name}
                          </Link>
                        ) : (
                          <span className='activity-link'>{activity.target_name}</span>
                        )}
                      </p>
                      <span className='activity-time'>{activity.time_ago}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className='d-flex flex-column align-items-center justify-content-center py-5'>
              <i className="bi bi-clock-history display-4" style={{ color: '#cbd5e1' }}></i>
              <p className='text-muted mt-3 mb-0'>No recent activity yet</p>
              <p className='text-muted small'>Activity will appear here when students interact with your courses.</p>
            </div>
          )}
        </div>

        {/* Right Column: Sessions + Enrollments */}
        <div className='d-flex flex-column gap-4'>
          {/* Upcoming Sessions */}
          <div className='content-card'>
            <div className='content-card-header'>
              <h2 className='content-card-title'>Upcoming Sessions</h2>
            </div>
            {data.upcoming_sessions && data.upcoming_sessions.length > 0 ? (
              <ul className='session-list'>
                {data.upcoming_sessions.map((session) => (
                  <li key={session.id} className='session-item'>
                    <span className='session-time'>{session.scheduled_time}</span>
                    <div className='session-info'>
                      <div className='session-student'>{session.student_name}</div>
                      <div className='session-topic'>{session.title}</div>
                    </div>
                    <span className={`session-status ${session.status}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='d-flex flex-column align-items-center justify-content-center py-4'>
                <i className="bi bi-calendar2-x display-5" style={{ color: '#cbd5e1' }}></i>
                <p className='text-muted mt-2 mb-0 small'>No upcoming sessions</p>
              </div>
            )}
          </div>

          {/* Recent Enrollments */}
          <div className='content-card'>
            <div className='content-card-header'>
              <h2 className='content-card-title'>Recent Enrollments</h2>
            </div>
            {data.recent_enrollments && data.recent_enrollments.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {data.recent_enrollments.map((enroll, idx) => (
                  <li key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: idx < data.recent_enrollments.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    {enroll.student_profile_img ? (
                      <img src={`${mediaUrl}${enroll.student_profile_img}`} alt=""
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                        {(enroll.student_name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{enroll.student_name}</div>
                      <div className='text-muted' style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        enrolled in <strong>{enroll.course_title}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: enroll.progress_percent >= 70 ? '#16a34a' : enroll.progress_percent >= 30 ? '#d97706' : '#3b82f6'
                      }}>
                        {enroll.progress_percent}%
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className='d-flex flex-column align-items-center justify-content-center py-4'>
                <i className="bi bi-person-plus display-5" style={{ color: '#cbd5e1' }}></i>
                <p className='text-muted mt-2 mb-0 small'>No enrollments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State — show when teacher has no courses at all */}
      {data.total_courses === 0 && (
        <div className='content-card' style={{ marginTop: 24 }}>
          <div className='d-flex flex-column align-items-center justify-content-center py-5'>
            <i className="bi bi-rocket-takeoff display-3" style={{ color: '#3b82f6' }}></i>
            <h4 className='mt-3 mb-2'>Get Started!</h4>
            <p className='text-muted mb-4 text-center' style={{ maxWidth: 400 }}>
              Create your first course and start sharing your musical knowledge with students.
            </p>
            <div className='d-flex gap-3'>
              <Link to='/teacher-course-management' className='btn-primary-custom' style={{ textDecoration: 'none' }}>
                <i className="bi bi-plus-lg me-2"></i>Create a Course
              </Link>
              <Link to='/teacher-students' className='btn-secondary-custom' style={{ textDecoration: 'none' }}>
                <i className="bi bi-people me-2"></i>Add Students
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeacherOverview
