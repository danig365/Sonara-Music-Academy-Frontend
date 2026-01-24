import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import TeacherSidebarNew from './TeacherSidebarNew'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../../config';

const baseUrl = API_BASE_URL;

const TeacherStudents = () => {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterInstrument, setFilterInstrument] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  const teacherId = localStorage.getItem('teacherId')

  useEffect(() => {
    document.title = 'LMS | My Students'
    window.scrollTo(0, 0)
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      // First try to get from TeacherStudent model
      const response = await axios.get(`${baseUrl}/teacher/students/${teacherId}/`)
      if (response.data && response.data.length > 0) {
        setStudents(response.data)
      } else {
        // Fall back to enrollment-based students
        const enrollResponse = await axios.get(`${baseUrl}/teacher/students-from-enrollments/${teacherId}/`)
        if (enrollResponse.data.bool) {
          setStudents(enrollResponse.data.students)
        }
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      // Set sample data
      setStudents(getSampleStudents())
      setLoading(false)
    }
  }

  const getSampleStudents = () => [
    { id: 1, fullname: 'Sarah Miller', email: 'sarah@example.com', instrument: 'piano', level: 'advanced', progress_percentage: 85, last_active: '2 hours ago', status: 'active' },
    { id: 2, fullname: 'Mike Johnson', email: 'mike@example.com', instrument: 'guitar', level: 'intermediate', progress_percentage: 62, last_active: '1 day ago', status: 'active' },
    { id: 3, fullname: 'Emily Davis', email: 'emily@example.com', instrument: 'violin', level: 'beginner', progress_percentage: 34, last_active: '3 days ago', status: 'inactive' },
    { id: 4, fullname: 'Alex Wilson', email: 'alex@example.com', instrument: 'piano', level: 'intermediate', progress_percentage: 78, last_active: '5 hours ago', status: 'active' },
    { id: 5, fullname: 'Jessica Brown', email: 'jessica@example.com', instrument: 'voice', level: 'advanced', progress_percentage: 92, last_active: '1 hour ago', status: 'active' },
    { id: 6, fullname: 'David Clark', email: 'david@example.com', instrument: 'guitar', level: 'beginner', progress_percentage: 15, last_active: '1 week ago', status: 'warning' }
  ]

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarClass = (name) => {
    const initials = getInitials(name).toLowerCase()
    const classes = ['sm', 'mj', 'ed', 'aw', 'jb', 'dc']
    const index = initials.charCodeAt(0) % classes.length
    return classes[index]
  }

  const getProgressClass = (percentage) => {
    if (percentage >= 80) return 'high'
    if (percentage >= 60) return 'medium'
    if (percentage >= 30) return 'low'
    return 'very-low'
  }

  const formatInstrument = (instrument) => {
    return instrument ? instrument.charAt(0).toUpperCase() + instrument.slice(1) : 'N/A'
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesInstrument = !filterInstrument || student.instrument === filterInstrument
    const matchesLevel = !filterLevel || student.level === filterLevel
    const matchesStatus = !filterStatus || student.status === filterStatus
    return matchesSearch && matchesInstrument && matchesLevel && matchesStatus
  })

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
            <h1>My Students</h1>
            <p className='header-subtitle'>Manage your assigned students and track their progress.</p>
          </div>
          <div className='header-actions'>
            <button className='btn-primary-custom'>
              <i className="bi bi-plus-lg"></i>
              Add New Student
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className='content-card'>
          <div className='search-filter-bar'>
            <div className='search-input-wrapper'>
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                className='search-input' 
                placeholder='Search students...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className='filter-btn'>
              <i className="bi bi-funnel"></i>
              Filter
            </button>
            <button className='filter-btn'>
              <i className="bi bi-envelope"></i>
              Message All
            </button>
          </div>

          {/* Optional Filter Dropdowns */}
          <div className='d-flex gap-3 mb-4'>
            <select 
              className='form-select' 
              style={{width: 'auto'}}
              value={filterInstrument}
              onChange={(e) => setFilterInstrument(e.target.value)}
            >
              <option value="">All Instruments</option>
              <option value="piano">Piano</option>
              <option value="guitar">Guitar</option>
              <option value="violin">Violin</option>
              <option value="voice">Voice</option>
              <option value="drums">Drums</option>
            </select>
            <select 
              className='form-select' 
              style={{width: 'auto'}}
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select 
              className='form-select' 
              style={{width: 'auto'}}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          {/* Students Table */}
          <div className='table-responsive'>
            <table className='students-table'>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Instrument</th>
                  <th>Level</th>
                  <th>Progress</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id || index}>
                    <td>
                      <div className='student-cell'>
                        {student.profile_img ? (
                          <img 
                            src={student.profile_img} 
                            alt={student.fullname} 
                            className='student-avatar'
                            style={{objectFit: 'cover'}}
                          />
                        ) : (
                          <div className={`student-avatar ${getAvatarClass(student.fullname)}`}>
                            {getInitials(student.fullname)}
                          </div>
                        )}
                        <span>{student.fullname}</span>
                      </div>
                    </td>
                    <td>{formatInstrument(student.instrument)}</td>
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
                    <td>{student.last_active || student.time_ago || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${student.status}`}>
                        {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className='dropdown'>
                        <button className='action-btn' data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className='dropdown-menu'>
                          <li><a className='dropdown-item' href='#'>View Details</a></li>
                          <li><Link className='dropdown-item' to={`/show-assignment/${student.id}/${teacherId}`}>View Assignments</Link></li>
                          <li><Link className='dropdown-item' to={`/add-assignment/${student.id}/${teacherId}`}>Add Assignment</Link></li>
                          <li><a className='dropdown-item' href='#'>View Profile</a></li>
                          <li><hr className='dropdown-divider' /></li>
                          <li><a className='dropdown-item text-danger' href='#'>Remove</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className='text-center py-5'>
              <i className="bi bi-people display-4 text-muted"></i>
              <p className='text-muted mt-3'>No students found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherStudents
