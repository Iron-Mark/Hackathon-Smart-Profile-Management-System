// src/hooks/usePersonalInfo.ts
import { useState, useEffect } from "react";

export interface PersonalInfo {
  name: string;
  email: string;
  profession: string;
  description: string;
}

export function usePersonalInfo() {
  const [data, setData] = useState<PersonalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/faculty/profile")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<PersonalInfo>;
      })
      .then((profile) => {
        if (mounted) setData(profile);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
