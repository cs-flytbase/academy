import React from "react";
import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserCog, Mail } from "lucide-react";

interface UserListProps {
  users: User[];
  onToggleAdmin: (userId: string, isCurrentlyAdmin: boolean) => void;
  loading: boolean;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onToggleAdmin,
  loading,
}) => {
  if (loading) {
    return <div className="py-4">Loading users...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{user.full_name || "(No name)"}</h4>
                {user.is_admin && (
                  <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm mr-2">Admin</span>
              <Switch
                checked={user.is_admin}
                onCheckedChange={() => onToggleAdmin(user.id, user.is_admin)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
