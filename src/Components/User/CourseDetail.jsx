import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';
import { useEffect } from 'react'
import { useState } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import './CourseDetail.css'
import Sidebar from './Sidebar';

const baseUrl='http://127.0.0.1:8000/api'
const siteUrl='http://127.0.0.1:8000/'

const CourseDetail = () => {
    const navigate = useNavigate();
    let {course_id}=useParams();

    const [courseData, setCourseData]=useState([]);
    const [chapterData, setChapterData]=useState([]);
    const [teacherData, setTeacherData]=useState([]);
    const [teachListData, setTeachListData]=useState([]);
    const [relatedCourseData, setRelatedCourseData]=useState([]);
    const [userLoginStatus,setUserLoginStatus]=useState('')
    const [enrolledStatus,setEnrolledStatus]=useState('')
    const [ratingStatus,setRatingStatus]=useState('')
    const [favoriteStatus,setFavoriteStatus]=useState('')
    const [courseViews,setCourseViews]=useState(0)
    const [avgRating,setAvgRating]=useState(0)
    const [courseProgress, setCourseProgress]=useState(null)
    const [sidebarOpen, setSidebarOpen]=useState(false)
    const [isMobile, setIsMobile]=useState(window.innerWidth < 768)
    const studentId=localStorage.getItem('studentId')
    const studentLoginStatus = localStorage.getItem('studentLoginStatus')

    // Handle window resize for responsive design
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Close sidebar on mobile when navigating
    const handleNavigate = (path) => {
      if(isMobile) {
        setSidebarOpen(false)
      }
      navigate(path)
    }

    // Redirect to login if not logged in
    useEffect(() => {
      if (studentLoginStatus !== 'true') {
        Swal.fire({
          title: 'Login Required',
          text: 'Please login to view course details',
          icon: 'warning',
          confirmButtonColor: '#4285f4'
        }).then(() => {
          navigate('/user-login');
        });
      }
    }, [studentLoginStatus, navigate]);

    useEffect(()=>{
      console.log('Chapter data changed:', chapterData);
    }, [chapterData]);
    
    useEffect(()=>{
      try{
          axios.get(baseUrl+'/course/'+course_id)
          .then((res)=>{
            console.log('Course data:', res.data);
            console.log('Chapter data:', res.data.course_chapters);
            console.log('Featured image path:', res.data.featured_img);
            console.log('Full image URL:', `${siteUrl}media/${res.data.featured_img}`);
            setChapterData(res.data.course_chapters)
            setTeacherData(res.data.teacher)
            setCourseData(res.data)
            setRelatedCourseData(JSON.parse(res.data.related_videos))
            setTeachListData(res.data.teach_list)
            setCourseViews(res.data.course_views || 0)
            if(res.data.course_rating!='' && res.data.course_rating!=null){
              setAvgRating(res.data.course_rating)
            }
          })
          .catch((err) => console.error('Error fetching course:', err));

          axios.get(baseUrl+'/update-view/'+course_id)
          .then((res) => {
            // Update course views if needed
            setCourseViews(res.data.views)
          })
          .catch((err) => console.log('View update error:', err));
      }catch(error){
          console.log(error);
      }
      try{
        axios.get(baseUrl+'/fetch-enroll-status/'+studentId+'/'+course_id)
        .then((res)=>{
          if(res.data.bool==true){
            setEnrolledStatus('success')
            // Fetch course progress to check if already started learning
            axios.get(baseUrl+'/student/course-progress/'+studentId+'/')
            .then((progressRes)=>{
              const courseProgressData = progressRes.data.find(cp => cp.course?.id == course_id || cp.id == course_id);
              if(courseProgressData){
                setCourseProgress(courseProgressData);
              }
            })
            .catch((err) => console.log('Error fetching progress:', err));
          }
        });
      }catch(error){
          console.log(error);
      }

      try{
        axios.get(baseUrl+'/fetch-rating-status/'+studentId+'/'+course_id)
        .then((res)=>{
          if(res.data.bool==true){
            setRatingStatus('success')
          }
        });
      }catch(error){
          console.log(error);
      }

      axios.get(baseUrl+'/fetch-favorite-status/'+studentId+'/'+course_id)
        .then((res)=>{
          if(res.data.bool==true){
            setFavoriteStatus('success')
          }else{
            setFavoriteStatus('');
          }
        })
        .catch((err) => {
          console.log('Favorite status fetch error:', err);
          setFavoriteStatus('');
        });

      // Set user login status based on localStorage
      if(studentLoginStatus === 'true'){
        setUserLoginStatus('success')
      }
      console.log('Login status:', studentLoginStatus, 'User login status set:', studentLoginStatus === 'true' ? 'success' : 'not logged in');
    }, [course_id, studentLoginStatus]);

    const enrollCourse = () => {
        console.log('Enroll button clicked! Student ID:', studentId, 'Course ID:', course_id);
        
        if (!studentId) {
            Swal.fire({
                title: 'Please Login',
                text: 'You need to be logged in to enroll',
                icon: 'warning',
                confirmButtonColor: '#4285f4'
            });
            return;
        }
        
        const _formData = new FormData();
        _formData.append('course', course_id);
        _formData.append('student', studentId);

        axios.post(baseUrl + '/student-enroll-course/', _formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
        .then((res) => {
            if (res.status === 200 || res.status === 201) {
                Swal.fire({
                    title: 'You Successfully Enrolled!',
                    icon: 'success',
                    toast: true,
                    timer: 3000,
                    position: 'top-right',
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setEnrolledStatus('success');
            }
        })
        .catch((error) => {
            console.error('Enrollment error:', error);
            Swal.fire({
                title: 'Enrollment Failed',
                text: error.response?.data?.detail || 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#4285f4'
            });
        });
    }

    const [ratingData,setRatingData]=useState({
      rating:'',
      reviews:''
    });

    const handleChange=(event)=>{
      setRatingData({
          ...ratingData,
          [event.target.name]:event.target.value
      });
    }

    const formSubmit=()=>{
      const _formData=new FormData();
      _formData.append('course',course_id);
      _formData.append('student',studentId);
      _formData.append('rating',ratingData.rating);
      _formData.append('reviews',ratingData.reviews);

      try{
          axios.post(baseUrl+'/course-rating/',_formData,)
          .then((res)=>{
              if(res.status==200 || res.status==201){
                  Swal.fire({
                      title:'Rated Successfully!',
                      icon:'success',
                      toast:true,
                      timer:3000,
                      position:'top-right',
                      timerProgressBar: true,
                      showConfirmButton: false
                  });
              }
          });
      }catch(error){
          console.log(error);
      }
    };

    const markAsFav=()=>{
      const _formData=new FormData();
      _formData.append('course',course_id);
      _formData.append('student',studentId);
      _formData.append('status',true);

      try{
          axios.post(baseUrl+'/student-add-favorte-course/',_formData,{
            headers: {
              'content-type':'multipart/form-data'
          }
          })
          .then((res)=>{
              if(res.status==200 || res.status==201){
                  Swal.fire({
                      title:'This Course Successfully added to your Favorite list',
                      icon:'success',
                      toast:true,
                      timer:3000,
                      position:'top-right',
                      timerProgressBar: true,
                      showConfirmButton: false
                  });
                  setFavoriteStatus('success')
              }
          });
      }catch(error){
          console.log(error);
      }
    };

    const removeFav=(pk)=>{
      const _formData=new FormData();
      _formData.append('course',course_id);
      _formData.append('student',studentId);
      _formData.append('status',false);

      try{
          axios.get(baseUrl+'/student-remove-favorite-course/'+course_id+'/'+studentId,{
            headers: {
              'content-type':'multipart/form-data'
          }
          })
          .then((res)=>{
              if(res.status==200 || res.status==201){
                  Swal.fire({
                      title:'This Course Successfully removed from your Favorite list',
                      icon:'success',
                      toast:true,
                      timer:3000,
                      position:'top-right',
                      timerProgressBar: true,
                      showConfirmButton: false
                  });
                  setFavoriteStatus('')
              }
          });
      }catch(error){
          console.log(error);
      }
    };
    

    useEffect(()=>{
      document.title='LMS | Courses Details'
    })

  // Don't render if not logged in
  if (studentLoginStatus !== 'true') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-container">
        {/* Mobile Header */}
        {isMobile && (
          <div className="course-mobile-header">
            <div className="course-mobile-header-content">
              <button 
                className="course-mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="bi bi-list"></i>
              </button>
              <div className="course-mobile-title">{courseData.title}</div>
            </div>
          </div>
        )}

        {/* Sidebar Overlay */}
        {isMobile && (
          <div 
            className={`course-sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        <div className="course-detail-content">
          <div className="course-detail-main">
        {/* Back Button */}
        <div className="course-back-section">
          <div className="course-back-container">
            <Link 
              to='/my-courses'
              className="course-back-link"
            >
              <i className="bi bi-arrow-left course-back-icon"></i>
              <span>Back to My Courses</span>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="course-hero-section">
          <div className='course-hero-container'>
            <div className='course-hero-row'>
              {/* Course Image */}
              <div className='course-image-col'>
                <div className='course-image-wrapper'>
                  {courseData.featured_img ? (
                    <img 
                      src={courseData.featured_img.startsWith('http') ? courseData.featured_img : `${siteUrl}media/${courseData.featured_img}`} 
                      className="course-featured-image"
                      alt={courseData.title}
                      onError={(e) => {
                        console.error('Image failed to load. URL:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += '<div class="course-image-placeholder"><i class="bi bi-music-note-beamed course-placeholder-icon"></i></div>';
                      }}
                    />
                  ) : (
                    <div className="course-image-placeholder">
                      <i className="bi bi-music-note-beamed course-placeholder-icon"></i>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons - Below Image */}
                <div className="course-action-buttons">
                  {userLoginStatus === 'success' && enrolledStatus !== 'success' &&
                    <button 
                      type='button' 
                      onClick={enrollCourse}
                      className="course-btn course-btn-enroll"
                    >
                      <i className='bi bi-plus-circle'></i> Enroll Now
                    </button>
                  }
                  {enrolledStatus === 'success' && userLoginStatus === 'success' &&
                    <Link 
                      to={`/learn/${course_id}`} 
                      className='course-btn course-btn-learn'
                    >
                      <i className='bi bi-play-fill'></i> {courseProgress && courseProgress.progress_percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Link>
                  }
                  {userLoginStatus !== 'success' && 
                    <Link 
                      to='/user-login' 
                      className='course-btn course-btn-login'
                    >
                      Login to Enroll
                    </Link>
                  }
                </div>
              </div>

              {/* Course Info */}
              <div className='course-info-col'>
                <h1 className="course-title">
                  {courseData.title}
                </h1>
                
                <p className="course-description">
                  {courseData.description}
                </p>

                {/* Course Meta */}
                <div className="course-meta-grid">
                  {/* Instructor */}
                  <div className="course-meta-item">
                    <p className="course-meta-label">
                      <i className='bi bi-person'></i>Instructor
                    </p>
                    <Link 
                      to={`/teacher-detail/${teacherData.id}`}
                      className="course-meta-value"
                      style={{color: '#1a2332', fontSize: '14px', fontWeight: 600, textDecoration: 'none'}}
                    >
                      {teacherData.full_name}
                    </Link>
                  </div>

                  {/* Category */}
                  <div className="course-meta-item category">
                    <p className="course-meta-label">
                      <i className='bi bi-folder'></i>Category
                    </p>
                    <span className="course-meta-value">
                      {courseData.category?.title || 'General'}
                    </span>
                  </div>

                  {/* Technologies */}
                  <div className="course-meta-item tech">
                    <p className="course-meta-label">
                      <i className='bi bi-gear'></i>Technologies
                    </p>
                    <div className="course-tech-badges">
                      {courseData.techs?.split(',').map((tech, idx) => (
                        <span 
                          key={idx}
                          className="course-tech-badge"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="course-stats">
                  {/* Rating */}
                  <div className="course-stat-box course-stat-rating">
                    <div className="course-stat-value">
                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'} / 5
                    </div>
                    <p className="course-stat-label">
                      <i className='bi bi-star-fill'></i>Rating
                    </p>
                  </div>

                  {/* Students */}
                  <div className="course-stat-box course-stat-students">
                    <div className="course-stat-value">
                      {courseData.total_enrolled_students || 0}
                    </div>
                    <p className="course-stat-label">
                      <i className='bi bi-people'></i>Students
                    </p>
                  </div>

                  {/* Views */}
                  <div className="course-stat-box course-stat-views">
                    <div className="course-stat-value">
                      {courseViews}
                    </div>
                    <p className="course-stat-label">
                      <i className='bi bi-eye'></i>Views
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content & Rating */}
        <div className='course-content-section'>
          <div className='course-content-row'>
            {/* Left Column - Course Structure */}
            <div style={{width: '100%'}}>
              {/* Course Modules */}
              {userLoginStatus == 'success' && enrolledStatus=='success' && chapterData.length > 0 && (
                <div className="course-modules-card">
                  <h3 className="course-card-title">
                    <i className='bi bi-collection-play course-card-icon'></i>
                    Course Content
                  </h3>
                  <div className="course-modules-list">
                    {chapterData && chapterData.length > 0 ? (
                      chapterData.map((chapter, index) => {
                        console.log('Rendering chapter:', chapter);
                        return (
                          <div 
                            key={chapter.id}
                            className="course-module-item"
                          >
                            <span className="course-module-number">
                              {index + 1}
                            </span>
                            <div className="course-module-info">
                              <p className="course-module-title">
                                {chapter.title || 'Untitled Chapter'}
                              </p>
                              <p className="course-module-lessons">
                                {(chapter.module_lessons && chapter.module_lessons.length) || chapter.total_lessons || 0} lessons
                              </p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p style={{color: '#9ca3af', textAlign: 'center', padding: '20px'}}>No chapters available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Rating Section */}
              {enrolledStatus=='success' && userLoginStatus=='success' && (
                <div className="course-rating-card">
                  <h3 className="course-card-title">
                    <i className='bi bi-star-fill course-card-icon' style={{color: '#f59e0b'}}></i>
                    Course Rating
                  </h3>

                  {ratingStatus != 'success' ? (
                    <>
                      <button 
                        className='course-rating-btn' 
                        data-bs-toggle="modal" 
                        data-bs-target="#ratingModal"
                      >
                        <i className='bi bi-star'></i>Rate This Course
                      </button>

                      {/* Rating Modal */}
                      <div className="modal fade" id="ratingModal" tabIndex="-1" aria-labelledby="ratingModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                          <div className="course-modal-content modal-content">
                            <div className="course-modal-header modal-header">
                              <h5 className="course-modal-title modal-title" id="ratingModalLabel">
                                Rate "{courseData.title}"
                              </h5>
                              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="course-modal-body modal-body">
                              <div className="course-form-group">
                                <label className="course-form-label">
                                  <i className='bi bi-star-fill text-warning'></i>Rating
                                </label>
                                <select 
                                  onChange={handleChange} 
                                  className='course-form-select form-select' 
                                  name='rating'
                                >
                                  <option value="">Select Rating</option>
                                  <option value="1">⭐ 1 - Poor</option>
                                  <option value="2">⭐⭐ 2 - Fair</option>
                                  <option value="3">⭐⭐⭐ 3 - Good</option>
                                  <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                                </select>
                              </div>
                              <div className="course-form-group">
                                <label className="course-form-label">
                                  <i className='bi bi-chat-dots'></i>Your Review
                                </label>
                                <textarea 
                                  onChange={handleChange} 
                                  name="reviews" 
                                  className="course-form-textarea form-control" 
                                  rows="5"
                                  placeholder="Share your experience with this course..."
                                />
                              </div>
                            </div>
                            <div className="course-modal-footer modal-footer">
                              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                              <button type="button" className="btn btn-primary" onClick={formSubmit}>
                                <i className='bi bi-check-lg'></i>Submit Rating
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="course-rating-success">
                      <i className='bi bi-check-circle'></i>
                      Thank you! You have already rated this course.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Quick Info */}
            <div style={{width: '100%'}}>
              <div className="course-quick-info-card">
                <h5 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a2332',
                  marginBottom: '16px'
                }}>
                  <i className='bi bi-info-circle'></i>Course Info
                </h5>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div className="course-info-item">
                    <p className="course-info-label">
                      Level
                    </p>
                    <span className="course-info-value">
                      {courseData.category?.title || 'All Levels'}
                    </span>
                  </div>

                  <div className="course-info-item">
                    <p className="course-info-label">
                      Students Enrolled
                    </p>
                    <span className="course-info-value">
                      {courseData.total_enrolled_students || 0}
                    </span>
                  </div>

                  <div className="course-info-item">
                    <p className="course-info-label">
                      Course Views
                    </p>
                    <span className="course-info-value">
                      {courseViews}
                    </span>
                  </div>

                  <div className="course-info-item">
                    <p className="course-info-label">
                      Average Rating
                    </p>
                    <div className="course-rating-display">
                      <span className="course-rating-value">
                        {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="course-rating-stars">
                        {'⭐'.repeat(Math.round(avgRating))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourseData.length > 0 && (
          <div className='course-related-section'>
            <h2 className='course-related-title'>
              <i className='bi bi-lightbulb course-related-icon'></i>
              Related Courses
            </h2>
            
            <div className='course-related-grid'>
              {relatedCourseData.slice(0, 4).map((rcourse, index) => (
                <Link 
                  to={`/detail/${rcourse.pk}`}
                  key={index}
                  className="course-related-card"
                >
                  <img 
                    src={`${siteUrl}media/${rcourse.fields.featured_img}`} 
                    className="course-related-image" 
                    alt={rcourse.fields.title}
                  />
                  <div className="course-related-body">
                    <h6 className="course-related-course-title">
                      {rcourse.fields.title}
                    </h6>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
          </div>
        </div>
    </div>
  )
}

export default CourseDetail
