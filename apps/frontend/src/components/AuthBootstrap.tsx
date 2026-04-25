import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthBootstrap() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void useAuthStore.getState().fetchProfile();
  }, [hydrated]);

  return null;
}
