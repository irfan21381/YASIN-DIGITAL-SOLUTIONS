// src/components/company/Navbar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Products", href: "#products" },
  { name: "Internships", href: "#internships" },
  //{ name: "Achievements", href: "#stats" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-transparent dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {/* Put your logo at public/logo.png or change to /assets/yourlogo.png */}
            <img src="/logo.jpg" alt="YDS Logo" className="h-10 w-auto" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              YDS — Yasin Digital Solutions
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-6">
              {navItems.map((n) => (
                <a
                  key={n.name}
                  href={n.href}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition"
                >
                  {n.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link to="/login">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 mr-2"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              className="p-2 rounded-md bg-slate-100 dark:bg-slate-800"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="md:hidden overflow-hidden border-t border-slate-100 dark:border-slate-800"
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          {navItems.map((n) => (
            <a
              key={n.name}
              href={n.href}
              onClick={() => setOpen(false)}
              className="text-slate-700 dark:text-slate-200 py-2"
            >
              {n.name}
            </a>
          ))}

          <Link to="/login" onClick={() => setOpen(false)}>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">Login</button>
          </Link>
        </div>
      </motion.div>
    </header>
  );
}
