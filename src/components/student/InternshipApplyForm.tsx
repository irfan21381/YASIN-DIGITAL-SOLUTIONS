import React, { useState } from "react";
import { api as API } from "@/lib/api";
import { toast } from "sonner";

const domains = [
  "App Development", "AI/ML", "Full Stack", "Frontend", "Backend",
  "Cloud Computing", "DevOps", "Cybersecurity", "Data Science",
  "Blockchain", "Digital Marketing", "Business Analytics", "C/C++",
  "Java", "Python", "Embedded Systems", "IoT", "Computer Networks",
  "UI/UX", "QA/Test Automation", "Big Data", "Robotics", "Game Development",
  "Database Admin", "Other"
];

export default function InternshipApplyForm({ onApplied }: { onApplied?: () => void }) {
  const [form, setForm] = useState<any>({ name: "", nationality: "Indian", email: "", whatsapp: "", domain: domains[0], college: "", city: "", passingYear: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/student/internships/apply", form);
      toast.success("Applied successfully!");
      if (onApplied) onApplied();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow space-y-4">
      <h3 className="text-lg font-semibold">Apply for Internship</h3>
      <input required value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="Full name" className="w-full p-3 border rounded" />
      <select value={form.nationality} onChange={e => handleChange("nationality", e.target.value)} className="w-full p-3 border rounded">
        <option>Indian</option>
        <option>Other</option>
      </select>
      <input required value={form.email} onChange={e => handleChange("email", e.target.value)} type="email" placeholder="Email" className="w-full p-3 border rounded" />
      <input required value={form.whatsapp} onChange={e => handleChange("whatsapp", e.target.value)} placeholder="WhatsApp Number" className="w-full p-3 border rounded" />
      <select value={form.domain} onChange={e => handleChange("domain", e.target.value)} className="w-full p-3 border rounded">
        {domains.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <input value={form.college} onChange={e => handleChange("college", e.target.value)} placeholder="College & City" className="w-full p-3 border rounded" />
      <input value={form.passingYear} onChange={e => handleChange("passingYear", e.target.value)} placeholder="Passing Year" className="w-full p-3 border rounded" />
      <div className="flex gap-3">
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Applying..." : "Apply"}</button>
      </div>
    </form>
  );
}
