import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const teacherLoginStatus=localStorage.getItem('teacherLoginStatus')
  const studentLoginStatus=localStorage.getItem('studentLoginStatus')
  const adminLoginStatus=localStorage.getItem('adminLoginStatus')
  const schoolLoginStatus=localStorage.getItem('schoolLoginStatus')
  
  const [searchString,setSearchString]=useState({
    'search':'',
  })

  const handleChange=(event)=>{
    setSearchString({
      ...searchString,
      [event.target.name]:event.target.value
    });
  }

  return (
    <>
    <nav class="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
        <Link to="/" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
            <h2 class="m-0 text-primary"><i class="bi bi-music ms-1"></i><Link className='ms-2' to="/">Sonara Music Academy</Link></h2>
        </Link>
        <button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <div class="navbar-nav ms-auto p-4 p-lg-0">
                <Link to="/" class="nav-item nav-link">Home</Link>
                <Link to="/category" class="nav-item nav-link">Category</Link>
                <Link to="/all-courses" class="nav-item nav-link">Courses</Link>
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Teacher</a>
                    <div class="dropdown-menu fade-down m-0">
                    {teacherLoginStatus !='true' && 
                    <>
                      <li><Link className="dropdown-item" to="/teacher-login">Login</Link></li>
                      <li><Link className="dropdown-item" to="/teacher-register">Register</Link></li>
                    </>
                    }
                    {teacherLoginStatus ==='true' && 
                    <>
                      <li><Link className="dropdown-item" to="/teacher-dashboard">Dashboard</Link></li>
                      <li><Link className="dropdown-item" to="/teacher-logout">Logout</Link></li>
                    </>
                    }
                    </div>
                </div>
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle ps-0 px-5" data-bs-toggle="dropdown">Student</a>
                    <div class="dropdown-menu fade-down m-0">
                    {studentLoginStatus !='true' && 
                    <>
                      <li><Link className="dropdown-item" to="/user-login">Login</Link></li>
                      <li><Link className="dropdown-item" to="/user-register">Register</Link></li>
                    </>
                    }
                    {studentLoginStatus === 'true' &&
                    <>
                      <li><Link className="dropdown-item" to="/user-dashboard">Dashboard</Link></li>
                      <li><Link className="dropdown-item " to="/user-logout">Logout</Link></li>
                    </>
                    }
                    </div>
                </div>
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Admin</a>
                    <div class="dropdown-menu fade-down m-0">
                    {adminLoginStatus !=='true' && 
                    <>
                      <li><Link className="dropdown-item" to="/admin-login">Login</Link></li>
                    </>
                    }
                    {adminLoginStatus === 'true' &&
                    <>
                      <li><Link className="dropdown-item" to="/admin-dashboard">Dashboard</Link></li>
                      <li><Link className="dropdown-item" to="/admin-logout">Logout</Link></li>
                    </>
                    }
                    </div>
                </div>
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">School</a>
                    <div class="dropdown-menu fade-down m-0">
                    {schoolLoginStatus !=='true' && 
                    <>
                      <li><Link className="dropdown-item" to="/school-login">Login</Link></li>
                    </>
                    }
                    {schoolLoginStatus === 'true' &&
                    <>
                      <li><Link className="dropdown-item" to="/school-dashboard">Dashboard</Link></li>
                      <li><Link className="dropdown-item" to="/school-logout">Logout</Link></li>
                    </>
                    }
                    </div>
                </div>
            </div>
        </div>
    </nav> 
    </>
  )
}

export default Header