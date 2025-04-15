"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      // console.log(data.user);
      if (!data.user) {
        router.replace("/login"); // Redirect to login page if no user
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <p className="w-full h-full flex justify-center items-center">
        Loading...
      </p>
    ); // Show a loading state until authentication resolves

  return <>{children}</>;
}
