import React, { useEffect, useState } from "react";
import { api as API } from "@/lib/api";

export default function MyApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/internships");
        setApps(res.data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading applications...</div>;
  if (!apps.length) return <div>No applications yet</div>;

  return (
    <div className="space-y-4">
      {apps.map(a => (
        <div key={a._id} className="p-4 rounded-xl bg-white dark:bg-gray-900 border">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">{a.domain}</div>
              <div className="text-sm text-gray-600">{a.college} • {a.passingYear}</div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full ${a.status === 'Selected' ? 'bg-green-100 text-green-800' : a.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {a.status}
              </div>
              <div className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          </div>
          {a.notes && <div className="mt-3 text-sm text-gray-700">{a.notes}</div>}
        </div>
      ))}
    </div>
  );
}
