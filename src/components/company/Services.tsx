// src/components/company/Services.tsx
import React from "react";
import useReveal from "@/hooks/useReveal";

const services = [
  { title: "EduAI (YDS EduAI)", desc: "AI-driven learning platform for colleges with teacher-managed content." },
  { title: "Internships & Training", desc: "Industry internships with mentorship and certificates." },
  { title: "Web & App Development", desc: "Custom websites, mobile apps and portals." },
  { title: "Digital Transformation", desc: "Branding, automation and college systems." },
  { title: "Cloud & DevOps", desc: "Managed cloud, CI/CD and scalable deployments." },
  { title: "LMS & Assessments", desc: "Secure testing, proctoring and results management." }
];

export default function Services() {
  return (
    <section id="services" className="py-16 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100">Our Services</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {services.map((s) => {
            const r = useReveal("reveal-visible");
            return (
              <div key={s.title} ref={r as any} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{s.title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
