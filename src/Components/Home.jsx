import React from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import Stars from './Stars'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import './Header.css'
import wave from './darkside.mp4'
import './main.css'
import ab from './about.jpg'
import './search.css'

import { API_BASE_URL } from '../config';

const baseUrl = API_BASE_URL;

const Home = () => {
  useEffect(()=>{
    document.title='Sonara Music Academy - Learn Music from Top Instructors'
  })

  const icon={
    'font-size':'20px'
  } 

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [courseData, setCourseData]=useState([]);
  const [popularcourseData,setPopularcourseData]=useState([]);
  const [popularteacherData,setPopularteacherData]=useState([]);
  const [testData,setTestData]=useState([]);

  useEffect(()=>{
    try{
        axios.get(baseUrl+'/course/?result=3')
        .then((res)=>{
            setCourseData(res.data.results)
        });
    }catch(error){
        console.log(error)
    }

    try{
      axios.get(baseUrl+'/popular-teachers/?popular=1')
      .then((res)=>{
        setPopularteacherData(res.data)
      });
  }catch(error){
      console.log(error)
  }

  try{
    axios.get(baseUrl+'/popular-courses/?popular=1')
    .then((res)=>{
      setPopularcourseData(res.data.results)
    });
}catch(error){
    console.log(error)
}

try{
  axios.get(baseUrl+'/student-test/')
  .then((res)=>{
    setTestData(res.data.results)
  });
}catch(error){
  console.log(error)
}
    
  },[]);

  const teacherLoginStatus=localStorage.getItem('teacherLoginStatus')
  const studentLoginStatus=localStorage.getItem('studentLoginStatus')
  
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
      {/* Start Background video player*/}
    <section class="showcase">
    <video src={wave} autoPlay muted loop />
    <div class="overlay"></div>
    <div class="text">
      <h1 className='head'>Never stop learning.<br/> Never stop growing.</h1> 
      <h1 className='headss'>Welcome to Sonara Music Academy</h1>
      <p className='para'>Learn music from world-class instructors.<br/>Master various instruments and music theory.</p>
    </div>
    </section>
      {/*  End Background video player*/}
      {/*  Start Features of Sonara Music Academy*/}
    <div class="container-xxl py-5" className='space'>
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="service-item text-center pt-3">
                        <div class="p-4">
                            <i class="fa fa-3x fa-graduation-cap text-primary mb-4"></i>
                            <h5 class="mb-3">Expert Musicians</h5>
                            <p>Learn from accomplished musicians with years of professional experience. Our instructors bring passion for music and proven teaching methodologies to every lesson.</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
                    <div class="service-item text-center pt-3">
                        <div class="p-4">
                            <i class="fa fa-3x fa-globe text-primary mb-4"></i>
                            <h5 class="mb-3">Music Courses</h5>
                            <p>Access comprehensive music courses from anywhere, anytime. Learn instruments from guitar and piano to drums and voice, designed for beginners to advanced musicians.</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
                    <div class="service-item text-center pt-3">
                        <div class="p-4">
                            <i class="fa fa-3x fa-home text-primary mb-4"></i>
                            <h5 class="mb-3">Practice Sessions</h5>
                            <p>Strengthen your musical skills with structured practice assignments and daily exercises. Regular practice with guidance helps you progress faster and build muscle memory.</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
                    <div class="service-item text-center pt-3">
                        <div class="p-4">
                            <i class="fa fa-3x fa-book-open text-primary mb-4"></i>
                            <h5 class="mb-3">Learning Resources</h5>
                            <p>Access sheet music, chord charts, practice guides, and audio references. All resources are curated to support your musical development and available for download.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
      {/* End Features of Sonara Music Academy*/}
      {/*  About Us card */}
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-5">
                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s" >
                    <div class="position-relative h-100">
                        <img class="img-fluid position-absolute w-100 h-100" src={ab}/>
                    </div>
                </div>
                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
                    <h6 class="section-title bg-white text-start text-primary pe-3">About Us</h6>
                    <h1 class="mb-4">Welcome to Sonara Music Academy</h1>
                    <p class="mb-4">Sonara Music Academy is a premier online music learning platform connecting aspiring musicians with world-class instructors. We believe music students learn best through hands-on practice, personalized feedback, and consistent guidance. Our platform facilitates this through interactive lessons, live sessions, and dedicated instructor support.</p>
                    <p class="mb-4">We are committed to nurturing musical talent and helping every student achieve their musical goals. Whether you're learning your first chord or refining your skills, our experienced instructors provide quality instruction tailored to your pace and learning style.</p>
                    <div class="row gy-2 gx-4 mb-4"> 
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>Expert Musicians</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>Interactive Lessons</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>One-on-One Guidance</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>Sheet Music & Notes</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>Daily Practice Exercises</p>
                        </div>
                        <div class="col-sm-6">
                            <p class="mb-0"><i class="fa fa-arrow-right text-primary me-2"></i>Learn at Your Pace</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Home