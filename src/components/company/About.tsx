// src/components/company/About.tsx
import React from "react";
import useReveal from "@/hooks/useReveal";

export default function About() {
  const ref = useReveal("reveal-visible");

  return (
    <section id="about" className="py-16 bg-white dark:bg-slate-900">
      <div ref={ref as any} className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Who We Are</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Yasin Digital Solutions (YDS) is an edu-tech & digital solutions company building AI-powered
          platforms, internship programs, software development and digital transformation services for
          colleges and enterprises.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 bg-slate-50 dark:bg-slate-800 border">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Vision</h4>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Make AI-assisted practical learning available to every college and student.
            </p>
          </div>
          <div className="rounded-xl p-6 bg-slate-50 dark:bg-slate-800 border">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">Mission</h4>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Deliver real internships, scalable AI solutions, and industry-ready training.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
