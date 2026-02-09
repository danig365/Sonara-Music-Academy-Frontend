import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const TeacherProgress = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progressData, setProgressData] = useState(null)
  
  // Interactive filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [instrumentFilter, setInstrumentFilter] = useState('all')
  const [sortField, setSortField] = useState('progress_percentage')
  const [sortDirection, setSortDirection] = useState('desc')
  const [activeTab, setActiveTab] = useState('overview') // overview | students | courses
  
  const teacherId = localStorage.getItem('teacherId')

  const fetchProgressData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${baseUrl}/teacher/progress/${teacherId}/`)
      setProgressData(response.data)
    } catch (err) {
      console.error('Error fetching progress data:', err)
      setError('Unable to load progress data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    document.title = 'Sonara | Progress Analytics'
    window.scrollTo(0, 0)
    fetchProgressData()
  }, [fetchProgressData])

  // Filtered and sorted student list
  const filteredStudents = useMemo(() => {
    if (!progressData?.student_progress) return []
    
    let filtered = [...progressData.student_progress]
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(s => 
        s.student_name.toLowerCase().includes(q) ||
        (s.instrument && s.instrument.toLowerCase().includes(q)) ||
        (s.student_email && s.student_email.toLowerCase().includes(q))
      )
    }
    
    // Filters
    if (levelFilter !== 'all') {
      filtered = filtered.filter(s => s.level === levelFilter)
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }
    if (instrumentFilter !== 'all') {
      filtered = filtered.filter(s => s.instrument === instrumentFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      }
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    })
    
    return filtered
  }, [progressData, searchQuery, levelFilter, statusFilter, instrumentFilter, sortField, sortDirection])

  // Extract unique instruments from data
  const uniqueInstruments = useMemo(() => {
    if (!progressData?.student_progress) return []
    const instruments = [...new Set(progressData.student_progress.map(s => s.instrument).filter(Boolean))]
    return instruments.sort()
  }, [progressData])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return 'bi-chevron-expand'
    return sortDirection === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'
  }

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff} days ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', color: '#16a34a' }
      case 'warning': return { bg: '#fef3c7', color: '#d97706' }
      case 'inactive': return { bg: '#fee2e2', color: '#dc2626' }
      default: return { bg: '#f1f5f9', color: '#64748b' }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p className='text-muted mt-3'>Loading progress analytics...</p>
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <div className='d-flex flex-column align-items-center justify-content-center' style={{ minHeight: 400 }}>
        <i className="bi bi-exclamation-triangle display-3 text-warning mb-3"></i>
        <h4 className='mb-2'>Something went wrong</h4>
        <p className='text-muted mb-4'>{error}</p>
        <button className='btn-primary-custom' onClick={fetchProgressData}>
          <i className="bi bi-arrow-clockwise me-2"></i>Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (!progressData || progressData.total_students === 0) {
    return (
      <>
        <div className='dashboard-header'>
          <div className='header-title'>
            <h1>Progress Analytics</h1>
            <p className='header-subtitle'>Monitor student performance and track learning outcomes.</p>
          </div>
        </div>
        <div className='content-card'>
          <div className='d-flex flex-column align-items-center justify-content-center py-5'>
            <i className="bi bi-people display-3 text-muted mb-3"></i>
            <h4 className='mb-2'>No Students Yet</h4>
            <p className='text-muted mb-4'>Once you have students assigned, their progress will appear here.</p>
            <Link to='/teacher-students' className='btn-primary-custom'>
              <i className="bi bi-person-plus me-2"></i>Manage Students
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div className='dashboard-header'>
        <div className='header-title'>
          <h1>Progress Analytics</h1>
          <p className='header-subtitle'>Monitor student performance and track learning outcomes.</p>
        </div>
        <div className='header-actions'>
          <button className='btn-secondary-custom' onClick={fetchProgressData}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='d-flex gap-2 mb-4'>
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: activeTab === 'overview' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
            background: activeTab === 'overview' ? '#eff6ff' : '#fff',
            color: activeTab === 'overview' ? '#3b82f6' : '#64748b',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="bi bi-grid-3x3-gap me-2"></i>Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: activeTab === 'students' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
            background: activeTab === 'students' ? '#eff6ff' : '#fff',
            color: activeTab === 'students' ? '#3b82f6' : '#64748b',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <i className="bi bi-people me-2"></i>Students ({progressData.total_students})
        </button>
        {progressData.course_stats && progressData.course_stats.length > 0 && (
          <button 
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: activeTab === 'courses' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
              background: activeTab === 'courses' ? '#eff6ff' : '#fff',
              color: activeTab === 'courses' ? '#3b82f6' : '#64748b',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="bi bi-journal-bookmark me-2"></i>Courses ({progressData.course_stats.length})
          </button>
        )}
      </div>

      {/* =================== OVERVIEW TAB =================== */}
      {activeTab === 'overview' && (
        <>
          {/* Metrics Row */}
          <div className='metrics-row'>
            <div className='metric-card'>
              <div className='metric-icon' style={{ background: '#dbeafe', color: '#3b82f6' }}>
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
              <div className='metric-icon' style={{ background: '#dcfce7', color: '#22c55e' }}>
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
              <div className='metric-icon' style={{ background: '#fef3c7', color: '#f59e0b' }}>
                <i className="bi bi-people-fill"></i>
              </div>
              <div className='metric-content'>
                <div className='metric-label'>Total Students</div>
                <div className='metric-value'>{progressData.total_students}</div>
                <div className='metric-trend'>
                  {progressData.total_enrollments || 0} enrollments
                </div>
              </div>
            </div>

            <div className='metric-card'>
              <div className='metric-icon' style={{ background: '#fce7f3', color: '#ec4899' }}>
                <i className="bi bi-collection"></i>
              </div>
              <div className='metric-content'>
                <div className='metric-label'>Active Lessons</div>
                <div className='metric-value'>{progressData.total_lessons}</div>
                <div className='metric-trend'>
                  {progressData.total_completed_courses || 0} courses completed
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
                  <h2 className='content-card-title'>
                    <i className="bi bi-pie-chart me-2" style={{ color: '#3b82f6' }}></i>
                    Progress Distribution
                  </h2>
                </div>
                <div className='mt-4'>
                  {/* Visual distribution bar */}
                  <div className='d-flex mb-4' style={{ height: 12, borderRadius: 6, overflow: 'hidden' }}>
                    {progressData.total_students > 0 && (
                      <>
                        <div style={{ width: `${(progressData.progress_distribution.excellent / progressData.total_students) * 100}%`, background: '#22c55e' }}></div>
                        <div style={{ width: `${(progressData.progress_distribution.good / progressData.total_students) * 100}%`, background: '#3b82f6' }}></div>
                        <div style={{ width: `${(progressData.progress_distribution.average / progressData.total_students) * 100}%`, background: '#f59e0b' }}></div>
                        <div style={{ width: `${(progressData.progress_distribution.needs_improvement / progressData.total_students) * 100}%`, background: '#ef4444' }}></div>
                      </>
                    )}
                  </div>

                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3' style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}></div>
                    <div className='flex-grow-1'>Excellent (80%+)</div>
                    <strong className='me-2'>{progressData.progress_distribution.excellent}</strong>
                    <span className='text-muted small'>
                      ({progressData.total_students > 0 ? Math.round((progressData.progress_distribution.excellent / progressData.total_students) * 100) : 0}%)
                    </span>
                  </div>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3' style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                    <div className='flex-grow-1'>Good (60-79%)</div>
                    <strong className='me-2'>{progressData.progress_distribution.good}</strong>
                    <span className='text-muted small'>
                      ({progressData.total_students > 0 ? Math.round((progressData.progress_distribution.good / progressData.total_students) * 100) : 0}%)
                    </span>
                  </div>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3' style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div className='flex-grow-1'>Average (40-59%)</div>
                    <strong className='me-2'>{progressData.progress_distribution.average}</strong>
                    <span className='text-muted small'>
                      ({progressData.total_students > 0 ? Math.round((progressData.progress_distribution.average / progressData.total_students) * 100) : 0}%)
                    </span>
                  </div>
                  <div className='d-flex align-items-center'>
                    <div className='me-3' style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                    <div className='flex-grow-1'>Needs Help (&lt;40%)</div>
                    <strong className='me-2'>{progressData.progress_distribution.needs_improvement}</strong>
                    <span className='text-muted small'>
                      ({progressData.total_students > 0 ? Math.round((progressData.progress_distribution.needs_improvement / progressData.total_students) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className='col-md-8'>
              <div className='content-card h-100'>
                <div className='content-card-header'>
                  <h2 className='content-card-title'>
                    <i className="bi bi-bar-chart me-2" style={{ color: '#3b82f6' }}></i>
                    Weekly Activity
                  </h2>
                  <span className='text-muted small'>Last 7 days</span>
                </div>
                <div className='d-flex align-items-end justify-content-between mt-4' style={{ height: 160 }}>
                  {progressData.weekly_activity.map((day, index) => {
                    const height = (day.activities / getMaxActivity()) * 130
                    const isToday = index === progressData.weekly_activity.length - 1
                    return (
                      <div key={index} className='text-center' style={{ flex: 1 }}>
                        <div 
                          title={`${day.full_date}: ${day.activities} activities${day.time_minutes ? `, ${day.time_minutes} min` : ''}`}
                          style={{
                            width: 40,
                            height: `${Math.max(height, 4)}px`,
                            background: isToday
                              ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'
                              : 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%)',
                            borderRadius: '6px 6px 0 0',
                            margin: '0 auto',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: day.activities === 0 ? 0.3 : 1
                          }}
                        ></div>
                        <div className='text-muted small mt-2' style={{ fontWeight: isToday ? 700 : 400 }}>
                          {day.date}
                        </div>
                        <div className='small' style={{ fontWeight: 600, color: day.activities > 0 ? '#1e293b' : '#94a3b8' }}>
                          {day.activities}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className='row g-4 mb-4'>
            {/* Top Performing Students */}
            <div className='col-md-6'>
              <div className='content-card h-100'>
                <div className='content-card-header'>
                  <h2 className='content-card-title'>
                    <i className="bi bi-trophy text-warning me-2"></i>
                    Top Performing Students
                  </h2>
                  <button 
                    className='view-all-link' 
                    onClick={() => { setActiveTab('students'); setSortField('progress_percentage'); setSortDirection('desc'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 13 }}
                  >
                    View All
                  </button>
                </div>
                {progressData.top_students.length > 0 ? (
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
                            fontWeight: 600,
                            fontSize: 13
                          }}
                        >
                          {index + 1}
                        </div>
                        {student.student_profile_img ? (
                          <img
                            src={`${baseUrl}${student.student_profile_img}`}
                            alt={student.student_name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }}
                          />
                        ) : (
                          <div
                            className='d-flex align-items-center justify-content-center me-3'
                            style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 14 }}
                          >
                            {student.student_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className='flex-grow-1'>
                          <div className='fw-medium'>{student.student_name}</div>
                          <div className='text-muted small'>
                            {student.instrument ? student.instrument.charAt(0).toUpperCase() + student.instrument.slice(1) : ''} 
                            {student.level ? ` · ${student.level.charAt(0).toUpperCase() + student.level.slice(1)}` : ''}
                          </div>
                        </div>
                        <div className='d-flex align-items-center'>
                          <div className='progress-bar-container me-2' style={{ width: 60 }}>
                            <div
                              className={`progress-bar-fill ${getProgressClass(student.progress_percentage)}`}
                              style={{ width: `${student.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className='fw-medium' style={{ color: getProgressColor(student.progress_percentage), minWidth: 40, textAlign: 'right' }}>
                            {student.progress_percentage}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='text-center py-4'>
                    <p className='text-muted'>No student data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Students Needing Attention */}
            <div className='col-md-6'>
              <div className='content-card h-100'>
                <div className='content-card-header'>
                  <h2 className='content-card-title'>
                    <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                    Students Needing Attention
                  </h2>
                  <button 
                    className='view-all-link'
                    onClick={() => { setActiveTab('students'); setStatusFilter('warning'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 13 }}
                  >
                    View All
                  </button>
                </div>
                {progressData.attention_needed.length > 0 ? (
                  <ul className='list-unstyled mt-3'>
                    {progressData.attention_needed.map((student) => {
                      const statusColor = getStatusColor(student.status)
                      return (
                        <li key={student.id} className='d-flex align-items-center mb-3 pb-3 border-bottom'>
                          <div
                            className='d-flex align-items-center justify-content-center me-3'
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: statusColor.bg,
                              color: statusColor.color
                            }}
                          >
                            <i className={`bi ${student.status === 'warning' ? 'bi-exclamation-circle' : 'bi-x-circle'}`}></i>
                          </div>
                          <div className='flex-grow-1'>
                            <div className='fw-medium'>{student.student_name}</div>
                            <div className='text-muted small'>
                              Last active: {formatDate(student.last_active)}
                              {student.instrument ? ` · ${student.instrument.charAt(0).toUpperCase() + student.instrument.slice(1)}` : ''}
                            </div>
                          </div>
                          <div className='text-end'>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                background: statusColor.bg,
                                color: statusColor.color
                              }}
                            >
                              {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Unknown'}
                            </span>
                            <div className='small mt-1' style={{ color: getProgressColor(student.progress_percentage) }}>
                              {student.progress_percentage}% progress
                            </div>
                          </div>
                        </li>
                      )
                    })}
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
        </>
      )}

      {/* =================== STUDENTS TAB =================== */}
      {activeTab === 'students' && (
        <>
          {/* Search & Filters */}
          <div className='content-card mb-4'>
            <div className='d-flex flex-wrap gap-3 align-items-center'>
              {/* Search */}
              <div className='flex-grow-1' style={{ minWidth: 200 }}>
                <div className='position-relative'>
                  <i className="bi bi-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input
                    type='text'
                    placeholder='Search by name, email, or instrument...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  color: levelFilter === 'all' ? '#94a3b8' : '#1e293b'
                }}
              >
                <option value='all'>All Levels</option>
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>

              {/* Instrument Filter */}
              <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  color: instrumentFilter === 'all' ? '#94a3b8' : '#1e293b'
                }}
              >
                <option value='all'>All Instruments</option>
                {uniqueInstruments.map(inst => (
                  <option key={inst} value={inst}>{inst.charAt(0).toUpperCase() + inst.slice(1)}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                  color: statusFilter === 'all' ? '#94a3b8' : '#1e293b'
                }}
              >
                <option value='all'>All Statuses</option>
                <option value='active'>Active</option>
                <option value='warning'>Warning</option>
                <option value='inactive'>Inactive</option>
              </select>

              {/* Clear filters */}
              {(searchQuery || levelFilter !== 'all' || statusFilter !== 'all' || instrumentFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setLevelFilter('all')
                    setStatusFilter('all')
                    setInstrumentFilter('all')
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#ef4444',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <i className="bi bi-x-circle me-1"></i>Clear
                </button>
              )}
            </div>

            {/* Results count */}
            <div className='mt-3 text-muted small'>
              Showing {filteredStudents.length} of {progressData.student_progress.length} students
            </div>
          </div>

          {/* Students Table */}
          <div className='content-card'>
            <div className='table-responsive'>
              <table className='students-table'>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('student_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Student <i className={`bi ${getSortIcon('student_name')} ms-1`}></i>
                    </th>
                    <th onClick={() => handleSort('instrument')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Instrument <i className={`bi ${getSortIcon('instrument')} ms-1`}></i>
                    </th>
                    <th onClick={() => handleSort('level')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Level <i className={`bi ${getSortIcon('level')} ms-1`}></i>
                    </th>
                    <th onClick={() => handleSort('progress_percentage')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Progress <i className={`bi ${getSortIcon('progress_percentage')} ms-1`}></i>
                    </th>
                    <th>Courses</th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Status <i className={`bi ${getSortIcon('status')} ms-1`}></i>
                    </th>
                    <th onClick={() => handleSort('last_active')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                      Last Active <i className={`bi ${getSortIcon('last_active')} ms-1`}></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const statusColor = getStatusColor(student.status)
                      return (
                        <tr key={student.id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              {student.student_profile_img ? (
                                <img
                                  src={`${baseUrl}${student.student_profile_img}`}
                                  alt={student.student_name}
                                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', marginRight: 10 }}
                                />
                              ) : (
                                <div
                                  className='d-flex align-items-center justify-content-center'
                                  style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 13, marginRight: 10, flexShrink: 0 }}
                                >
                                  {student.student_name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <span className='fw-medium'>{student.student_name}</span>
                                {student.student_email && (
                                  <div className='text-muted' style={{ fontSize: 12 }}>{student.student_email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {student.instrument ? student.instrument.charAt(0).toUpperCase() + student.instrument.slice(1) : 'N/A'}
                          </td>
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
                                  style={{ width: `${student.progress_percentage}%` }}
                                ></div>
                              </div>
                              <span className='progress-text' style={{ color: getProgressColor(student.progress_percentage) }}>
                                {student.progress_percentage}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: 13 }}>
                              {student.completed_courses || 0}/{student.enrolled_courses || 0}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                background: statusColor.bg,
                                color: statusColor.color
                              }}
                            >
                              {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'}
                            </span>
                          </td>
                          <td>
                            <span className='text-muted' style={{ fontSize: 13 }}>
                              {formatDate(student.last_active)}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className='text-center py-4'>
                        <i className="bi bi-search display-6 text-muted d-block mb-2"></i>
                        <span className='text-muted'>No students match your filters</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =================== COURSES TAB =================== */}
      {activeTab === 'courses' && progressData.course_stats && (
        <>
          <div className='row g-4'>
            {progressData.course_stats.map((course) => (
              <div className='col-md-6 col-lg-4' key={course.id}>
                <div className='content-card h-100'>
                  <div className='d-flex align-items-start mb-3'>
                    <div
                      className='d-flex align-items-center justify-content-center me-3'
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#eff6ff',
                        color: '#3b82f6',
                        flexShrink: 0
                      }}
                    >
                      <i className="bi bi-journal-bookmark" style={{ fontSize: 20 }}></i>
                    </div>
                    <div className='flex-grow-1' style={{ minWidth: 0 }}>
                      <h6 className='mb-1' style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </h6>
                      <div className='text-muted small'>
                        {course.enrollments} student{course.enrollments !== 1 ? 's' : ''} enrolled
                      </div>
                    </div>
                  </div>

                  <div className='mb-2'>
                    <div className='d-flex justify-content-between mb-1'>
                      <span className='text-muted small'>Average Progress</span>
                      <span className='fw-medium small' style={{ color: getProgressColor(course.avg_progress) }}>
                        {course.avg_progress}%
                      </span>
                    </div>
                    <div className='progress-bar-container' style={{ height: 8 }}>
                      <div
                        className={`progress-bar-fill ${getProgressClass(course.avg_progress)}`}
                        style={{ width: `${course.avg_progress}%`, transition: 'width 0.5s ease' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {progressData.course_stats.length === 0 && (
            <div className='content-card'>
              <div className='d-flex flex-column align-items-center justify-content-center py-5'>
                <i className="bi bi-journal-x display-3 text-muted mb-3"></i>
                <h5 className='mb-2'>No Courses Yet</h5>
                <p className='text-muted'>Create courses to see enrollment and progress analytics.</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default TeacherProgress
