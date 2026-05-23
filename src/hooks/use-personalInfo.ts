// src/hooks/usePersonalInfo.ts
import { useState, useEffect } from "react";
import getFromDatabase from "@/tools/database/getFromDatabase";
import { useFetchUserId } from "@/hooks/use-userId";

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
  const { userId, error: userIdError } = useFetchUserId();

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!userId) {
        if (userIdError) setError(userIdError);
        return;
      }

      try {

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
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [userId, userIdError]);

  return { data, isLoading, error };
}
