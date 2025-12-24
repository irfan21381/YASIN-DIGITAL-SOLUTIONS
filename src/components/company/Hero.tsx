// src/components/company/Hero.tsx
import React from "react";
import { motion } from "framer-motion";
import Stats from "./Stats";

export default function Hero() {
  return (
    <section
      id="home"
      className="pt-20 pb-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800"
    >
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
            Digital Solutions for Education,{" "}
            <span className="text-blue-600 dark:text-blue-400">AI & Skilled Workforce</span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
            YDS empowers colleges, students and companies with modern technology — AI platforms,
            edtech products, internships, and digital transformation services.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="#about"
              className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Know More
            </a>
            <a
              href="#internships"
              className="px-5 py-3 border rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Explore Internships
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl"
        >
          <p className="text-sm text-slate-500 dark:text-slate-300">Featured</p>
          <h3 className="text-xl font-semibold mt-2 text-slate-900 dark:text-slate-100">YDS EduAI</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            AI-driven learning & RAG assistant for college-specific content — quizzes, coding labs,
            revision.
          </p>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Learn more</button>
            <button className="px-4 py-2 border rounded-md dark:border-slate-700">Request demo</button>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="mt-12">
        <Stats />
      </div>
    </section>
  );
}
