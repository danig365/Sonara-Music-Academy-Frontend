import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const TeacherStudents = () => {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterInstrument, setFilterInstrument] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortField, setSortField] = useState('student_name')
  const [sortDir, setSortDir] = useState('asc')

  // Add Student Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addForm, setAddForm] = useState({ student: null, instrument: 'piano', level: 'beginner', notes: '' })

  // Assign Course Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignStudent, setAssignStudent] = useState(null)
  const [teacherCourses, setTeacherCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Student Detail Panel
  const [expandedStudentId, setExpandedStudentId] = useState(null)

  // Edit Student Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: null, instrument: '', level: '', notes: '', status: '' })

  const teacherId = localStorage.getItem('teacherId')

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${baseUrl}/teacher/students/${teacherId}/`)
      if (response.data && response.data.length > 0) {
        setStudents(response.data)
      } else {
        // Try enrollment-based fallback and sync
        try {
          const enrollRes = await axios.get(`${baseUrl}/teacher/students-from-enrollments/${teacherId}/`)
          if (enrollRes.data.bool && enrollRes.data.students?.length > 0) {
            // Create TeacherStudent records for these students
            for (const s of enrollRes.data.students) {
              try {
                await axios.post(`${baseUrl}/teacher/students/${teacherId}/`, {
                  teacher: parseInt(teacherId),
                  student: s.id,
                  instrument: s.instrument || 'piano',
                  level: s.level || 'beginner',
                  status: 'active',
                  progress_percentage: s.progress_percentage || 0,
                })
              } catch (e) {
                // Already exists, ignore
              }
            }
            // Re-fetch
            const refetch = await axios.get(`${baseUrl}/teacher/students/${teacherId}/`)
            setStudents(refetch.data || [])
          } else {
            setStudents([])
          }
        } catch (e) {
          setStudents([])
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    document.title = 'Sonara | My Students'
    window.scrollTo(0, 0)
    fetchStudents()
  }, [fetchStudents])

  // Search students for Add modal
  useEffect(() => {
    if (studentSearch.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await axios.get(`${baseUrl}/teacher/search-students/${teacherId}/?search=${encodeURIComponent(studentSearch)}`)
        setSearchResults(res.data.students || [])
      } catch (e) {
        setSearchResults([])
      }
      setSearching(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [studentSearch, teacherId])

  // Filtered & sorted students
  const filteredStudents = useMemo(() => {
    let filtered = [...students]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        (s.student_name || '').toLowerCase().includes(q) ||
        (s.student_email || '').toLowerCase().includes(q)
      )
    }
    if (filterInstrument) filtered = filtered.filter(s => s.instrument === filterInstrument)
    if (filterLevel) filtered = filtered.filter(s => s.level === filterLevel)
    if (filterStatus) filtered = filtered.filter(s => s.status === filterStatus)

    filtered.sort((a, b) => {
      let aVal = a[sortField] ?? ''
      let bVal = b[sortField] ?? ''
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal || '').toLowerCase() }
      if (sortDir === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    })

    return filtered
  }, [students, searchTerm, filterInstrument, filterLevel, filterStatus, sortField, sortDir])

  const uniqueInstruments = useMemo(() => {
    return [...new Set(students.map(s => s.instrument).filter(Boolean))].sort()
  }, [students])

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return 'bi-chevron-expand'
    return sortDir === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'
  }

  const getProgressColor = (p) => {
    if (p >= 80) return '#22c55e'
    if (p >= 60) return '#3b82f6'
    if (p >= 40) return '#f59e0b'
    return '#ef4444'
  }

  const getProgressClass = (p) => {
    if (p >= 80) return 'high'
    if (p >= 60) return 'medium'
    if (p >= 40) return 'low'
    return 'very-low'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', color: '#16a34a' }
      case 'warning': return { bg: '#fef3c7', color: '#d97706' }
      case 'inactive': return { bg: '#fee2e2', color: '#dc2626' }
      default: return { bg: '#f1f5f9', color: '#64748b' }
    }
  }

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : 'N/A'

  // === ADD STUDENT ===
  const handleAddStudent = async () => {
    if (!addForm.student) {
      Swal.fire('Error', 'Please select a student', 'error')
      return
    }
    try {
      await axios.post(`${baseUrl}/teacher/students/${teacherId}/`, {
        teacher: parseInt(teacherId),
        student: addForm.student.id,
        instrument: addForm.instrument,
        level: addForm.level,
        notes: addForm.notes,
        status: 'active',
        progress_percentage: 0,
      })
      Swal.fire('Success', `${addForm.student.fullname} has been added as your student`, 'success')
      setShowAddModal(false)
      setAddForm({ student: null, instrument: 'piano', level: 'beginner', notes: '' })
      setStudentSearch('')
      setSearchResults([])
      fetchStudents()
    } catch (error) {
      const msg = error.response?.data?.student?.[0] || error.response?.data?.non_field_errors?.[0] || 'Failed to add student'
      Swal.fire('Error', msg, 'error')
    }
  }

  // === REMOVE STUDENT ===
  const handleRemoveStudent = (student) => {
    Swal.fire({
      title: 'Remove Student?',
      html: `Remove <strong>${student.student_name}</strong> from your students list?<br><small class="text-muted">This won't delete their account or course enrollments.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}/teacher/student/${student.id}/`)
          Swal.fire('Removed', `${student.student_name} has been removed`, 'success')
          fetchStudents()
          if (expandedStudentId === student.id) setExpandedStudentId(null)
        } catch (e) {
          Swal.fire('Error', 'Failed to remove student', 'error')
        }
      }
    })
  }

  // === EDIT STUDENT ===
  const openEditModal = (student) => {
    setEditForm({
      id: student.id,
      instrument: student.instrument || 'piano',
      level: student.level || 'beginner',
      notes: student.notes || '',
      status: student.status || 'active',
    })
    setShowEditModal(true)
  }

  const handleEditStudent = async () => {
    try {
      await axios.patch(`${baseUrl}/teacher/student/${editForm.id}/`, {
        instrument: editForm.instrument,
        level: editForm.level,
        notes: editForm.notes,
        status: editForm.status,
      })
      Swal.fire('Updated', 'Student info updated successfully', 'success')
      setShowEditModal(false)
      fetchStudents()
    } catch (e) {
      Swal.fire('Error', 'Failed to update student', 'error')
    }
  }

  // === ASSIGN COURSE ===
  const openAssignModal = async (student) => {
    setAssignStudent(student)
    setLoadingCourses(true)
    setShowAssignModal(true)
    try {
      const res = await axios.get(`${baseUrl}/teacher/courses-for-student/${teacherId}/${student.student?.id || student.student}/`)
      setTeacherCourses(res.data.courses || [])
    } catch (e) {
      setTeacherCourses([])
    }
    setLoadingCourses(false)
  }

  const handleAssignCourse = async (courseId) => {
    const studentId = assignStudent.student?.id || assignStudent.student
    try {
      const res = await axios.post(`${baseUrl}/teacher/assign-course/${teacherId}/`, {
        student_id: studentId,
        course_id: courseId,
      })
      if (res.data.bool) {
        Swal.fire('Enrolled!', res.data.message, 'success')
        // Refresh courses in modal
        const updated = await axios.get(`${baseUrl}/teacher/courses-for-student/${teacherId}/${studentId}/`)
        setTeacherCourses(updated.data.courses || [])
        fetchStudents()
      } else {
        Swal.fire('Info', res.data.message, 'info')
      }
    } catch (e) {
      Swal.fire('Error', e.response?.data?.error || 'Failed to assign course', 'error')
    }
  }

  const handleUnassignCourse = async (courseId) => {
    const studentId = assignStudent.student?.id || assignStudent.student
    const result = await Swal.fire({
      title: 'Remove Enrollment?',
      text: 'This will remove the student from this course.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Remove',
    })
    if (!result.isConfirmed) return
    try {
      await axios.post(`${baseUrl}/teacher/unassign-course/${teacherId}/`, {
        student_id: studentId,
        course_id: courseId,
      })
      Swal.fire('Removed', 'Enrollment removed', 'success')
      const updated = await axios.get(`${baseUrl}/teacher/courses-for-student/${teacherId}/${studentId}/`)
      setTeacherCourses(updated.data.courses || [])
      fetchStudents()
    } catch (e) {
      Swal.fire('Error', 'Failed to remove enrollment', 'error')
    }
  }

  // Loading
  if (loading) {
    return (
      <div className='loading-container'>
        <div className='loading-spinner'></div>
        <p className='text-muted mt-3'>Loading students...</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className='dashboard-header'>
        <div className='header-title'>
          <h1>My Students</h1>
          <p className='header-subtitle'>Manage your assigned students, track progress, and assign courses.</p>
        </div>
        <div className='header-actions'>
          <button className='btn-secondary-custom' onClick={fetchStudents}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button className='btn-primary-custom' onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-1"></i>Add Student
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className='metrics-row' style={{ marginBottom: 24 }}>
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#dbeafe', color: '#3b82f6' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Total Students</div>
            <div className='metric-value'>{students.length}</div>
          </div>
        </div>
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#dcfce7', color: '#22c55e' }}>
            <i className="bi bi-person-check-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Active</div>
            <div className='metric-value'>{students.filter(s => s.status === 'active').length}</div>
          </div>
        </div>
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Needs Attention</div>
            <div className='metric-value'>{students.filter(s => s.status === 'warning' || s.status === 'inactive').length}</div>
          </div>
        </div>
        <div className='metric-card'>
          <div className='metric-icon' style={{ background: '#fce7f3', color: '#ec4899' }}>
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div className='metric-content'>
            <div className='metric-label'>Avg Progress</div>
            <div className='metric-value'>
              {students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.progress_percentage || 0), 0) / students.length) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className='content-card' style={{ marginBottom: 24 }}>
        <div className='d-flex flex-wrap gap-3 align-items-center'>
          <div className='flex-grow-1' style={{ minWidth: 200 }}>
            <div className='position-relative'>
              <i className="bi bi-search position-absolute" style={{ left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input
                type='text'
                placeholder='Search by name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 36px',
                  border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>
          <select value={filterInstrument} onChange={e => setFilterInstrument(e.target.value)}
            style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}>
            <option value="">All Instruments</option>
            {uniqueInstruments.map(i => <option key={i} value={i}>{capitalize(i)}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}>
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="inactive">Inactive</option>
          </select>
          {(searchTerm || filterInstrument || filterLevel || filterStatus) && (
            <button onClick={() => { setSearchTerm(''); setFilterInstrument(''); setFilterLevel(''); setFilterStatus('') }}
              style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="bi bi-x-circle me-1"></i>Clear
            </button>
          )}
        </div>
        <div className='mt-2 text-muted small'>
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Table */}
      <div className='content-card'>
        {students.length === 0 ? (
          <div className='d-flex flex-column align-items-center justify-content-center py-5'>
            <i className="bi bi-people display-3 text-muted mb-3"></i>
            <h4 className='mb-2'>No Students Yet</h4>
            <p className='text-muted mb-4'>Add students to start managing their learning journey.</p>
            <button className='btn-primary-custom' onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg me-2"></i>Add Your First Student
            </button>
          </div>
        ) : (
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
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const sc = getStatusColor(student.status)
                  const isExpanded = expandedStudentId === student.id
                  return (
                    <React.Fragment key={student.id}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}>
                        <td>
                          <div className='d-flex align-items-center'>
                            {student.student_profile_img ? (
                              <img src={`${baseUrl}${student.student_profile_img}`} alt={student.student_name}
                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: 10 }} />
                            ) : (
                              <div className='d-flex align-items-center justify-content-center'
                                style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontWeight: 600, fontSize: 14, marginRight: 10, flexShrink: 0 }}>
                                {(student.student_name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className='fw-medium'>{student.student_name}</span>
                              {student.student_email && <div className='text-muted' style={{ fontSize: 12 }}>{student.student_email}</div>}
                            </div>
                          </div>
                        </td>
                        <td>{capitalize(student.instrument)}</td>
                        <td>
                          <span className={`level-badge ${student.level}`}>{capitalize(student.level)}</span>
                        </td>
                        <td>
                          <div className='progress-cell'>
                            <div className='progress-bar-container'>
                              <div className={`progress-bar-fill ${getProgressClass(student.progress_percentage)}`}
                                style={{ width: `${student.progress_percentage}%` }}></div>
                            </div>
                            <span className='progress-text' style={{ color: getProgressColor(student.progress_percentage) }}>
                              {student.progress_percentage}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{student.enrolled_course_count || 0}</span>
                        </td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                            {capitalize(student.status)}
                          </span>
                        </td>
                        <td>
                          <span className='text-muted' style={{ fontSize: 13 }}>{student.time_ago || 'N/A'}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className='d-flex gap-1'>
                            <button title='Assign Course' onClick={() => openAssignModal(student)}
                              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#3b82f6' }}>
                              <i className="bi bi-journal-plus"></i>
                            </button>
                            <button title='Edit Student' onClick={() => openEditModal(student)}
                              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#22c55e' }}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button title='Remove Student' onClick={() => handleRemoveStudent(student)}
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                            <div style={{ background: '#f8fafc', padding: '20px 24px', borderBottom: '2px solid #e2e8f0' }}>
                              <div className='row g-4'>
                                <div className='col-md-4'>
                                  <h6 style={{ color: '#475569', marginBottom: 12 }}>
                                    <i className="bi bi-person-badge me-2"></i>Student Info
                                  </h6>
                                  <div className='mb-2'><strong>Instrument:</strong> {capitalize(student.instrument)}</div>
                                  <div className='mb-2'><strong>Level:</strong> {capitalize(student.level)}</div>
                                  <div className='mb-2'><strong>Assigned:</strong> {student.assigned_at ? new Date(student.assigned_at).toLocaleDateString() : 'N/A'}</div>
                                  {student.notes && <div className='mb-2'><strong>Notes:</strong> {student.notes}</div>}
                                </div>
                                <div className='col-md-8'>
                                  <h6 style={{ color: '#475569', marginBottom: 12 }}>
                                    <i className="bi bi-journal-bookmark me-2"></i>Enrolled Courses
                                    <button className='ms-2' onClick={(e) => { e.stopPropagation(); openAssignModal(student) }}
                                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#3b82f6', fontSize: 12 }}>
                                      <i className="bi bi-plus me-1"></i>Assign
                                    </button>
                                  </h6>
                                  {student.enrolled_courses && student.enrolled_courses.length > 0 ? (
                                    <div className='d-flex flex-wrap gap-2'>
                                      {student.enrolled_courses.map(c => (
                                        <div key={c.enrollment_id}
                                          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                                          <div className='fw-medium'>{c.course_title}</div>
                                          <div className='d-flex align-items-center gap-2 mt-1'>
                                            <div style={{ width: 60, height: 4, background: '#e2e8f0', borderRadius: 2 }}>
                                              <div style={{ width: `${c.progress_percent}%`, height: '100%', background: getProgressColor(c.progress_percent), borderRadius: 2 }}></div>
                                            </div>
                                            <span className='text-muted' style={{ fontSize: 11 }}>{c.progress_percent}%</span>
                                            <span className='text-muted' style={{ fontSize: 11 }}>· {c.enrolled_time}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className='text-muted small mb-0'>No courses enrolled yet. Click "Assign" to add courses.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className='text-center py-4'>
                      <i className="bi bi-search display-6 text-muted d-block mb-2"></i>
                      <span className='text-muted'>No students match your filters</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================== ADD STUDENT MODAL ===================== */}
      {showAddModal && (
        <div className='modal-overlay' onClick={() => setShowAddModal(false)}>
          <div className='modal-container' onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className='modal-header-custom'>
              <h3><i className="bi bi-person-plus me-2"></i>Add Student</h3>
              <button className='modal-close' onClick={() => setShowAddModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className='modal-body-custom'>
              {/* Student Search */}
              <div className='mb-3'>
                <label className='form-label fw-medium'>Search Student</label>
                <div className='position-relative'>
                  <i className="bi bi-search position-absolute" style={{ left: 12, top: 12, color: '#94a3b8' }}></i>
                  <input type='text' placeholder='Type name or email (min 2 chars)...'
                    value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                  />
                </div>
                {/* Search Results */}
                {searching && <div className='text-muted small mt-2'>Searching...</div>}
                {searchResults.length > 0 && (
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 8 }}>
                    {searchResults.map(s => (
                      <div key={s.id} onClick={() => { setAddForm({ ...addForm, student: s }); setSearchResults([]) }}
                        style={{
                          padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          borderBottom: '1px solid #f1f5f9', background: addForm.student?.id === s.id ? '#eff6ff' : '#fff'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = addForm.student?.id === s.id ? '#eff6ff' : '#fff'}
                      >
                        {s.profile_img ? (
                          <img src={`${baseUrl}${s.profile_img}`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#64748b' }}>
                            {s.fullname?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <div className='fw-medium' style={{ fontSize: 14 }}>{s.fullname}</div>
                          <div className='text-muted' style={{ fontSize: 12 }}>{s.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {studentSearch.length >= 2 && !searching && searchResults.length === 0 && (
                  <div className='text-muted small mt-2'>No students found</div>
                )}
              </div>

              {/* Selected Student */}
              {addForm.student && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center gap-2'>
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <strong>{addForm.student.fullname}</strong>
                      <span className='text-muted small'>({addForm.student.email})</span>
                    </div>
                    <button onClick={() => setAddForm({ ...addForm, student: null })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Instrument & Level */}
              <div className='row g-3 mb-3'>
                <div className='col-6'>
                  <label className='form-label fw-medium'>Instrument</label>
                  <select value={addForm.instrument} onChange={e => setAddForm({ ...addForm, instrument: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                    <option value="piano">Piano</option>
                    <option value="guitar">Guitar</option>
                    <option value="violin">Violin</option>
                    <option value="voice">Voice</option>
                    <option value="drums">Drums</option>
                    <option value="flute">Flute</option>
                    <option value="saxophone">Saxophone</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className='col-6'>
                  <label className='form-label fw-medium'>Level</label>
                  <select value={addForm.level} onChange={e => setAddForm({ ...addForm, level: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className='mb-3'>
                <label className='form-label fw-medium'>Notes (optional)</label>
                <textarea value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder='Any notes about this student...' rows={2}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>
            <div className='modal-footer-custom'>
              <button onClick={() => setShowAddModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleAddStudent} disabled={!addForm.student}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: addForm.student ? '#3b82f6' : '#94a3b8', color: '#fff', cursor: addForm.student ? 'pointer' : 'not-allowed', fontWeight: 600
                }}>
                <i className="bi bi-plus-lg me-1"></i>Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSIGN COURSE MODAL ===================== */}
      {showAssignModal && assignStudent && (
        <div className='modal-overlay' onClick={() => setShowAssignModal(false)}>
          <div className='modal-container' onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className='modal-header-custom'>
              <h3><i className="bi bi-journal-plus me-2"></i>Assign Course to {assignStudent.student_name}</h3>
              <button className='modal-close' onClick={() => setShowAssignModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className='modal-body-custom'>
              {loadingCourses ? (
                <div className='text-center py-4'>
                  <div className='loading-spinner' style={{ width: 32, height: 32 }}></div>
                  <p className='text-muted mt-2'>Loading courses...</p>
                </div>
              ) : teacherCourses.length === 0 ? (
                <div className='text-center py-4'>
                  <i className="bi bi-journal-x display-4 text-muted"></i>
                  <p className='text-muted mt-2'>You don't have any courses yet.</p>
                  <Link to='/teacher-course-management' className='btn-primary-custom' style={{ display: 'inline-flex', textDecoration: 'none' }}>
                    <i className="bi bi-plus-lg me-2"></i>Create a Course
                  </Link>
                </div>
              ) : (
                <div>
                  {teacherCourses.map(course => (
                    <div key={course.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 10, background: course.is_enrolled ? '#f0fdf4' : '#fff' }}>
                      <div className='d-flex align-items-center gap-3' style={{ flex: 1, minWidth: 0 }}>
                        {course.featured_img ? (
                          <img src={`${baseUrl}${course.featured_img}`} alt="" style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 48, height: 36, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-journal text-muted"></i>
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div className='fw-medium' style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                          <div className='text-muted' style={{ fontSize: 12 }}>{course.total_enrolled} student{course.total_enrolled !== 1 ? 's' : ''} enrolled</div>
                        </div>
                      </div>
                      {course.is_enrolled ? (
                        <div className='d-flex align-items-center gap-2'>
                          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>
                            <i className="bi bi-check-circle me-1"></i>Enrolled
                          </span>
                          <button onClick={() => handleUnassignCourse(course.id)}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}
                            title='Remove enrollment'>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleAssignCourse(course.id)}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                          <i className="bi bi-plus me-1"></i>Enroll
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='modal-footer-custom'>
              <button onClick={() => setShowAssignModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== EDIT STUDENT MODAL ===================== */}
      {showEditModal && (
        <div className='modal-overlay' onClick={() => setShowEditModal(false)}>
          <div className='modal-container' onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className='modal-header-custom'>
              <h3><i className="bi bi-pencil-square me-2"></i>Edit Student</h3>
              <button className='modal-close' onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className='modal-body-custom'>
              <div className='row g-3 mb-3'>
                <div className='col-6'>
                  <label className='form-label fw-medium'>Instrument</label>
                  <select value={editForm.instrument} onChange={e => setEditForm({ ...editForm, instrument: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                    <option value="piano">Piano</option>
                    <option value="guitar">Guitar</option>
                    <option value="violin">Violin</option>
                    <option value="voice">Voice</option>
                    <option value="drums">Drums</option>
                    <option value="flute">Flute</option>
                    <option value="saxophone">Saxophone</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className='col-6'>
                  <label className='form-label fw-medium'>Level</label>
                  <select value={editForm.level} onChange={e => setEditForm({ ...editForm, level: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className='mb-3'>
                <label className='form-label fw-medium'>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                  <option value="active">Active</option>
                  <option value="warning">Warning</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className='mb-3'>
                <label className='form-label fw-medium'>Notes</label>
                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder='Teacher notes about this student...' rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>
            <div className='modal-footer-custom'>
              <button onClick={() => setShowEditModal(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleEditStudent}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                <i className="bi bi-check-lg me-1"></i>Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TeacherStudents
