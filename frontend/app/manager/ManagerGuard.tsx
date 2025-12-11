"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function ManagerGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!initialized) return;

    if (!user || user.activeRole !== "COLLEGE_MANAGER") {
      router.replace("/auth/login");
      return;
    }

    setChecking(false);
  }, [user, initialized, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking permissions…
      </div>
    );
  }

  return <>{children}</>;
}
