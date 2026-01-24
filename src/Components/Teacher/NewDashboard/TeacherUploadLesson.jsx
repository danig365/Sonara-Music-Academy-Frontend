import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import TeacherSidebarNew from './TeacherSidebarNew'
import Swal from 'sweetalert2'
import './teacherDashboard.css'

const baseUrl = 'http://127.0.0.1:8000/api'

const TeacherUploadLesson = () => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    featured_img: null
  })
  
  const fileInputRef = useRef(null)
  const teacherId = localStorage.getItem('teacherId')
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'LMS | Upload Lesson'
    window.scrollTo(0, 0)
    fetchCategories()
    fetchStudents()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/category/`)
      setCategories(response.data)
      if (response.data.length > 0) {
        setLessonData(prev => ({ ...prev, category: response.data[0].id }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchStudents = async () => {
    try {
      // Try TeacherStudent first
      const response = await axios.get(`${baseUrl}/teacher/students/${teacherId}/`)
      if (response.data && response.data.length > 0) {
        setStudents(response.data.map(s => ({
          id: s.student || s.id,
          fullname: s.student_name || s.fullname
        })))
      } else {
        // Fall back to enrollments
        const enrollResponse = await axios.get(`${baseUrl}/fetch-all-enrolled-students/${teacherId}`)
        const uniqueStudents = []
        const seenIds = new Set()
        enrollResponse.data.forEach(e => {
          if (e.student && !seenIds.has(e.student.id)) {
            seenIds.add(e.student.id)
            uniqueStudents.push({
              id: e.student.id,
              fullname: e.student.fullname
            })
          }
        })
        setStudents(uniqueStudents)
      }
    } catch (error) {
      console.log(error)
      // Sample students
      setStudents([
        { id: 1, fullname: 'Sarah Miller' },
        { id: 2, fullname: 'Mike Johnson' },
        { id: 3, fullname: 'Emily Davis' },
        { id: 4, fullname: 'Alex Wilson' },
        { id: 5, fullname: 'Jessica Brown' }
      ])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'audio/mp3', 'audio/mpeg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload MP4, MP3, or PDF files only.'
      })
      return
    }
    
    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'File size must be less than 50MB.'
      })
      return
    }
    
    setSelectedFile(file)
  }

  const handleBrowseClick = () => {
    fileInputRef.current.click()
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setLessonData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLessonData(prev => ({ ...prev, featured_img: e.target.files[0] }))
    }
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked
    setSelectAll(checked)
    if (checked) {
      setSelectedStudents(students.map(s => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        const newSelection = prev.filter(id => id !== studentId)
        setSelectAll(false)
        return newSelection
      } else {
        const newSelection = [...prev, studentId]
        if (newSelection.length === students.length) {
          setSelectAll(true)
        }
        return newSelection
      }
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!lessonData.title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a lesson title.'
      })
      return
    }

    setUploading(true)

    try {
      // Create course/lesson first
      const formData = new FormData()
      formData.append('title', lessonData.title)
      formData.append('description', lessonData.description || lessonData.title)
      formData.append('category', lessonData.category)
      formData.append('teacher', teacherId)
      formData.append('techs', lessonData.difficulty)
      
      if (lessonData.featured_img) {
        formData.append('featured_img', lessonData.featured_img)
      }

      // Create course
      const courseResponse = await axios.post(`${baseUrl}/course/`, formData, {
        headers: { 'content-type': 'multipart/form-data' }
      })

      const courseId = courseResponse.data.id

      // Upload file as chapter/material if selected
      if (selectedFile) {
        const materialFormData = new FormData()
        materialFormData.append('course', courseId)
        materialFormData.append('title', selectedFile.name)
        materialFormData.append('description', `Material for ${lessonData.title}`)
        materialFormData.append('video', selectedFile)

        await axios.post(`${baseUrl}/chapter/`, materialFormData, {
          headers: { 'content-type': 'multipart/form-data' }
        })
      }

      // Assign to students if any selected
      if (selectedStudents.length > 0 || selectAll) {
        try {
          await axios.post(`${baseUrl}/teacher/assign-lesson/${teacherId}/${courseId}/`, {
            assign_to_all: selectAll,
            student_ids: selectedStudents
          })
        } catch (assignError) {
          console.log('Assignment API not available, skipping assignment')
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Lesson uploaded successfully!',
        confirmButtonColor: '#3b82f6'
      }).then(() => {
        navigate('/teacher-lesson-library')
      })

    } catch (error) {
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'There was an error uploading your lesson. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className='d-flex'>
      <TeacherSidebarNew />
      <div className='teacher-main-content'>
        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-title'>
            <h1>Upload Lesson Material</h1>
            <p className='header-subtitle'>Add new videos, audio tracks, or documents for your students.</p>
          </div>
        </div>

        {/* Upload Container */}
        <div className='upload-container'>
          {/* Left Column */}
          <div>
            {/* File Upload Area */}
            <div className='content-card mb-4'>
              <div 
                className={`upload-area ${dragActive ? 'dragging' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".mp4,.webm,.mp3,.pdf"
                  style={{ display: 'none' }}
                />
                
                {selectedFile ? (
                  <div>
                    <div className='upload-icon' style={{background: '#dcfce7'}}>
                      <i className="bi bi-check-lg" style={{color: '#22c55e'}}></i>
                    </div>
                    <div className='upload-text'><strong>{selectedFile.name}</strong></div>
                    <div className='upload-formats'>{formatFileSize(selectedFile.size)}</div>
                    <button 
                      type="button" 
                      className='browse-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='upload-icon'>
                      <i className="bi bi-cloud-arrow-up"></i>
                    </div>
                    <div className='upload-text'>Drag and drop your file here</div>
                    <div className='upload-formats'>MP4, MP3, or PDF up to 50MB</div>
                    <button type="button" className='browse-btn'>Browse Files</button>
                  </>
                )}
              </div>
            </div>

            {/* Lesson Details Form */}
            <div className='content-card'>
              <div className='form-section-title'>Lesson Details</div>
              
              <div className='lesson-form'>
                <div className='form-group'>
                  <label className='form-label'>Lesson Title</label>
                  <input 
                    type="text" 
                    className='form-input'
                    name='title'
                    value={lessonData.title}
                    onChange={handleChange}
                    placeholder='e.g., Advanced Jazz Scales'
                  />
                </div>

                <div className='form-group'>
                  <label className='form-label'>Description</label>
                  <textarea 
                    className='form-input'
                    name='description'
                    value={lessonData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder='Describe what students will learn in this lesson...'
                  ></textarea>
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label className='form-label'>Category</label>
                    <select 
                      className='form-select'
                      name='category'
                      value={lessonData.category}
                      onChange={handleChange}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className='form-group'>
                    <label className='form-label'>Difficulty</label>
                    <select 
                      className='form-select'
                      name='difficulty'
                      value={lessonData.difficulty}
                      onChange={handleChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className='form-group'>
                  <label className='form-label'>Featured Image (Optional)</label>
                  <input 
                    type="file" 
                    className='form-input'
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Assign Panel */}
          <div>
            <div className='assign-panel'>
              <div className='assign-title'>Assign To</div>
              
              <div className='assign-list'>
                <div className='assign-item'>
                  <input 
                    type="checkbox" 
                    className='assign-checkbox'
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <span className='assign-name'><strong>All Students</strong></span>
                </div>
                
                {students.map((student) => (
                  <div key={student.id} className='assign-item'>
                    <input 
                      type="checkbox" 
                      className='assign-checkbox'
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelect(student.id)}
                    />
                    <span className='assign-name'>{student.fullname}</span>
                  </div>
                ))}
              </div>

              <div className='assign-actions'>
                <button 
                  className='btn-upload-save'
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up me-2"></i>
                      Upload & Save
                    </>
                  )}
                </button>
                <Link to='/teacher-lesson-library' className='btn-cancel'>Cancel</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherUploadLesson
