import Sidebar from './Sidebar'
import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import ChangePassword from './ChangePassword'
import './ProfileSetting.css'

const baseUrl = 'http://127.0.0.1:8000/api'

const ProfileSetting = () => {
    const studentId = localStorage.getItem('studentId')
    const studentLoginStatus = localStorage.getItem('studentLoginStatus')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const [studentData, setStudentData] = useState({
        'fullname': '',
        'email': '',
        'username': '',
        'interseted_categories': '',
        'profile_img': '',
        'p_img': ''
    });

    useEffect(() => {
        document.title = 'LMS | Settings'
    }, [])

    // Responsive detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth >= 768) {
                setSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Authentication check
    useEffect(() => {
        if (studentLoginStatus !== 'true') {
            window.location.href = '/user-login'
        }
    }, [studentLoginStatus])

    useEffect(() => {
        try {
            axios.get(baseUrl + '/student/' + studentId)
                .then((res) => {
                    setStudentData({
                        fullname: res.data.fullname,
                        email: res.data.email,
                        username: res.data.username,
                        interseted_categories: res.data.interseted_categories,
                        profile_img: res.data.profile_img,
                        p_img: ''
                    })
                })
        } catch (error) {
            console.log(error)
        }
    }, [studentId])

    const handleChange = (event) => {
        setStudentData({
            ...studentData,
            [event.target.name]: event.target.value
        })
    }

    const handleFileChange = (event) => {
        setStudentData({
            ...studentData,
            [event.target.name]: event.target.files[0]
        })
    }

    const submitForm = () => {
        const studentFormData = new FormData()
        studentFormData.append("fullname", studentData.fullname)
        studentFormData.append("email", studentData.email)
        studentFormData.append("username", studentData.username)
        studentFormData.append("interseted_categories", studentData.interseted_categories)
        if (studentData.p_img !== '') {
            studentFormData.append('profile_img', studentData.p_img, studentData.p_img.name)
        }

        try {
            axios.put(baseUrl + '/student/' + studentId + '/', studentFormData, {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }).then((response) => {
                if (response.status == 200) {
                    Swal.fire({
                        title: 'Profile Updated Successfully',
                        icon: 'success',
                        toast: true,
                        timer: 3000,
                        position: 'top-right',
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                }
            })
        } catch (error) {
            console.log(error)
            setStudentData({ 'status': 'error' })
        }
    }

    return (
        <div className="profile-setting-container">
            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
                isMobile={isMobile}
            />

            {/* Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div 
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="profile-setting-content">
                {/* Mobile Header */}
                <div className="mobile-header">
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <div className="logo-mini">EduLearning</div>
                </div>

                <div className="profile-setting-main">
                    {/* Header */}
                    <div className="profile-header">
                        <h2>
                            <i className="bi bi-person-lines-fill"></i>
                            Profile Settings
                        </h2>
                        <p>Manage your personal information and preferences</p>
                    </div>

                    <div className="profile-form-grid">
                        {/* Profile Form */}
                        <div className="profile-card">
                            <h3>
                                <i className="bi bi-person-circle"></i>
                                Personal Information
                            </h3>

                            {/* Profile Image Preview */}
                            <div className="profile-image-section">
                                {studentData.profile_img ? (
                                    <div className="profile-image-wrapper">
                                        <img 
                                            src={studentData.profile_img} 
                                            alt={studentData.fullname}
                                            className="profile-image"
                                        />
                                    </div>
                                ) : (
                                    <div className="profile-image-wrapper">
                                        <div className="profile-image-placeholder">
                                            <i className="bi bi-person"></i>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="form-group">
                                <label>
                                    <i className='bi bi-person'></i>Full Name
                                </label>
                                <input  
                                    name='fullname' 
                                    type="text"  
                                    value={studentData.fullname} 
                                    onChange={handleChange} 
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className='bi bi-envelope'></i>Email
                                </label>
                                <input 
                                    name='email' 
                                    type="email" 
                                    value={studentData.email} 
                                    onChange={handleChange} 
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className='bi bi-at'></i>Username
                                </label>
                                <input 
                                    name='username' 
                                    type="text" 
                                    value={studentData.username} 
                                    onChange={handleChange} 
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className='bi bi-image'></i>Profile Image
                                </label>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    name='p_img'
                                    className="form-control"
                                    accept="image/*"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className='bi bi-bookmark'></i>Interested Categories
                                </label>
                                <textarea 
                                    name='interseted_categories' 
                                    value={studentData.interseted_categories} 
                                    onChange={handleChange} 
                                    className="form-control"
                                    placeholder="Enter your interested categories (comma separated)"
                                />
                            </div>

                            <button 
                                onClick={submitForm} 
                                className="submit-btn"
                            >
                                <i className='bi bi-check-lg'></i>Update Profile
                            </button>
                        </div>

                        {/* Change Password Section */}
                        <div className="profile-card">
                            <ChangePassword />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileSetting
