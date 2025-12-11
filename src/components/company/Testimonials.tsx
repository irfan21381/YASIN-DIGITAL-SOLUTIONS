import React from "react";
import useReveal from "../../hooks/useReveal";

const data = [
  { text: "YDS internship helped me get my first job.", name: "Asha R" },
  { text: "EduAI reduced faculty workload and improved learning.", name: "Dr. Rao" },
  { text: "Great mentorship and real projects.", name: "Sateesh" },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900">Success Stories</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {data.map((t, i) => {
            const r = useReveal("animate-zoom");
            return (
              <div key={i} ref={r as any} className="p-6 bg-white rounded-xl shadow">
                <p className="text-slate-700">“{t.text}”</p>
                <div className="mt-4 font-semibold text-blue-600">{t.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
