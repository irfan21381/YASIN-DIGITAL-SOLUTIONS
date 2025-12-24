import { useEffect, useState } from "react";
import { api as API } from "@/lib/api";

export default function useActivity() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await API.get("/student/activity");
        if (cancelled) return;
        setActivity(res.data.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { activity, loading };
}
