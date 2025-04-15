"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoginButton from "./LoginLogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserCircle } from "lucide-react";
import NavButton from "./ui-custom/NavButton";
import { signout } from "@/lib/auth-actions";

const UserGreetText = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user has admin privileges
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profileError) {
          setIsAdmin(profileData?.is_admin || false);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signout();
    setUser(null);
    router.push("/");
  };

  // If user is logged in, show avatar with dropdown
  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer focus:outline-none flex items-center">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name || "User"} 
                />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user.user_metadata.full_name 
                    ? `${user.user_metadata.full_name.split(' ')[0][0]}${user.user_metadata.full_name.split(' ')[1]?.[0] || ''}` 
                    : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.user_metadata.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.user_metadata.role && 
                  <p className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full inline-block mt-1 w-fit">
                    {user.user_metadata.role}
                  </p>
                }
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => router.push("/admin/dashboard")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // If user is not logged in, show Get Started button
  return (
    <div onClick={() => router.push("/signup")} className="cursor-pointer">
      <NavButton href="/signup">
        <span className="text-sm font-medium">GET STARTED</span>
      </NavButton>
    </div>
  );
};

export default UserGreetText;