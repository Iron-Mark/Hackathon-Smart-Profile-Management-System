import { useEffect } from "react"
import { toast } from "sonner"

export function NetworkListener() {
  useEffect(() => {
    const handleOffline = () => {
      toast.error("Offline Mode - Operating from Cache", {
        duration: Infinity,
        id: "offline-toast",
      })
    }

    const handleOnline = () => {
      toast.dismiss("offline-toast")
      toast.success("Back Online - Syncing connected")
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return null
}
