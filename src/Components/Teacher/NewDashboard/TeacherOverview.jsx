import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import TeacherSidebarNew from './TeacherSidebarNew'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../../config';

const baseUrl = API_BASE_URL;

const TeacherOverview = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [teacherName, setTeacherName] = useState('Teacher')
  
  const teacherId = localStorage.getItem('teacherId')

  useEffect(() => {
    document.title = 'LMS | Teacher Dashboard'
    window.scrollTo(0, 0)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch teacher overview data
      const response = await axios.get(`${baseUrl}/teacher/overview/${teacherId}/`)
      setDashboardData(response.data)
      setTeacherName(response.data.teacher_name || 'Teacher')
      setLoading(false)
    } catch (error) {
      console.log(error)
      // Set default data if API fails
      setDashboardData({
        total_students: 24,
        active_lessons: 142,
        completion_rate: 87,
        students_trend: 12,
        students_trend_direction: 'up',
        lessons_trend: 8,
        lessons_trend_direction: 'up',
        completion_trend: -2,
        completion_trend_direction: 'down',
        recent_activities: [],
        upcoming_sessions: []
      })
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      check: 'bi-check-lg',
      document: 'bi-file-text',
      play: 'bi-play-fill',
      comment: 'bi-chat-dots',
      quiz: 'bi-question-circle',
      download: 'bi-download'
    }
    return icons[type] || 'bi-circle'
  }

  const getActivityDescription = (activity) => {
    const descriptions = {
      lesson_completed: 'completed lesson',
      course_started: 'started course',
      comment_added: 'commented on',
      quiz_completed: 'completed quiz',
      material_downloaded: 'downloaded material'
    }
    return descriptions[activity.activity_type] || activity.activity_type
  }

  if (loading) {
    return (
      <div className='d-flex'>
        <TeacherSidebarNew />
        <div className='teacher-main-content'>
          <div className='loading-container'>
            <div className='loading-spinner'></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='d-flex'>
      <TeacherSidebarNew />
      <div className='teacher-main-content'>
        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-title'>
            <h1>Dashboard Overview</h1>
            <p className='header-subtitle'>Welcome back, {teacherName}. Here's what's happening today.</p>
          </div>
          <div className='header-actions'>
            <Link to='/teacher-students' className='btn-secondary-custom'>
              <i className="bi bi-people"></i>
              View Students
            </Link>
            <Link to='/teacher-upload-lesson' className='btn-primary-custom'>
              <i className="bi bi-cloud-arrow-up"></i>
              Upload Lesson
            </Link>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className='metrics-row'>
          {/* Total Students */}
          <div className='metric-card'>
            <div className='metric-icon students'>
              <i className="bi bi-people-fill"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Total Students</div>
              <div className='metric-value'>{dashboardData.total_students}</div>
              <div className={`metric-trend ${dashboardData.students_trend_direction}`}>
                <i className={`bi bi-arrow-${dashboardData.students_trend_direction}`}></i>
                {Math.abs(dashboardData.students_trend)}% vs last month
              </div>
            </div>
          </div>

          {/* Active Lessons */}
          <div className='metric-card'>
            <div className='metric-icon lessons'>
              <i className="bi bi-music-note-beamed"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Active Lessons</div>
              <div className='metric-value'>{dashboardData.active_lessons}</div>
              <div className={`metric-trend ${dashboardData.lessons_trend_direction}`}>
                <i className={`bi bi-arrow-${dashboardData.lessons_trend_direction}`}></i>
                {Math.abs(dashboardData.lessons_trend)}% new this week
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className='metric-card'>
            <div className='metric-icon completion'>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Completion Rate</div>
              <div className='metric-value'>{dashboardData.completion_rate}%</div>
              <div className={`metric-trend ${dashboardData.completion_trend_direction}`}>
                <i className={`bi bi-arrow-${dashboardData.completion_trend_direction}`}></i>
                {Math.abs(dashboardData.completion_trend)}% vs last month
              </div>
            </div>
          </div>
        </div>

        {/* Content Row */}
        <div className='content-row'>
          {/* Recent Activity */}
          <div className='content-card'>
            <div className='content-card-header'>
              <h2 className='content-card-title'>Recent Activity</h2>
              <Link to='/teacher-activities' className='view-all-link'>View All</Link>
            </div>
            <ul className='activity-list'>
              {dashboardData.recent_activities && dashboardData.recent_activities.length > 0 ? (
                dashboardData.recent_activities.map((activity, index) => (
                  <li key={index} className='activity-item'>
                    <div className={`activity-icon ${activity.icon_type}`}>
                      <i className={`bi ${getActivityIcon(activity.icon_type)}`}></i>
                    </div>
                    <div className='activity-content'>
                      <p className='activity-text'>
                        <strong>{activity.student_name}</strong> {getActivityDescription(activity)} →{' '}
                        <Link to={`/detail/${activity.target_id}`} className='activity-link'>
                          {activity.target_name}
                        </Link>
                      </p>
                      <span className='activity-time'>{activity.time_ago}</span>
                    </div>
                  </li>
                ))
              ) : (
                // Sample data when no activities
                <>
                  <li className='activity-item'>
                    <div className='activity-icon check'>
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <div className='activity-content'>
                      <p className='activity-text'>
                        <strong>Sarah Miller</strong> completed lesson → <Link to='#' className='activity-link'>Advanced Scales</Link>
                      </p>
                      <span className='activity-time'>2 hours ago</span>
                    </div>
                  </li>
                  <li className='activity-item'>
                    <div className='activity-icon play'>
                      <i className="bi bi-play-fill"></i>
                    </div>
                    <div className='activity-content'>
                      <p className='activity-text'>
                        <strong>Emily Davis</strong> started course → <Link to='#' className='activity-link'>Music Theory 101</Link>
                      </p>
                      <span className='activity-time'>Yesterday</span>
                    </div>
                  </li>
                  <li className='activity-item'>
                    <div className='activity-icon comment'>
                      <i className="bi bi-chat-dots"></i>
                    </div>
                    <div className='activity-content'>
                      <p className='activity-text'>
                        <strong>Alex Wilson</strong> commented on → <Link to='#' className='activity-link'>Sight Reading</Link>
                      </p>
                      <span className='activity-time'>Yesterday</span>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Upcoming Sessions */}
          <div className='content-card'>
            <div className='content-card-header'>
              <h2 className='content-card-title'>Upcoming Sessions</h2>
            </div>
            <ul className='session-list'>
              {dashboardData.upcoming_sessions && dashboardData.upcoming_sessions.length > 0 ? (
                dashboardData.upcoming_sessions.map((session, index) => (
                  <li key={index} className='session-item'>
                    <span className='session-time'>{session.scheduled_time}</span>
                    <div className='session-info'>
                      <div className='session-student'>{session.student_name}</div>
                      <div className='session-topic'>{session.title}</div>
                    </div>
                    <span className={`session-status ${session.status}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </li>
                ))
              ) : (
                // Sample sessions
                <>
                  <li className='session-item'>
                    <span className='session-time'>14:00</span>
                    <div className='session-info'>
                      <div className='session-student'>Sarah Miller</div>
                      <div className='session-topic'>Piano - Advanced</div>
                    </div>
                    <span className='session-status confirmed'>Confirmed</span>
                  </li>
                  <li className='session-item'>
                    <span className='session-time'>15:30</span>
                    <div className='session-info'>
                      <div className='session-student'>Mike Johnson</div>
                      <div className='session-topic'>Theory Review</div>
                    </div>
                    <span className='session-status pending'>Pending</span>
                  </li>
                  <li className='session-item'>
                    <span className='session-time'>17:00</span>
                    <div className='session-info'>
                      <div className='session-student'>Emily Davis</div>
                      <div className='session-topic'>Composition</div>
                    </div>
                    <span className='session-status confirmed'>Confirmed</span>
                  </li>
                </>
              )}
            </ul>
            <button className='btn-view-schedule'>View Full Schedule</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherOverview
