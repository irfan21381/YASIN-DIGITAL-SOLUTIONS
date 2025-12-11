// src/components/student/Internships.tsx
import React, { useEffect, useState } from "react";
import { api as API } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Opening = {
  _id: string;
  title: string;
  description?: string;
  duration?: string;
  stipend?: string;
  mode?: string;
};

export default function Internships() {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    nationality: "Indian",
    email: "",
    whatsapp: "",
    domain: "",
    collegeName: "",
    passingYear: "",
  });

  const domains = ["Web Development","AI/ML","Cloud","Full Stack","Data Science","Cybersecurity","Mobile App","DevOps","UI/UX","Embedded","Other"];

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/internships");
        setOpenings(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load internships");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openApply = (id: string, opening: Opening) => {
    setApplyingFor(id);
    setForm((f) => ({ ...f, email: "" , name: "" }));
  };

  const submitApply = async () => {
    if (!applyingFor) return;
    try {
      await API.post(`/internships/${applyingFor}/apply`, form);
      toast.success("Application submitted");
      setApplyingFor(null);
      // optionally refresh applications or openings
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Apply failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Internships</h2>

      {loading ? <div>Loading...</div> :
        <div className="grid md:grid-cols-2 gap-4">
          {openings.map((o) => (
            <div key={o._id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
              <h3 className="font-semibold">{o.title}</h3>
              <p className="text-sm text-gray-500">{o.description}</p>
              <div className="mt-3 flex items-center gap-3">
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => openApply(o._id, o)}>Apply</button>
                <span className="text-sm text-gray-500">Duration: {o.duration || "N/A"}</span>
                <span className="text-sm text-gray-500">Mode: {o.mode || "Online"}</span>
              </div>
            </div>
          ))}
        </div>
      }

      {/* Apply Drawer / Modal simple */}
      {applyingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Apply for Internship</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <input placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="p-3 rounded border" />
              <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="p-3 rounded border" />
              <input placeholder="WhatsApp" value={form.whatsapp} onChange={(e)=>setForm({...form, whatsapp: e.target.value})} className="p-3 rounded border" />
              <select value={form.domain} onChange={(e)=>setForm({...form, domain: e.target.value})} className="p-3 rounded border">
                <option value="">Select domain</option>
                {domains.map(d=> <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="College & City" value={form.collegeName} onChange={(e)=>setForm({...form, collegeName: e.target.value})} className="p-3 rounded border" />
              <input placeholder="Passing Year" value={form.passingYear} onChange={(e)=>setForm({...form, passingYear: e.target.value})} className="p-3 rounded border" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={()=>setApplyingFor(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={submitApply} className="px-4 py-2 rounded bg-blue-600 text-white">Submit</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
