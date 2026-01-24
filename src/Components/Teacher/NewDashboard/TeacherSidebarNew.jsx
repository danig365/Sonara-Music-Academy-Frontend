import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './teacherDashboard.css'

const TeacherSidebarNew = () => {
  const location = useLocation()
  
  const menuItems = [
    { path: '/teacher-overview', icon: 'bi-grid-1x2-fill', label: 'Overview' },
    { path: '/teacher-students', icon: 'bi-people-fill', label: 'Students' },
    { path: '/teacher-lesson-library', icon: 'bi-collection-play', label: 'Lesson Library' },
    { path: '/teacher-upload-lesson', icon: 'bi-cloud-arrow-up', label: 'Upload Lesson' },
    { path: '/teacher-progress', icon: 'bi-graph-up-arrow', label: 'Progress' },
  ]
  
  const settingsItems = [
    { path: '/teacher-profile-setting', icon: 'bi-gear', label: 'Settings' },
    { path: '/teacher-logout', icon: 'bi-box-arrow-right', label: 'Logout', danger: true },
  ]

  return (
    <div className='teacher-sidebar-new'>
      <div className='sidebar-header'>
        <div className='logo-container'>
          <i className="bi bi-music-note-beamed logo-icon"></i>
          <span className='logo-text'>EduLearning</span>
        </div>
      </div>
      
      <nav className='sidebar-nav'>
        <div className='nav-section'>
          <span className='nav-section-title'>MAIN MENU</span>
          <ul className='nav-list'>
            {menuItems.map((item, index) => (
              <li key={index} className='nav-item'>
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon} nav-icon`}></i>
                  <span className='nav-label'>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className='nav-section mt-auto'>
          <span className='nav-section-title'>SETTINGS</span>
          <ul className='nav-list'>
            {settingsItems.map((item, index) => (
              <li key={index} className='nav-item'>
                <Link 
                  to={item.path} 
                  className={`nav-link ${item.danger ? 'text-danger' : ''} ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <i className={`bi ${item.icon} nav-icon`}></i>
                  <span className='nav-label'>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Teacher Profile Card at Bottom */}
      <div className='sidebar-profile'>
        <div className='profile-avatar'>
          <i className="bi bi-person-circle"></i>
        </div>
        <div className='profile-info'>
          <span className='profile-name'>Teacher</span>
          <span className='profile-role'>Instructor</span>
        </div>
      </div>
    </div>
  )
}

export default TeacherSidebarNew
