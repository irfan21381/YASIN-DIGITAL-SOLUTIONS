// src/components/company/Stats.tsx
import React, { useEffect, useState } from "react";
import { api as API } from "@/lib/api";
import { motion } from "framer-motion";

export default function Stats() {
  const [stats, setStats] = useState({ colleges: 0, students: 0, internships: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        if (mounted) {
          // Expect server returns { colleges, students, internships, products }
          setStats({
            colleges: res.data.colleges ?? 0,
            students: res.data.students ?? 0,
            internships: res.data.internships ?? 0,
            products: res.data.products ?? 0,
          });
        }
      } catch (err) {
        // keep zeros on error
        console.error("Stats fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  const items = [
    { label: "College Partners", value: stats.colleges },
    { label: "Students Trained", value: stats.students },
    { label: "Internships", value: stats.internships },
    { label: "Products", value: stats.products },
  ];

  return (
    <section id="stats" className="py-10 bg-transparent">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto mt-3" />
              </div>
            ))
          : items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="p-6 border rounded-xl shadow bg-white dark:bg-slate-800"
              >
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  <CountUp target={item.value} />
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">{item.label}</p>
              </motion.div>
            ))}
      </div>
    </section>
  );
}

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setVal(0);
      return;
    }
    let frame = 0;
    const duration = 700;
    const totalFrames = Math.round(duration / 16);
    const increment = target / totalFrames;
    const id = setInterval(() => {
      frame++;
      setVal((p) => {
        const next = Math.min(Math.round((p + increment) * 10) / 10, target);
        return next;
      });
      if (frame >= totalFrames) {
        clearInterval(id);
        setVal(target);
      }
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return <span>{val}</span>;
}
