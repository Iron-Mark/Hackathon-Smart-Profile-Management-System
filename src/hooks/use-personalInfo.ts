// src/hooks/usePersonalInfo.ts
import { useState, useEffect } from "react";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { useUserId } from "@/hooks/use-userId";

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

    async function fetchProfile() {
      try {
        const { userId, success } = await useUserId();
        if (!success || !userId) {
          throw new Error("User not authenticated");
        }

        const accountData = await getFromDatabase({
          table: "account_details",
          getAll: true,
          match: { id: userId },
        });

        const profileData = await getFromDatabase({
          table: "profile_details",
          getAll: true,
          match: { id: userId },
        });

        if (mounted) {
          setData({
            name: accountData[0]?.name || "",
            email: accountData[0]?.email || "",
            profession: profileData[0]?.profession || "",
            description: profileData[0]?.description || "",
          });
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
