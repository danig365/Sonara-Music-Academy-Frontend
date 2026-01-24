import React from 'react'
import Home from './Home'
import Header from './Header'
import Footer from './Footer'
import CourseDetail from './User/CourseDetail'
import TeacherDetail from './User/TeacherDetail'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import About from './About';
import Login from './User/Login'
import Register from './User/Register'
import EnhancedDashboard from './User/EnhancedDashboard'
import MyCourses from './User/MyCourses'
import ProfileSetting from './User/ProfileSetting'
import ChangePassword from './User/ChangePassword'
import TeacherLogin from './Teacher/TeacherLogin'
import TeacherRegister from './Teacher/TeacherRegister'
import TeacherDashboard from './Teacher/TeacherDashboard'
import TeacherChangePassword from './Teacher/TeacherChangePassword'
import TeacherProfileSetting from './Teacher/TeacherProfileSetting'
import TeacherMyCourses from './Teacher/TeacherMyCourses'
import AddCourse from './Teacher/AddCourses'
import MyUsers from './Teacher/MyUsers'
import AllCourses from './User/AllCourses'
import PopularCourses from '../PopularCourses'
import TeacherLogout from './Teacher/TeacherLogout'
import AddChapter from './Teacher/AddChapter'
import AllChapters from './Teacher/CourseChapters'
import EditChapter from './Teacher/EditChapter'
import EditCourse from './Teacher/EditCourse'
import TeacherSkillCourses from './Teacher/TeacherSkillCourses'
import UserLogout from './User/UserLogout'
import EnrolledStudents from './Teacher/EnrolledStudents'
import Search from './Search'
import StudyMaterial from './Teacher/StudyMaterial'
import AddStudyMaterial from './Teacher/AddStudyMaterial'
import StudyStudentMaterial from './User/StudyStudentMaterial'
import Faq from './Faq'
import Pages from './Pages'

import Policy from './Policy'

// Enhanced Student Dashboard Components
import MyProgress from './User/MyProgress'
import MyAchievements from './User/MyAchievements'
import StudentCoursePlayer from './User/StudentCoursePlayer'

// Enhanced Teacher Dashboard Components
import TeacherOverview from './Teacher/NewDashboard/TeacherOverview'
import TeacherStudents from './Teacher/NewDashboard/TeacherStudents'
import TeacherLessonLibrary from './Teacher/NewDashboard/TeacherLessonLibrary'
import TeacherUploadLesson from './Teacher/NewDashboard/TeacherUploadLesson'
import TeacherProgress from './Teacher/NewDashboard/TeacherProgress'

// Admin Components
import AdminLogin from './Admin/AdminLogin'
import AdminLogout from './Admin/AdminLogout'
import AdminLayout from './Admin/AdminLayout'
import AdminDashboard from './Admin/AdminDashboard'
import UsersManagement from './Admin/UsersManagement'
import ManageSchools from './Admin/ManageSchools'
import ManageTeachers from './Admin/ManageTeachers'
import ManageStudents from './Admin/ManageStudents'
import ManageSubscriptions from './Admin/ManageSubscriptions'
import ActivityLogs from './Admin/ActivityLogs'
import AdminSettings from './Admin/AdminSettings'
import AdminLessonManagement from './Admin/AdminLessonManagement'
import CourseAnalytics from './Admin/CourseAnalytics'

const Main = () => {
  return (
      <BrowserRouter>
        <MainContent />
      </BrowserRouter>
  )
}

const MainContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const studentLoginStatus = localStorage.getItem('studentLoginStatus');
  const teacherLoginStatus = localStorage.getItem('teacherLoginStatus');
  const isStudentDashboardRoute = location.pathname.startsWith('/user-dashboard') || 
                                   location.pathname.startsWith('/my-courses') ||
                                   location.pathname.startsWith('/my-teachers') ||
                                   location.pathname.startsWith('/profile-setting') ||
                                   location.pathname.startsWith('/change-password') ||
                                   location.pathname.startsWith('/my-progress') ||
                                   location.pathname.startsWith('/my-achievements') ||
                                   location.pathname.startsWith('/learn') ||
                                   location.pathname.startsWith('/all-courses');
  const isTeacherDashboardRoute = location.pathname.startsWith('/teacher-dashboard') ||
                                  location.pathname.startsWith('/teacher-overview') ||
                                  location.pathname.startsWith('/teacher-students') ||
                                  location.pathname.startsWith('/teacher-lesson-library') ||
                                  location.pathname.startsWith('/teacher-upload-lesson') ||
                                  location.pathname.startsWith('/teacher-progress') ||
                                  location.pathname.startsWith('/teacher-change-password') ||
                                  location.pathname.startsWith('/teacher-profile-setting') ||
                                  location.pathname.startsWith('/teacher-my-course') ||
                                  location.pathname.startsWith('/add-course') ||
                                  location.pathname.startsWith('/all-questions') ||
                                  location.pathname.startsWith('/add-chapter') ||
                                  location.pathname.startsWith('/add-question') ||
                                  location.pathname.startsWith('/my-users');
  const isCourseDetailRoute = location.pathname.startsWith('/detail/');

  const shouldHideHeader = isAdminRoute || 
                          isCourseDetailRoute ||
                          (isStudentDashboardRoute && studentLoginStatus === 'true') ||
                          (isTeacherDashboardRoute && teacherLoginStatus === 'true');

  return (
    <>
      {!shouldHideHeader && <Header />}
      <Routes>
          <Route path='/user-login' element={<Login />}/>
          <Route path='/' element={<Home />}/>
          <Route path='/detail/:course_id' element={<CourseDetail />}/>
          <Route path='/user-register' element={<Register />}/>
          <Route path='/user-dashboard' element={<EnhancedDashboard />}/>
          <Route path='/my-courses' element={<MyCourses />}/>
          <Route path='/profile-setting' element={<ProfileSetting/>}/>
          <Route path='/change-password' element={<ChangePassword/>}/>
          
          {/* Enhanced Student Dashboard Routes */}
          <Route path='/my-progress' element={<MyProgress />}/>
          <Route path='/my-achievements' element={<MyAchievements />}/>
          <Route path='/learn/:course_id' element={<StudentCoursePlayer />}/>
          <Route path='/learn/:course_id/lesson/:lesson_id' element={<StudentCoursePlayer />}/>
          
          <Route path='/teacher-login' element={<TeacherLogin />}/>
          <Route path='/teacher-logout' element={<TeacherLogout />}/>
          <Route path='/user-logout' element={<UserLogout />}/>
          <Route path='/teacher-register' element={<TeacherRegister />}/>
          <Route path='/teacher-dashboard' element={<TeacherDashboard />}/>
          
          {/* Enhanced Teacher Dashboard Routes */}
          <Route path='/teacher-overview' element={<TeacherOverview />}/>
          <Route path='/teacher-students' element={<TeacherStudents />}/>
          <Route path='/teacher-lesson-library' element={<TeacherLessonLibrary />}/>
          <Route path='/teacher-upload-lesson' element={<TeacherUploadLesson />}/>
          <Route path='/teacher-progress' element={<TeacherProgress />}/>
          
          <Route path='/teacher-change-password' element={<TeacherChangePassword  />}/>
          <Route path='/teacher-profile-setting' element={<TeacherProfileSetting  />}/>
          <Route path='/teacher-my-course' element={<TeacherMyCourses  />}/>
          <Route path='/add-course' element={<AddCourse  />}/>
          <Route path='/add-chapter/:course_id' element={<AddChapter  />}/>
          <Route path='/my-users' element={<MyUsers  />}/>
          <Route path='/teacher-detail/:teacher_id' element={<TeacherDetail  />}/>
          <Route path='/all-chapters/:course_id' element={<AllChapters  />}/>
          <Route path='/study-material/:course_id' element={<StudyMaterial  />}/>
          <Route path='/edit-chapter/:chapter_id' element={<EditChapter  />}/>
          <Route path='/edit-course/:course_id' element={<EditCourse  />}/>
          <Route path='/all-courses' element={<AllCourses  />}/>\
          <Route path='/popular-courses' element={<PopularCourses  />}/>
          <Route path='/teacher-skill-courses/:skill_name/:teacher_id' element={<TeacherSkillCourses />}/>   
          <Route path='/enrolled-students/:course_id' element={<EnrolledStudents  />}/>
          <Route path='/search/:searchstring' element={<Search  />}/>
          <Route path='/add-study/:course_id' element={<AddStudyMaterial  />}/>
          <Route path='/user/study-material/:course_id' element={<StudyStudentMaterial  />}/>
          <Route path='/faq' element={<Faq />}/>
          <Route path='/page/:page_id/:page_slug' element={<Pages />}/>
          <Route path='/aboutus' element={<About />}/>
          <Route path='/policy' element={<Policy />}/>
          
          {/* Admin Routes */}
          <Route path='/admin-login' element={<AdminLogin />}/>
          <Route path='/admin-logout' element={<AdminLogout />}/>
          
          {/* Admin Dashboard with Nested Routes (persistent sidebar) */}
          <Route path='/admin-dashboard' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />}/>
          </Route>
          <Route path='/admin' element={<AdminLayout />}>
            <Route path='users-management' element={<UsersManagement />}/>
            <Route path='schools' element={<ManageSchools />}/>
            <Route path='manage-teachers' element={<ManageTeachers />}/>
            <Route path='manage-students' element={<ManageStudents />}/>
            <Route path='subscriptions' element={<ManageSubscriptions />}/>
            <Route path='activity-logs' element={<ActivityLogs />}/>
            <Route path='settings' element={<AdminSettings />}/>
            <Route path='lesson-management' element={<AdminLessonManagement />}/>
            <Route path='lesson-management/:course_id' element={<AdminLessonManagement />}/>
            <Route path='course-analytics/:course_id' element={<CourseAnalytics />}/>
          </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default Main
