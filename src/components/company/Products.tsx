import React from "react";
import useReveal from "../../hooks/useReveal";

const products = [
  { name: "YDS EduAI", desc: "AI + RAG assistant tailored for college content." },
  { name: "LMS Pro", desc: "Course management and assessments." },
  { name: "InternPortal", desc: "Internship management & apply flow." },
];

export default function Products() {
  return (
    <section id="products" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Products</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {products.map((p, i) => {
            const r = useReveal("animate-fade");
            return (
              <div key={p.name} ref={r as any} className="p-6 border rounded-xl shadow-sm hover:shadow-md">
                <h3 className="text-xl font-semibold text-blue-600">{p.name}</h3>
                <p className="mt-2 text-slate-600">{p.desc}</p>
                <div className="mt-4">
                  <a href="#contact" className="text-blue-600 hover:underline">Learn more →</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
