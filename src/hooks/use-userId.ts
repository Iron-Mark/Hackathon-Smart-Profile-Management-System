import backend from "@/client/backend";
import { useState, useEffect } from "react";

export const useUserId = async (): Promise<{
  success: boolean;
  userId: string | null;
}> => {
  const {
    data: { user },
    error,
  } = await backend.auth.getUser();

  if (error || !user) {
    return { success: false, userId: null };
  }

  return { success: true, userId: user.id };
};

export function useFetchUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const userIdData = await useUserId();
        setUserId(userIdData?.userId || null);
      } catch {
        setError("Failed to fetch user ID.");
      }
    }

    fetchUserId();
  }, []);

  return { userId, error };
}
