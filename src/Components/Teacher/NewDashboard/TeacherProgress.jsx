import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import TeacherSidebarNew from './TeacherSidebarNew'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../../config';

const baseUrl = API_BASE_URL;

const TeacherProgress = () => {
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState(null)
  
  const teacherId = localStorage.getItem('teacherId')

  useEffect(() => {
    document.title = 'LMS | Progress Analytics'
    window.scrollTo(0, 0)
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/teacher/progress/${teacherId}/`)
      setProgressData(response.data)
      setLoading(false)
    } catch (error) {
      console.log(error)
      // Set sample data
      setProgressData(getSampleProgressData())
      setLoading(false)
    }
  }

  const getSampleProgressData = () => ({
    overall_progress: 72.5,
    total_students: 24,
    total_lessons: 12,
    completion_rate: 72.9,
    progress_distribution: {
      excellent: 8,
      good: 10,
      average: 4,
      needs_improvement: 2
    },
    student_progress: [
      { id: 1, student_name: 'Sarah Miller', instrument: 'piano', level: 'advanced', progress_percentage: 92, status: 'active', last_active: '2025-01-16' },
      { id: 2, student_name: 'Jessica Brown', instrument: 'voice', level: 'advanced', progress_percentage: 88, status: 'active', last_active: '2025-01-16' },
      { id: 3, student_name: 'Alex Wilson', instrument: 'piano', level: 'intermediate', progress_percentage: 78, status: 'active', last_active: '2025-01-15' },
      { id: 4, student_name: 'Mike Johnson', instrument: 'guitar', level: 'intermediate', progress_percentage: 62, status: 'active', last_active: '2025-01-14' },
      { id: 5, student_name: 'Emily Davis', instrument: 'violin', level: 'beginner', progress_percentage: 34, status: 'inactive', last_active: '2025-01-10' },
      { id: 6, student_name: 'David Clark', instrument: 'guitar', level: 'beginner', progress_percentage: 15, status: 'warning', last_active: '2025-01-05' }
    ],
    weekly_activity: [
      { date: 'Mon', activities: 12 },
      { date: 'Tue', activities: 18 },
      { date: 'Wed', activities: 8 },
      { date: 'Thu', activities: 22 },
      { date: 'Fri', activities: 15 },
      { date: 'Sat', activities: 5 },
      { date: 'Sun', activities: 3 }
    ],
    top_students: [
      { id: 1, student_name: 'Sarah Miller', progress_percentage: 92, level: 'advanced' },
      { id: 2, student_name: 'Jessica Brown', progress_percentage: 88, level: 'advanced' },
      { id: 3, student_name: 'Alex Wilson', progress_percentage: 78, level: 'intermediate' }
    ],
    attention_needed: [
      { id: 6, student_name: 'David Clark', progress_percentage: 15, status: 'warning', last_active: '2025-01-05' },
      { id: 5, student_name: 'Emily Davis', progress_percentage: 34, status: 'inactive', last_active: '2025-01-10' }
    ]
  })

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#22c55e'
    if (percentage >= 60) return '#3b82f6'
    if (percentage >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getProgressClass = (percentage) => {
    if (percentage >= 80) return 'high'
    if (percentage >= 60) return 'medium'
    if (percentage >= 40) return 'low'
    return 'very-low'
  }

  const getMaxActivity = () => {
    if (!progressData?.weekly_activity) return 1
    return Math.max(...progressData.weekly_activity.map(a => a.activities), 1)
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
            <h1>Progress Analytics</h1>
            <p className='header-subtitle'>Monitor student performance and track learning outcomes.</p>
          </div>
          <div className='header-actions'>
            <button className='btn-secondary-custom'>
              <i className="bi bi-download"></i>
              Export Report
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className='metrics-row'>
          <div className='metric-card'>
            <div className='metric-icon' style={{background: '#dbeafe', color: '#3b82f6'}}>
              <i className="bi bi-graph-up"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Overall Progress</div>
              <div className='metric-value'>{progressData.overall_progress}%</div>
              <div className='metric-trend up'>
                <i className="bi bi-arrow-up"></i>
                Class average
              </div>
            </div>
          </div>

          <div className='metric-card'>
            <div className='metric-icon' style={{background: '#dcfce7', color: '#22c55e'}}>
              <i className="bi bi-check2-circle"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Completion Rate</div>
              <div className='metric-value'>{progressData.completion_rate}%</div>
              <div className='metric-trend up'>
                Lessons completed
              </div>
            </div>
          </div>

          <div className='metric-card'>
            <div className='metric-icon' style={{background: '#fef3c7', color: '#f59e0b'}}>
              <i className="bi bi-collection"></i>
            </div>
            <div className='metric-content'>
              <div className='metric-label'>Active Lessons</div>
              <div className='metric-value'>{progressData.total_lessons}</div>
              <div className='metric-trend'>
                Across {progressData.total_students} students
              </div>
            </div>
          </div>
        </div>

        {/* Content Row */}
        <div className='row g-4 mb-4'>
          {/* Progress Distribution */}
          <div className='col-md-4'>
            <div className='content-card h-100'>
              <div className='content-card-header'>
                <h2 className='content-card-title'>Progress Distribution</h2>
              </div>
              <div className='mt-4'>
                <div className='d-flex align-items-center mb-3'>
                  <div className='me-3' style={{width: 12, height: 12, borderRadius: '50%', background: '#22c55e'}}></div>
                  <div className='flex-grow-1'>Excellent (80%+)</div>
                  <strong>{progressData.progress_distribution.excellent}</strong>
                </div>
                <div className='d-flex align-items-center mb-3'>
                  <div className='me-3' style={{width: 12, height: 12, borderRadius: '50%', background: '#3b82f6'}}></div>
                  <div className='flex-grow-1'>Good (60-79%)</div>
                  <strong>{progressData.progress_distribution.good}</strong>
                </div>
                <div className='d-flex align-items-center mb-3'>
                  <div className='me-3' style={{width: 12, height: 12, borderRadius: '50%', background: '#f59e0b'}}></div>
                  <div className='flex-grow-1'>Average (40-59%)</div>
                  <strong>{progressData.progress_distribution.average}</strong>
                </div>
                <div className='d-flex align-items-center'>
                  <div className='me-3' style={{width: 12, height: 12, borderRadius: '50%', background: '#ef4444'}}></div>
                  <div className='flex-grow-1'>Needs Help (&lt;40%)</div>
                  <strong>{progressData.progress_distribution.needs_improvement}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className='col-md-8'>
            <div className='content-card h-100'>
              <div className='content-card-header'>
                <h2 className='content-card-title'>Weekly Activity</h2>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-4' style={{height: 150}}>
                {progressData.weekly_activity.map((day, index) => (
                  <div key={index} className='text-center' style={{flex: 1}}>
                    <div 
                      style={{
                        width: 40,
                        height: `${(day.activities / getMaxActivity()) * 120}px`,
                        background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                        borderRadius: '4px 4px 0 0',
                        margin: '0 auto',
                        minHeight: 4
                      }}
                    ></div>
                    <div className='text-muted small mt-2'>{day.date}</div>
                    <div className='small' style={{fontWeight: 500}}>{day.activities}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='row g-4'>
          {/* Top Performing Students */}
          <div className='col-md-6'>
            <div className='content-card'>
              <div className='content-card-header'>
                <h2 className='content-card-title'>
                  <i className="bi bi-trophy text-warning me-2"></i>
                  Top Performing Students
                </h2>
              </div>
              <ul className='list-unstyled mt-3'>
                {progressData.top_students.map((student, index) => (
                  <li key={student.id} className='d-flex align-items-center mb-3 pb-3 border-bottom'>
                    <div 
                      className='d-flex align-items-center justify-content-center me-3'
                      style={{
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: index === 0 ? '#fef3c7' : index === 1 ? '#f1f5f9' : '#fed7aa',
                        color: index === 0 ? '#f59e0b' : index === 1 ? '#64748b' : '#ea580c',
                        fontWeight: 600
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className='flex-grow-1'>
                      <div className='fw-medium'>{student.student_name}</div>
                      <div className='text-muted small'>{student.level}</div>
                    </div>
                    <div className='d-flex align-items-center'>
                      <div className='progress-bar-container me-2' style={{width: 60}}>
                        <div 
                          className={`progress-bar-fill ${getProgressClass(student.progress_percentage)}`}
                          style={{width: `${student.progress_percentage}%`}}
                        ></div>
                      </div>
                      <span className='fw-medium' style={{color: getProgressColor(student.progress_percentage)}}>
                        {student.progress_percentage}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Students Needing Attention */}
          <div className='col-md-6'>
            <div className='content-card'>
              <div className='content-card-header'>
                <h2 className='content-card-title'>
                  <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                  Students Needing Attention
                </h2>
                <Link to='/teacher-students' className='view-all-link'>View All</Link>
              </div>
              {progressData.attention_needed.length > 0 ? (
                <ul className='list-unstyled mt-3'>
                  {progressData.attention_needed.map((student) => (
                    <li key={student.id} className='d-flex align-items-center mb-3 pb-3 border-bottom'>
                      <div 
                        className='d-flex align-items-center justify-content-center me-3'
                        style={{
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: student.status === 'warning' ? '#fef3c7' : '#fee2e2',
                          color: student.status === 'warning' ? '#f59e0b' : '#ef4444'
                        }}
                      >
                        <i className={`bi ${student.status === 'warning' ? 'bi-exclamation-circle' : 'bi-x-circle'}`}></i>
                      </div>
                      <div className='flex-grow-1'>
                        <div className='fw-medium'>{student.student_name}</div>
                        <div className='text-muted small'>Last active: {student.last_active}</div>
                      </div>
                      <div className='text-end'>
                        <span className={`status-badge ${student.status}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                        <div className='small text-muted mt-1'>{student.progress_percentage}% progress</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='text-center py-4'>
                  <i className="bi bi-check-circle display-4 text-success"></i>
                  <p className='text-muted mt-2'>All students are on track!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Students Progress Table */}
        <div className='content-card mt-4'>
          <div className='content-card-header'>
            <h2 className='content-card-title'>All Students Progress</h2>
          </div>
          <div className='table-responsive mt-3'>
            <table className='students-table'>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Instrument</th>
                  <th>Level</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {progressData.student_progress.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className='fw-medium'>{student.student_name}</span>
                    </td>
                    <td>{student.instrument ? student.instrument.charAt(0).toUpperCase() + student.instrument.slice(1) : 'N/A'}</td>
                    <td>
                      <span className={`level-badge ${student.level}`}>
                        {student.level ? student.level.charAt(0).toUpperCase() + student.level.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className='progress-cell'>
                        <div className='progress-bar-container'>
                          <div 
                            className={`progress-bar-fill ${getProgressClass(student.progress_percentage)}`}
                            style={{width: `${student.progress_percentage}%`}}
                          ></div>
                        </div>
                        <span className='progress-text'>{student.progress_percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${student.status}`}>
                        {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'}
                      </span>
                    </td>
                    <td>{student.last_active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherProgress
