import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-4 font-semibold text-white">Yasin Digital Solutions (YDS)</div>
        <div className="text-sm">© {new Date().getFullYear()} YDS. All rights reserved.</div>
      </div>
    </footer>
  );
}
