import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store'; // ✅ Zustand

// Static components
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
  const navigate = useNavigate();

  const { user, initialized } = useAuthStore();

  /* ----------------------------------------------------
     REDIRECT AUTHENTICATED USERS
  ---------------------------------------------------- */
  useEffect(() => {
    // ⏳ Wait until Zustand restores auth from localStorage
    if (!initialized) return;

    if (!user) return; // stay on public home

    const role = user.activeRole;

    let redirectPath = '/student';

    switch (role) {
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
      case 'STUDENT':
      case 'PUBLIC_STUDENT':
      default:
        redirectPath = '/student';
    }

    console.log(`✅ Authenticated as ${role}, redirecting → ${redirectPath}`);
    navigate(redirectPath, { replace: true });

  }, [user, initialized, navigate]);

  /* ----------------------------------------------------
     LOADING STATE (prevents flicker)
  ---------------------------------------------------- */
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Checking session…
      </div>
    );
  }

  /* ----------------------------------------------------
     PUBLIC HOMEPAGE
  ---------------------------------------------------- */
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
