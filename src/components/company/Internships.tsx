import React from "react";
import useReveal from "../../hooks/useReveal";

const internships = [
  { role: "Web Development Internship", duration: "3 months", mode: "Remote" },
  { role: "AI / ML Internship", duration: "4 months", mode: "Remote/Onsite" },
  { role: "Cybersecurity Internship", duration: "2 months", mode: "Remote" },
  { role: "Cloud Internship", duration: "3 months", mode: "Remote" },
  { role: "Full Stack Internship", duration: "3 months", mode: "Remote" },
];

export default function Internships() {
  return (
    <section id="internships" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900">Active Internships</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {internships.map((it, idx) => {
            const r = useReveal("animate-zoom");
            return (
              <div key={idx} ref={r as any} className="p-6 bg-white rounded-xl shadow hover:shadow-lg">
                <h3 className="text-lg font-bold">{it.role}</h3>
                <p className="text-slate-600 mt-1">Duration: {it.duration}</p>
                <p className="text-slate-600">Mode: {it.mode}</p>
                <div className="mt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
