import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import all static components
import Navbar from "../components/company/Navbar";
import Hero from "../components/company/Hero";
import About from "../components/company/About";
import Services from "../components/company/Services";
import Products from "../components/company/Products";
import Internships from "../components/company/Internships";
import Partners from "../components/company/Partners";
import Stats from "../components/company/Stats";
import Testimonials from "../components/company/Testimonials";
import Contact from "../components/company/Contact";
import Footer from "../components/company/Footer";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------
  // LOGIC TO REDIRECT AUTHENTICATED USERS TO DASHBOARD
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Wait until the global authentication check is complete
    if (isLoading) return; 

    // 2. If the user IS authenticated, redirect them based on role
    if (isAuthenticated && user) {
      let redirectPath = '/';

      // Determine the correct dashboard based on the user's role
      switch (user.role) {
        case 'STUDENT':
        case 'PUBLIC_STUDENT':
          redirectPath = '/student';
          break;
        case 'SUPER_ADMIN':
          redirectPath = '/admin/dashboard';
          break;
        case 'MANAGER':
          redirectPath = '/manager/dashboard';
          break;
        case 'TEACHER':
          redirectPath = '/teacher/dashboard';
          break;
        case 'EMPLOYEE':
          redirectPath = '/employee/dashboard';
          break;
        default:
          redirectPath = '/student'; // Default fallback
      }
      
      // Execute the redirect and prevent showing the marketing page
      console.log(`User authenticated as ${user.role}. Redirecting to ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    }
    
    // 3. If the user is NOT authenticated, the effect completes, 
    // and they stay on this public homepage.
  }, [isAuthenticated, user, isLoading, navigate]);

  // If loading, show a spinner to prevent content flicker before redirect
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-xl">Checking session...</div>;
  }
  
  // If not authenticated (or after checking), render the public homepage content
  return (
    <div className="pt-20">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Products />
      <Internships />
      <Partners />
      <Stats />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}