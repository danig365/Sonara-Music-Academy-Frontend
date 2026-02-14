import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import LoadingSpinner from '../LoadingSpinner'

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>Lesson Library</h1>
          <p style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: '0',
            fontWeight: 400
          }}>Manage and organize your educational content.</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            background: '#f5f7fa',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px'
          }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'grid' ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'grid' ? '#667eea' : '#6b7280',
                fontWeight: viewMode === 'grid' ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <i className="bi bi-grid-3x3-gap"></i> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? '#fff' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: viewMode === 'list' ? '#667eea' : '#6b7280',
                fontWeight: viewMode === 'list' ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <i className="bi bi-list"></i> List
            </button>
          </div>
          <Link to='/teacher-course-management' style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
          >
            <i className="bi bi-cloud-arrow-up"></i>
            Manage Courses
          </Link>
        </div>
      </div>

        {/* Search & Filter */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            minWidth: '200px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <i className="bi bi-search" style={{
              position: 'absolute',
              left: '12px',
              color: '#94a3b8',
              fontSize: '14px'
            }}></i>
            <input 
              type="text" 
              placeholder='Search lessons...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 400,
                color: '#1a1a1a',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#1a1a1a',
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: '140px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
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
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 400,
              color: '#1a1a1a',
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: '140px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Lessons Grid */}
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginTop: '24px'
          }}>
            {filteredLessons.map((lesson, index) => (
              <div key={lesson.id || index} style={{
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.transform = 'translateY(-8px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{
                  position: 'relative',
                  height: '200px',
                  overflow: 'hidden',
                  background: '#f5f7fa'
                }}>
                  <img 
                    src={lesson.featured_img || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400'} 
                    alt={lesson.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 12px',
                    background: '#fff',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#4b5563'
                  }}>{lesson.category_name || 'Music'}</span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: lesson.difficulty === 'advanced' ? '#f3e8ff' : lesson.difficulty === 'intermediate' ? '#dbeafe' : '#dcfce7',
                    color: lesson.difficulty === 'advanced' ? '#7c3aed' : lesson.difficulty === 'intermediate' ? '#2563eb' : '#16a34a'
                  }}>
                    {lesson.difficulty ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1) : 'Beginner'}
                  </span>
                </div>
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1a1a1a',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4
                  }}>{lesson.title}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#4b5563',
                    lineHeight: 1.5,
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{lesson.description}</p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid #f5f7fa',
                    marginTop: 'auto'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '16px'
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#4b5563',
                        fontWeight: 500
                      }}>
                        <i className="bi bi-collection"></i>
                        {lesson.module_count || 0} Modules
                      </span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#4b5563',
                        fontWeight: 500
                      }}>
                        <i className="bi bi-clock"></i>
                        {lesson.duration_formatted || '0h 0m'}
                      </span>
                    </div>
                    <Link to={`/all-chapters/${lesson.id}`} style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#f5f7fa',
                      border: 'none',
                      color: '#4b5563',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      textDecoration: 'none',
                      fontSize: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f5f7fa';
                      e.currentTarget.style.color = '#4b5563';
                    }}
                    >
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Lesson</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Category</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Difficulty</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Duration</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Modules</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    background: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson, index) => (
                  <tr key={lesson.id || index} style={{
                    borderBottom: '1px solid #f5f7fa',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  >
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <img 
                          src={lesson.featured_img || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400'} 
                          alt={lesson.title}
                          style={{
                            width: '60px',
                            height: '40px',
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <strong style={{
                            color: '#1a1a1a',
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'block',
                            marginBottom: '4px'
                          }}>{lesson.title}</strong>
                          <p style={{
                            color: '#6b7280',
                            fontSize: '12px',
                            margin: '0',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: '#f0f4f8',
                        color: '#4b5563',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>{lesson.category_name}</span>
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: lesson.difficulty === 'advanced' ? '#f3e8ff' : lesson.difficulty === 'intermediate' ? '#dbeafe' : '#dcfce7',
                        color: lesson.difficulty === 'advanced' ? '#7c3aed' : lesson.difficulty === 'intermediate' ? '#2563eb' : '#16a34a'
                      }}>
                        {lesson.difficulty ? lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1) : 'Beginner'}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569',
                      fontWeight: 500
                    }}>{lesson.duration_formatted || '0h 0m'}</td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569',
                      fontWeight: 500
                    }}>{lesson.module_count || 0}</td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#475569',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <Link to={`/all-chapters/${lesson.id}`} style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#667eea',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link to={`/edit-course/${lesson.id}`} style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#4b5563',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f5f7fa';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }}
                      >
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
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '60px 40px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <i className="bi bi-collection-play" style={{
              fontSize: '64px',
              color: '#d1d5db',
              display: 'block',
              marginBottom: '16px'
            }}></i>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: '0 0 24px 0'
            }}>No lessons found matching your criteria.</p>
            <Link to='/teacher-course-management' style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateY(0)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            >
              <i className="bi bi-plus-lg"></i>
              Create Your First Course
            </Link>
          </div>
        )}
      </>
    )
  }

export default TeacherLessonLibrary
