import { useEffect, useState } from "react";
import { api as API } from "@/lib/api";

export default function Partners() {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await API.get("/admin/colleges"); // backend route
        setColleges(res.data?.colleges || []);
      } catch (err) {
        console.error("Failed to load colleges:", err);
      }
    };

    loadColleges();
  }, []);

  return (
    <section id="partners" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Collaborated Colleges
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {colleges.length === 0
            ? "No colleges added yet."
            : `More than ${colleges.length} colleges collaborate with YDS.`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {colleges.length === 0 ? (
            <p className="col-span-4 text-gray-500">
              No colleges available. Admin will add soon.
            </p>
          ) : (
            colleges.map((c: any) => (
              <div
                key={c._id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow text-gray-800 dark:text-gray-100"
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
