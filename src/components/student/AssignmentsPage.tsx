import React, { useEffect, useState } from "react";
import { api as API } from "@/lib/api";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/assignments");
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Assignments</h2>
      {assignments.length === 0 && <div>No assignments</div>}
      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a._id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-gray-600">{a.description}</div>
              </div>
              <div className="text-sm text-gray-500">Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</div>
            </div>
            <div className="mt-3">
              <button onClick={() => toast.info("Submit functionality coming soon!")} className="px-3 py-1 bg-blue-600 text-white rounded">Submit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
