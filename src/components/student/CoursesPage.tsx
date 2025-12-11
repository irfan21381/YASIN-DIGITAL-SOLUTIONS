import React, { useEffect, useState } from "react";
import { api as API } from "@/lib/api";
import { Link } from "react-router-dom";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/courses");
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Courses</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c._id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.description}</p>
            <div className="mt-3">
              <Link to={`/courses/${c.slug}`} className="text-blue-600">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
