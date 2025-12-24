// src/hooks/useStudentStats.ts
import { useEffect, useState } from "react";
import { api as API } from "@/lib/api"; // your axios instance

type Stats = {
  completedCourses: number;
  pendingAssignments: number;
  internshipStatus: string; // you may want to map this differently
  aiCredits: number;
};

export default function useStudentStats() {
  const [stats, setStats] = useState<Stats>({
    completedCourses: 0,
    pendingAssignments: 0,
    internshipStatus: "Not Applied",
    aiCredits: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
        const res = await API.get("/student/stats"); // adjust route if needed
        if (cancelled) return;
        const data = res.data || {};
        setStats({
          completedCourses: data.completedCourses ?? 0,
          pendingAssignments: data.pendingAssignments ?? 0,
          internshipStatus: data.internshipStatus ?? "Not Applied",
          aiCredits: data.aiCredits ?? 0,
        });
      } catch (err: any) {
        // keep fallback zeros and set error
        setError(err?.message || "Failed to fetch student stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
