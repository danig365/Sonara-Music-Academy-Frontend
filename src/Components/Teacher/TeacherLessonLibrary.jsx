import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import LoadingSpinner from '../LoadingSpinner'
import './teacherDashboard.css'

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

const TeacherLessonLibrary = () => {
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [categories, setCategories] = useState([])
  
  const teacherId = localStorage.getItem('teacherId')

  useEffect(() => {
    document.title = 'LMS | Lesson Library'
    window.scrollTo(0, 0)
    fetchLessons()
    fetchCategories()
  }, [])

  const fetchLessons = async () => {
    try {
      // Try to fetch from Lesson model first
      const response = await axios.get(`${baseUrl}/teacher/lessons/${teacherId}/`)
      if (response.data && response.data.length > 0) {
        setLessons(response.data)
      } else {
        // Fall back to courses
        const coursesResponse = await axios.get(`${baseUrl}/teacher-course/${teacherId}`)
        const transformedLessons = coursesResponse.data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          featured_img: course.featured_img,
          category_name: course.category?.title || 'Music',
          difficulty: getDifficultyFromRating(course.course_rating),
          duration_formatted: calculateDuration(course.course_chapters),
          module_count: course.course_chapters?.length || 0
        }))
        setLessons(transformedLessons)
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLessons(getSampleLessons())
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${baseUrl}/category/`)
      setCategories(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getDifficultyFromRating = (rating) => {
    if (!rating) return 'beginner'
    if (rating >= 4) return 'advanced'
    if (rating >= 2.5) return 'intermediate'
    return 'beginner'
  }

  const calculateDuration = (chapters) => {
    if (!chapters || chapters.length === 0) return '0h 0m'
    // Estimate 15 minutes per chapter
    const totalMinutes = chapters.length * 15
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const getSampleLessons = () => [
    {
      id: 1,
      title: 'Complete Piano Masterclass',
      description: 'From zero to hero. Learn everything you need to know about playing the piano with professional techniques and exercises.',
      featured_img: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
      category_name: 'Music',
      difficulty: 'beginner',
      duration_formatted: '12h 30m',
      module_count: 2
    },
    {
      id: 2,
      title: 'Music Theory Fundamentals',
      description: 'Unlock the language of music. Understand scales, chords, and harmony that form the foundation of all music.',
      featured_img: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400',
      category_name: 'Theory',
      difficulty: 'intermediate',
      duration_formatted: '8h 45m',
      module_count: 1
    },
    {
      id: 3,
      title: 'Jazz Improvisation 101',
      description: 'Learn the art of improvisation. Explore jazz standards, swing feel, and develop your unique musical voice.',
      featured_img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400',
      category_name: 'Jazz',
      difficulty: 'advanced',
      duration_formatted: '15h 20m',
      module_count: 2
    },
    {
      id: 4,
      title: 'Guitar Basics for Beginners',
      description: 'Start your guitar journey with proper techniques, chord progressions, and popular songs to practice.',
      featured_img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
      category_name: 'Music',
      difficulty: 'beginner',
      duration_formatted: '10h 0m',
      module_count: 3
    },
    {
      id: 5,
      title: 'Vocal Training Essentials',
      description: 'Develop your singing voice with breathing exercises, pitch control, and performance techniques.',
      featured_img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
      category_name: 'Voice',
      difficulty: 'intermediate',
      duration_formatted: '6h 15m',
      module_count: 2
    },
    {
      id: 6,
      title: 'Advanced Music Composition',
      description: 'Create your own music with professional composition techniques, arrangement, and orchestration skills.',
      featured_img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      category_name: 'Theory',
      difficulty: 'advanced',
      duration_formatted: '20h 0m',
      module_count: 4
    }
  ]

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || lesson.category_name === filterCategory
    const matchesDifficulty = !filterDifficulty || lesson.difficulty === filterDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading lessons..." />
  }

  return (
    <>
      {/* Header */}
      <div className='dashboard-header'>
          <div className='header-title'>
            <h1>Lesson Library</h1>
            <p className='header-subtitle'>Manage and organize your educational content.</p>
          </div>
          <div className='header-actions'>
            <div className='view-toggle'>
              <button 
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="bi bi-grid-3x3-gap"></i> Grid
              </button>
              <button 
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list"></i> List
              </button>
            </div>
            <Link to='/teacher-course-management' className='btn-primary-custom'>
              <i className="bi bi-cloud-arrow-up"></i>
              Manage Courses
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className='content-card mb-4'>
          <div className='search-filter-bar'>
            <div className='search-input-wrapper'>
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                className='search-input' 
                placeholder='Search lessons...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className='form-select' 
              style={{width: 'auto'}}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.title}>{cat.title}</option>
              ))}
              <option value="Music">Music</option>
              <option value="Theory">Theory</option>
              <option value="Jazz">Jazz</option>
              <option value="Voice">Voice</option>
            </select>
            <select 
              className='form-select' 
              style={{width: 'auto'}}
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Lessons Grid */}
        {viewMode === 'grid' ? (
          <div className='lessons-grid'>
            {filteredLessons.map((lesson, index) => (
              <div key={lesson.id || index} className='lesson-card'>
                <div className='lesson-image-container'>
                  <img 
                    src={lesson.featured_img || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400'} 
                    alt={lesson.title}
                    className='lesson-image'
                  />
                  <span className='lesson-category-badge'>{lesson.category_name || 'Music'}</span>
                  <span className={`lesson-difficulty-badge ${lesson.difficulty}`}>
                    {lesson.difficulty ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1) : 'Beginner'}
                  </span>
                </div>
                <div className='lesson-content'>
                  <h3 className='lesson-title'>{lesson.title}</h3>
                  <p className='lesson-description'>{lesson.description}</p>
                  <div className='lesson-meta'>
                    <div className='lesson-stats'>
                      <span className='lesson-stat'>
                        <i className="bi bi-collection"></i>
                        {lesson.module_count || 0} Modules
                      </span>
                      <span className='lesson-stat'>
                        <i className="bi bi-clock"></i>
                        {lesson.duration_formatted || '0h 0m'}
                      </span>
                    </div>
                    <Link to={`/all-chapters/${lesson.id}`} className='lesson-arrow'>
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className='content-card'>
            <table className='students-table'>
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Modules</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson, index) => (
                  <tr key={lesson.id || index}>
                    <td>
                      <div className='d-flex align-items-center gap-3'>
                        <img 
                          src={lesson.featured_img || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400'} 
                          alt={lesson.title}
                          style={{width: 60, height: 40, borderRadius: 8, objectFit: 'cover'}}
                        />
                        <div>
                          <strong>{lesson.title}</strong>
                          <p className='text-muted small mb-0' style={{maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td><span className='badge bg-secondary'>{lesson.category_name}</span></td>
                    <td>
                      <span className={`level-badge ${lesson.difficulty}`}>
                        {lesson.difficulty ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1) : 'Beginner'}
                      </span>
                    </td>
                    <td>{lesson.duration_formatted || '0h 0m'}</td>
                    <td>{lesson.module_count || 0}</td>
                    <td>
                      <Link to={`/all-chapters/${lesson.id}`} className='btn btn-sm btn-outline-primary me-2'>
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link to={`/edit-course/${lesson.id}`} className='btn btn-sm btn-outline-secondary'>
                        <i className="bi bi-pencil"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLessons.length === 0 && (
          <div className='content-card text-center py-5'>
            <i className="bi bi-collection-play display-4 text-muted"></i>
            <p className='text-muted mt-3'>No lessons found matching your criteria.</p>
            <Link to='/teacher-course-management' className='btn-primary-custom mt-3'>
              <i className="bi bi-plus-lg"></i>
              Create Your First Course
            </Link>
          </div>
        )}
      </>
    )
  }

export default TeacherLessonLibrary
