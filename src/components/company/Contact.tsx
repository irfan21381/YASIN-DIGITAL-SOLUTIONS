import React from "react";
import useReveal from "../../hooks/useReveal";

export default function Contact() {
  const left = useReveal("animate-slide-left");
  const right = useReveal("animate-slide-right");

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-start">
        <div ref={left as any}>
          <h3 className="text-2xl font-bold text-slate-900">Contact Us</h3>
          <p className="mt-3 text-slate-600">Reach out for partnerships, internships, or product demos.</p>

          <div className="mt-6 space-y-2 text-slate-700">
            <div>📍 Hyderabad, India</div>
            <div>📞 +91 98765 43210</div>
            <div>✉️ support@yds.com</div>
          </div>
        </div>

        <form ref={right as any} className="bg-gray-50 p-6 rounded-xl shadow space-y-3">
          <input className="w-full border p-3 rounded" placeholder="Your name" />
          <input className="w-full border p-3 rounded" placeholder="Email" />
          <textarea className="w-full border p-3 rounded h-28" placeholder="Message" />
          <div className="flex justify-end">
            <button type="button" className="px-5 py-2 bg-blue-600 text-white rounded-md">Send Message</button>
          </div>
        </form>
      </div>
    </section>
  );
}
