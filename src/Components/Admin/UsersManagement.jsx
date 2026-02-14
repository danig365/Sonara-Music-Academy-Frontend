import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import './UsersManagement.css';

import { API_BASE_URL } from '../../config';

const baseUrl = API_BASE_URL;

// Responsive Table Cell Component
const TableCell = ({ label, children }) => (
    <td data-label={label}>
        {children}
    </td>
);

const UsersManagement = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [schoolsSearchTerm, setSchoolsSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Students State
    const [students, setStudents] = useState([]);
    const [studentsTotalPages, setStudentsTotalPages] = useState(1);

    // Teachers State
    const [teachers, setTeachers] = useState([]);
    const [teachersTotalPages, setTeachersTotalPages] = useState(1);

    // Schools State
    const [schools, setSchools] = useState([]);
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [schoolFormData, setSchoolFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        website: '',
        status: 'trial',
        max_teachers: 10,
        max_students: 100,
        max_courses: 50
    });

    // Manage Members State
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [membersSchool, setMembersSchool] = useState(null);
    const [schoolTeachers, setSchoolTeachers] = useState([]);
    const [schoolStudents, setSchoolStudents] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersMsg, setMembersMsg] = useState('');

    // Students Modal State
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentFormData, setStudentFormData] = useState({
        fullname: '',
        email: '',
        username: '',
        password: '',
        interseted_categories: ''
    });

    // Teachers Modal State
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [teacherFormData, setTeacherFormData] = useState({
        full_name: '',
        email: '',
        mobile_no: '',
        password: '',
        qualification: '',
        skills: ''
    });

    useEffect(() => {
        document.title = 'Users Management | Admin Dashboard';
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm('');
        setSchoolsSearchTerm('');
        if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'teachers') {
            fetchTeachers();
        } else if (activeTab === 'schools') {
            fetchSchools();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'teachers') {
            fetchTeachers();
        } else if (activeTab === 'schools') {
            fetchSchools();
        }
    }, [currentPage, searchTerm, schoolsSearchTerm, activeTab]);

    // Fetch Students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            let url = `${baseUrl}/admin/students/?page=${currentPage}`;
            if (searchTerm) {
                url += `&search=${searchTerm}`;
            }
            const response = await axios.get(url);
            if (response.data.results) {
                setStudents(response.data.results);
                setStudentsTotalPages(Math.ceil(response.data.count / 8));
            } else {
                setStudents(response.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Teachers
    const fetchTeachers = async () => {
        setLoading(true);
        try {
            let url = `${baseUrl}/admin/teachers/?page=${currentPage}`;
            if (searchTerm) {
                url += `&search=${searchTerm}`;
            }
            const response = await axios.get(url);
            if (response.data.results) {
                setTeachers(response.data.results);
                setTeachersTotalPages(Math.ceil(response.data.count / 8));
            } else {
                setTeachers(response.data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Schools
    const fetchSchools = async () => {
        setLoading(true);
        try {
            let url = `${baseUrl}/schools/?page=${currentPage}`;
            if (schoolsSearchTerm) {
                url += `&search=${schoolsSearchTerm}`;
            }
            const response = await axios.get(url);
            // Handle both paginated response (object with results) and non-paginated (array)
            const schoolsData = response.data.results ? response.data.results : response.data;
            setSchools(Array.isArray(schoolsData) ? schoolsData : []);
        } catch (error) {
            console.error('Error fetching schools:', error);
            setSchools([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // Students Modal Functions
    const openStudentModal = () => {
        setEditingStudent(null);
        setStudentFormData({
            fullname: '',
            email: '',
            username: '',
            password: '',
            interseted_categories: ''
        });
        setShowStudentModal(true);
    };

    const closeStudentModal = () => {
        setShowStudentModal(false);
        setEditingStudent(null);
        setStudentFormData({
            fullname: '',
            email: '',
            username: '',
            password: '',
            interseted_categories: ''
        });
    };

    const handleStudentChange = (e) => {
        setStudentFormData({
            ...studentFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('fullname', studentFormData.fullname);
            formData.append('email', studentFormData.email);
            formData.append('username', studentFormData.username);
            formData.append('interseted_categories', studentFormData.interseted_categories);
            if (studentFormData.password) {
                formData.append('password', studentFormData.password);
            }

            if (editingStudent) {
                await axios.put(`${baseUrl}/student/${editingStudent.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${baseUrl}/student/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchStudents();
            closeStudentModal();
        } catch (error) {
            console.error('Error saving student:', error);
            alert('Error saving student: ' + (error.response?.data?.detail || error.response?.data?.fullname?.[0] || error.message));
        }
    };

    // Teachers Modal Functions
    const openTeacherModal = () => {
        setEditingTeacher(null);
        setTeacherFormData({
            full_name: '',
            email: '',
            mobile_no: '',
            password: '',
            qualification: '',
            skills: ''
        });
        setShowTeacherModal(true);
    };

    const closeTeacherModal = () => {
        setShowTeacherModal(false);
        setEditingTeacher(null);
        setTeacherFormData({
            full_name: '',
            email: '',
            mobile_no: '',
            password: '',
            qualification: '',
            skills: ''
        });
    };

    const handleTeacherChange = (e) => {
        setTeacherFormData({
            ...teacherFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('full_name', teacherFormData.full_name);
            formData.append('email', teacherFormData.email);
            formData.append('mobile_no', teacherFormData.mobile_no);
            formData.append('qualification', teacherFormData.qualification);
            formData.append('skills', teacherFormData.skills);
            if (teacherFormData.password) {
                formData.append('password', teacherFormData.password);
            }

            if (editingTeacher) {
                await axios.put(`${baseUrl}/teacher/${editingTeacher.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${baseUrl}/teacher/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchTeachers();
            closeTeacherModal();
        } catch (error) {
            console.error('Error saving teacher:', error);
            alert('Error saving teacher: ' + (error.response?.data?.detail || error.response?.data?.full_name?.[0] || error.message));
        }
    };

    const openSchoolModal = () => {
        setEditingSchool(null);
        setSchoolFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            website: '',
            status: 'trial',
            max_teachers: 10,
            max_students: 100,
            max_courses: 50
        });
        setShowSchoolModal(true);
    }

    // Students Edit
    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setStudentFormData({
            fullname: student.fullname,
            email: student.email,
            username: student.username,
            password: '',
            interseted_categories: student.interseted_categories || ''
        });
        setShowStudentModal(true);
    };

    // Students Delete
    const handleDeleteStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`${baseUrl}/student/${studentId}/`);
                fetchStudents();
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    };

    // Teachers Edit
    const handleEditTeacher = (teacher) => {
        setEditingTeacher(teacher);
        setTeacherFormData({
            full_name: teacher.full_name,
            email: teacher.email,
            mobile_no: teacher.mobile_no || '',
            password: '',
            qualification: teacher.qualification || '',
            skills: teacher.skills || ''
        });
        setShowTeacherModal(true);
    };

    // Teachers Delete
    const handleDeleteTeacher = async (teacherId) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await axios.delete(`${baseUrl}/teacher/${teacherId}/`);
                fetchTeachers();
            } catch (error) {
                console.error('Error deleting teacher:', error);
            }
        }
    };

    // Schools Functions
    const handleSchoolChange = (e) => {
        setSchoolFormData({
            ...schoolFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleSchoolSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', schoolFormData.name);
            formData.append('email', schoolFormData.email);
            formData.append('phone', schoolFormData.phone);
            formData.append('address', schoolFormData.address);
            formData.append('city', schoolFormData.city);
            formData.append('state', schoolFormData.state);
            formData.append('country', schoolFormData.country);
            formData.append('website', schoolFormData.website);
            formData.append('status', schoolFormData.status);
            formData.append('max_teachers', schoolFormData.max_teachers);
            formData.append('max_students', schoolFormData.max_students);
            formData.append('max_courses', schoolFormData.max_courses);

            if (editingSchool) {
                await axios.put(`${baseUrl}/schools/${editingSchool.id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`${baseUrl}/schools/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            fetchSchools();
            closeSchoolModal();
        } catch (error) {
            console.error('Error saving school:', error);
            alert('Error saving school: ' + (error.response?.data?.detail || error.response?.data?.name?.[0] || error.message));
        }
    };

    const handleEditSchool = (school) => {
        setEditingSchool(school);
        setSchoolFormData({
            name: school.name,
            email: school.email,
            phone: school.phone || '',
            address: school.address || '',
            city: school.city || '',
            state: school.state || '',
            country: school.country || 'India',
            website: school.website || '',
            status: school.status,
            max_teachers: school.max_teachers,
            max_students: school.max_students,
            max_courses: school.max_courses
        });
        setShowSchoolModal(true);
    };

    const handleDeleteSchool = async (schoolId) => {
        if (window.confirm('Are you sure you want to delete this school?')) {
            try {
                await axios.delete(`${baseUrl}/schools/${schoolId}/`);
                fetchSchools();
            } catch (error) {
                console.error('Error deleting school:', error);
            }
        }
    };

    const closeSchoolModal = () => {
        setShowSchoolModal(false);
        setEditingSchool(null);
        setSchoolFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            website: '',
            status: 'trial',
            max_teachers: 10,
            max_students: 100,
            max_courses: 50
        });
    };

    // ===== Manage Members Functions =====
    const openMembersModal = async (school) => {
        setMembersSchool(school);
        setShowMembersModal(true);
        setMembersLoading(true);
        setMembersMsg('');
        setSelectedTeacherId('');
        setSelectedStudentId('');
        try {
            const [stRes, ssRes, allTRes, allSRes] = await Promise.all([
                axios.get(`${baseUrl}/schools/${school.id}/teachers/`),
                axios.get(`${baseUrl}/schools/${school.id}/students/`),
                axios.get(`${baseUrl}/teacher/`),
                axios.get(`${baseUrl}/student/`),
            ]);
            setSchoolTeachers(stRes.data);
            setSchoolStudents(ssRes.data);
            setAllTeachers(allTRes.data);
            setAllStudents(allSRes.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setMembersLoading(false);
        }
    };

    const closeMembersModal = () => {
        setShowMembersModal(false);
        setMembersSchool(null);
        setSchoolTeachers([]);
        setSchoolStudents([]);
        fetchSchools();
    };

    const addTeacherToSchool = async () => {
        if (!selectedTeacherId || !membersSchool) return;
        try {
            await axios.post(`${baseUrl}/schools/${membersSchool.id}/teachers/`, {
                school: membersSchool.id,
                teacher: selectedTeacherId,
            });
            setSelectedTeacherId('');
            setMembersMsg('Teacher assigned successfully!');
            const res = await axios.get(`${baseUrl}/schools/${membersSchool.id}/teachers/`);
            setSchoolTeachers(res.data);
            setTimeout(() => setMembersMsg(''), 3000);
        } catch (error) {
            const errData = error.response?.data;
            const errMsg = errData ? (typeof errData === 'object' ? Object.values(errData).flat().join(' ') : String(errData)) : 'Failed to assign teacher';
            setMembersMsg(errMsg);
            setTimeout(() => setMembersMsg(''), 3000);
        }
    };

    const removeTeacherFromSchool = async (recordId) => {
        if (!window.confirm('Remove this teacher from the school?')) return;
        try {
            await axios.delete(`${baseUrl}/school-teachers/${recordId}/`);
            setSchoolTeachers(schoolTeachers.filter(t => t.id !== recordId));
            setMembersMsg('Teacher removed');
            setTimeout(() => setMembersMsg(''), 3000);
        } catch (error) {
            console.error('Error removing teacher:', error);
        }
    };

    const addStudentToSchool = async () => {
        if (!selectedStudentId || !membersSchool) return;
        try {
            await axios.post(`${baseUrl}/schools/${membersSchool.id}/students/`, {
                school: membersSchool.id,
                student: selectedStudentId,
            });
            setSelectedStudentId('');
            setMembersMsg('Student assigned successfully!');
            const res = await axios.get(`${baseUrl}/schools/${membersSchool.id}/students/`);
            setSchoolStudents(res.data);
            setTimeout(() => setMembersMsg(''), 3000);
        } catch (error) {
            const errData = error.response?.data;
            const errMsg = errData ? (typeof errData === 'object' ? Object.values(errData).flat().join(' ') : String(errData)) : 'Failed to assign student';
            setMembersMsg(errMsg);
            setTimeout(() => setMembersMsg(''), 3000);
        }
    };

    const removeStudentFromSchool = async (recordId) => {
        if (!window.confirm('Remove this student from the school?')) return;
        try {
            await axios.delete(`${baseUrl}/school-students/${recordId}/`);
            setSchoolStudents(schoolStudents.filter(s => s.id !== recordId));
            setMembersMsg('Student removed');
            setTimeout(() => setMembersMsg(''), 3000);
        } catch (error) {
            console.error('Error removing student:', error);
        }
    };

    const assignedTeacherIds = schoolTeachers.map(st => st.teacher?.id || st.teacher);
    const assignedStudentIds = schoolStudents.map(ss => ss.student?.id || ss.student);
    const availableTeachers = allTeachers.filter(t => !assignedTeacherIds.includes(t.id));
    const availableStudents = allStudents.filter(s => !assignedStudentIds.includes(s.id));

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-success',
            inactive: 'bg-secondary',
            suspended: 'bg-danger',
            trial: 'bg-warning text-dark'
        };
        return badges[status] || 'bg-secondary';
    };

    if (loading && students.length === 0 && teachers.length === 0 && schools.length === 0) {
        return (
            <div className="admin-loading-wrapper">
                <LoadingSpinner size="lg" text="Loading users..." />
            </div>
        );
    }

        return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 users-header-wrapper">
                <h2 className="users-management-header mb-0">
                    <i className="bi bi-people me-2"></i>
                    Users Management
                </h2>
                <button 
                    className="btn btn-primary users-add-btn"
                    onClick={() => {
                        if (activeTab === 'students') openStudentModal();
                        else if (activeTab === 'teachers') openTeacherModal();
                        else if (activeTab === 'schools') openSchoolModal();
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>Add New
                </button>
            </div>

            {/* Tabs Navigation */}
            <ul className="nav nav-tabs users-nav-tabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                                id="students-tab"
                                onClick={() => setActiveTab('students')}
                                role="tab"
                                aria-controls="students"
                                aria-selected={activeTab === 'students'}
                            >
                                <i className="bi bi-mortarboard me-2"></i>Students
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                                id="teachers-tab"
                                onClick={() => setActiveTab('teachers')}
                                role="tab"
                                aria-controls="teachers"
                                aria-selected={activeTab === 'teachers'}
                            >
                                <i className="bi bi-person-workspace me-2"></i>Teachers
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'schools' ? 'active' : ''}`}
                                id="schools-tab"
                                onClick={() => setActiveTab('schools')}
                                role="tab"
                                aria-controls="schools"
                                aria-selected={activeTab === 'schools'}
                            >
                                <i className="bi bi-building me-2"></i>Schools
                            </button>
                        </li>
                    </ul>

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="tab-pane fade show active">
                            {/* Search */}
                            <div className="card users-search-card">
                                <div className="card-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by name or email..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            <button className="btn btn-primary" type="submit">
                                                <i className="bi bi-search me-1"></i> Search
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="card users-content-card">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Username</th>
                                                    <th>Enrolled</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.length > 0 ? (
                                                    students.map((student, index) => (
                                                        <tr key={student.id}>
                                                            <TableCell label="#">{(currentPage - 1) * 8 + index + 1}</TableCell>
                                                            <TableCell label="Name"><strong>{student.fullname}</strong></TableCell>
                                                            <TableCell label="Email">{student.email}</TableCell>
                                                            <TableCell label="Username">{student.username || 'N/A'}</TableCell>
                                                            <TableCell label="Enrolled">
                                                                <span className="badge bg-primary">
                                                                    {student.enrolled_courses || 0}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell label="Actions">
                                                                <button
                                                                    className="btn btn-sm btn-warning me-2"
                                                                    onClick={() => handleEditStudent(student)}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteStudent(student.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </TableCell>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center text-muted users-empty-state">
                                                            No students found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination */}
                            <nav className="mt-4" aria-label="Page navigation">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({length: studentsTotalPages}, (_, i) => i + 1).map(page => (
                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === studentsTotalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === studentsTotalPages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}

                    {/* Teachers Tab */}
                    {activeTab === 'teachers' && (
                        <div className="tab-pane fade show active">
                            {/* Search */}
                            <div className="card users-search-card">
                                <div className="card-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by name or email..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            <button className="btn btn-primary" type="submit">
                                                <i className="bi bi-search me-1"></i> Search
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Teachers List */}
                            <div className="card users-content-card">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Mobile</th>
                                                    <th>Courses</th>
                                                    <th>Students</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teachers.length > 0 ? (
                                                    teachers.map((teacher, index) => (
                                                        <tr key={teacher.id}>
                                                            <TableCell label="#">{(currentPage - 1) * 8 + index + 1}</TableCell>
                                                            <TableCell label="Name"><strong>{teacher.full_name}</strong></TableCell>
                                                            <TableCell label="Email">{teacher.email}</TableCell>
                                                            <TableCell label="Mobile">{teacher.mobile_no || 'N/A'}</TableCell>
                                                            <TableCell label="Courses">
                                                                <span className="badge bg-primary">
                                                                    {teacher.total_teacher_course || 0}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell label="Students">
                                                                <span className="badge bg-success">
                                                                    {teacher.total_teacher_students || 0}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell label="Actions">
                                                                <button
                                                                    className="btn btn-sm btn-warning me-2"
                                                                    onClick={() => handleEditTeacher(teacher)}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </TableCell>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-muted users-empty-state">
                                                            No teachers found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination */}
                            <nav className="users-pagination" aria-label="Page navigation">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    {Array.from({length: teachersTotalPages}, (_, i) => i + 1).map(page => (
                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === teachersTotalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === teachersTotalPages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}

                    {/* Schools Tab */}
                    {activeTab === 'schools' && (
                        <div className="tab-pane fade show active">
                            {/* Search */}
                            <div className="card users-search-card">
                                <div className="card-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by school name or email..."
                                                value={schoolsSearchTerm}
                                                onChange={(e) => {
                                                    setSchoolsSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            <button className="btn btn-primary" type="submit">
                                                <i className="bi bi-search me-1"></i> Search
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Schools List */}
                            <div className="card users-content-card">
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>#</th>
                                                    <th>School Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>City</th>
                                                    <th>Status</th>
                                                    <th>Subscription</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schools.length > 0 ? (
                                                    schools.map((school, index) => (
                                                        <tr key={school.id}>
                                                            <TableCell label="#">{index + 1}</TableCell>
                                                            <TableCell label="School Name"><strong>{school.name}</strong></TableCell>
                                                            <TableCell label="Email">{school.email}</TableCell>
                                                            <TableCell label="Phone">{school.phone || 'N/A'}</TableCell>
                                                            <TableCell label="City">{school.city || 'N/A'}</TableCell>
                                                            <TableCell label="Status">
                                                                <span className={`badge ${getStatusBadge(school.status)}`}>
                                                                    {school.status.toUpperCase()}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell label="Subscription">
                                                                <span className="badge bg-info">
                                                                    {school.subscription_plan || 'N/A'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell label="Actions">
                                                                <button
                                                                    className="btn btn-sm btn-info me-2"
                                                                    onClick={() => openMembersModal(school)}
                                                                    title="Manage Members"
                                                                >
                                                                    <i className="bi bi-people"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-warning me-2"
                                                                    onClick={() => handleEditSchool(school)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteSchool(school.id)}
                                                                    title="Delete"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </TableCell>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="text-center text-muted py-4">
                                                            No schools found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

            {/* Student Modal */}
            {showStudentModal && (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeStudentModal}
                                ></button>
                            </div>
                            <form onSubmit={handleStudentSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="fullname"
                                            value={studentFormData.fullname}
                                            onChange={handleStudentChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={studentFormData.email}
                                            onChange={handleStudentChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Username *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={studentFormData.username}
                                            onChange={handleStudentChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Interested Categories *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="interseted_categories"
                                            value={studentFormData.interseted_categories}
                                            onChange={handleStudentChange}
                                            placeholder="e.g., Python, Web Development"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password {!editingStudent && '*'}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={studentFormData.password}
                                            onChange={handleStudentChange}
                                            placeholder={editingStudent ? "Leave blank to keep current password" : "Enter password"}
                                            required={!editingStudent}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeStudentModal}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingStudent ? 'Update' : 'Add'} Student
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Modal */}
            {showTeacherModal && (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeTeacherModal}
                                ></button>
                            </div>
                            <form onSubmit={handleTeacherSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="full_name"
                                            value={teacherFormData.full_name}
                                            onChange={handleTeacherChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={teacherFormData.email}
                                            onChange={handleTeacherChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="mobile_no"
                                            value={teacherFormData.mobile_no}
                                            onChange={handleTeacherChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Qualification *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="qualification"
                                            value={teacherFormData.qualification}
                                            onChange={handleTeacherChange}
                                            placeholder="e.g., B.Tech, M.Tech"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Skills *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="skills"
                                            value={teacherFormData.skills}
                                            onChange={handleTeacherChange}
                                            placeholder="e.g., Python, Java, Web Development"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password {!editingTeacher && '*'}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={teacherFormData.password}
                                            onChange={handleTeacherChange}
                                            placeholder={editingTeacher ? "Leave blank to keep current password" : "Enter password"}
                                            required={!editingTeacher}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeTeacherModal}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingTeacher ? 'Update' : 'Add'} Teacher
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* School Modal */}
            {showSchoolModal && (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSchool ? 'Edit School' : 'Add New School'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeSchoolModal}
                                ></button>
                            </div>
                            <form onSubmit={handleSchoolSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">School Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={schoolFormData.name}
                                            onChange={handleSchoolChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={schoolFormData.email}
                                            onChange={handleSchoolChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={schoolFormData.phone}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={schoolFormData.address}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="city"
                                            value={schoolFormData.city}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="state"
                                            value={schoolFormData.state}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Website</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            name="website"
                                            value={schoolFormData.website}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status *</label>
                                        <select
                                            className="form-control"
                                            name="status"
                                            value={schoolFormData.status}
                                            onChange={handleSchoolChange}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="trial">Trial</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Max Teachers</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="max_teachers"
                                                value={schoolFormData.max_teachers}
                                                onChange={handleSchoolChange}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Max Students</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="max_students"
                                                value={schoolFormData.max_students}
                                                onChange={handleSchoolChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Max Courses</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="max_courses"
                                            value={schoolFormData.max_courses}
                                            onChange={handleSchoolChange}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeSchoolModal}
                                    >
                                        Close
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingSchool ? 'Update' : 'Add'} School
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {showMembersModal && membersSchool && (
                <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content" style={{borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
                            {/* Header */}
                            <div className="modal-header py-3 px-4" style={{background: '#1e293b', borderBottom: 'none'}}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.2)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', marginRight: '12px'
                                    }}>
                                        <i className="bi bi-building" style={{color: '#818cf8', fontSize: '18px'}}></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0" style={{color: '#fff', fontWeight: 600, fontSize: '16px'}}>Manage Members</h6>
                                        <small style={{color: '#94a3b8', fontSize: '12px'}}>{membersSchool.name}</small>
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={closeMembersModal} style={{opacity: 0.6}}></button>
                            </div>

                            {/* Body */}
                            <div className="modal-body p-4" style={{background: '#f8fafc', maxHeight: '65vh', overflowY: 'auto'}}>
                                {membersMsg && (
                                    <div className="alert alert-info py-2 px-3 d-flex align-items-center" style={{borderRadius: '8px', fontSize: '13px', border: 'none', background: '#e0f2fe', color: '#0369a1'}}>
                                        <i className="bi bi-info-circle me-2"></i>{membersMsg}
                                    </div>
                                )}
                                {membersLoading ? (
                                    <div className="text-center py-5">
                                        <LoadingSpinner size="sm" text="Loading members..." />
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {/* Teachers Section */}
                                        <div className="col-md-6">
                                            <div style={{background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                                                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{background: '#f1f5f9', borderBottom: '1px solid #e2e8f0'}}>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-person-workspace me-2" style={{color: '#6366f1'}}></i>
                                                        <span style={{fontWeight: 600, fontSize: '14px', color: '#334155'}}>Teachers</span>
                                                    </div>
                                                    <span className="badge" style={{background: '#6366f1', fontSize: '11px', padding: '4px 10px', borderRadius: '20px'}}>{schoolTeachers.length}</span>
                                                </div>
                                                <div className="p-3">
                                                    <div className="d-flex gap-2 mb-3">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={selectedTeacherId}
                                                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                                                            style={{borderRadius: '8px', fontSize: '13px', border: '1px solid #cbd5e1'}}
                                                        >
                                                            <option value="">Select teacher...</option>
                                                            {availableTeachers.map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.full_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            className="btn btn-sm px-3"
                                                            onClick={addTeacherToSchool}
                                                            disabled={!selectedTeacherId}
                                                            style={{borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', whiteSpace: 'nowrap', fontSize: '13px'}}
                                                        >
                                                            <i className="bi bi-plus-lg me-1"></i>Add
                                                        </button>
                                                    </div>
                                                    {availableTeachers.length === 0 && allTeachers.length > 0 && (
                                                        <div className="text-center py-1 mb-2">
                                                            <small style={{color: '#94a3b8', fontSize: '12px'}}>All teachers assigned</small>
                                                        </div>
                                                    )}
                                                    <div style={{maxHeight: '240px', overflowY: 'auto'}}>
                                                        {schoolTeachers.length > 0 ? (
                                                            schoolTeachers.map(st => (
                                                                <div key={st.id} className="d-flex align-items-center justify-content-between p-2 mb-2" style={{background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9'}}>
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={{
                                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            marginRight: '10px', flexShrink: 0
                                                                        }}>
                                                                            <span style={{color: '#fff', fontSize: '12px', fontWeight: 600}}>
                                                                                {(st.teacher?.full_name || 'T').charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div style={{fontSize: '13px', fontWeight: 500, color: '#1e293b', lineHeight: 1.3}}>
                                                                                {st.teacher?.full_name || 'Teacher'}
                                                                            </div>
                                                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>{st.teacher?.email}</div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                                                        onClick={() => removeTeacherFromSchool(st.id)}
                                                                        title="Remove teacher"
                                                                        style={{width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', flexShrink: 0}}
                                                                    >
                                                                        <i className="bi bi-x" style={{fontSize: '16px'}}></i>
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <i className="bi bi-person-plus" style={{fontSize: '24px', color: '#cbd5e1'}}></i>
                                                                <p className="mb-0 mt-1" style={{fontSize: '13px', color: '#94a3b8'}}>No teachers assigned</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Students Section */}
                                        <div className="col-md-6">
                                            <div style={{background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
                                                <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{background: '#f1f5f9', borderBottom: '1px solid #e2e8f0'}}>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-mortarboard me-2" style={{color: '#10b981'}}></i>
                                                        <span style={{fontWeight: 600, fontSize: '14px', color: '#334155'}}>Students</span>
                                                    </div>
                                                    <span className="badge" style={{background: '#10b981', fontSize: '11px', padding: '4px 10px', borderRadius: '20px'}}>{schoolStudents.length}</span>
                                                </div>
                                                <div className="p-3">
                                                    <div className="d-flex gap-2 mb-3">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={selectedStudentId}
                                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                                            style={{borderRadius: '8px', fontSize: '13px', border: '1px solid #cbd5e1'}}
                                                        >
                                                            <option value="">Select student...</option>
                                                            {availableStudents.map(s => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.fullname}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            className="btn btn-sm px-3"
                                                            onClick={addStudentToSchool}
                                                            disabled={!selectedStudentId}
                                                            style={{borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', whiteSpace: 'nowrap', fontSize: '13px'}}
                                                        >
                                                            <i className="bi bi-plus-lg me-1"></i>Add
                                                        </button>
                                                    </div>
                                                    {availableStudents.length === 0 && allStudents.length > 0 && (
                                                        <div className="text-center py-1 mb-2">
                                                            <small style={{color: '#94a3b8', fontSize: '12px'}}>All students assigned</small>
                                                        </div>
                                                    )}
                                                    <div style={{maxHeight: '240px', overflowY: 'auto'}}>
                                                        {schoolStudents.length > 0 ? (
                                                            schoolStudents.map(ss => (
                                                                <div key={ss.id} className="d-flex align-items-center justify-content-between p-2 mb-2" style={{background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9'}}>
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={{
                                                                            width: '32px', height: '32px', borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            marginRight: '10px', flexShrink: 0
                                                                        }}>
                                                                            <span style={{color: '#fff', fontSize: '12px', fontWeight: 600}}>
                                                                                {(ss.student?.fullname || 'S').charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div style={{fontSize: '13px', fontWeight: 500, color: '#1e293b', lineHeight: 1.3}}>
                                                                                {ss.student?.fullname || 'Student'}
                                                                            </div>
                                                                            <div style={{fontSize: '11px', color: '#94a3b8'}}>{ss.student?.email}</div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                                                        onClick={() => removeStudentFromSchool(ss.id)}
                                                                        title="Remove student"
                                                                        style={{width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', flexShrink: 0}}
                                                                    >
                                                                        <i className="bi bi-x" style={{fontSize: '16px'}}></i>
                                                                    </button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <i className="bi bi-person-plus" style={{fontSize: '24px', color: '#cbd5e1'}}></i>
                                                                <p className="mb-0 mt-1" style={{fontSize: '13px', color: '#94a3b8'}}>No students assigned</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer py-2 px-4" style={{background: '#fff', borderTop: '1px solid #e2e8f0'}}>
                                <button
                                    type="button"
                                    className="btn btn-sm px-4"
                                    onClick={closeMembersModal}
                                    style={{borderRadius: '8px', background: '#1e293b', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 500}}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UsersManagement;