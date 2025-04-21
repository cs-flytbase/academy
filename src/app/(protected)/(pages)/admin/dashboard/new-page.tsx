"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoIcon, PlusCircle, ListChecks, Users } from "lucide-react";

// Import all our tab components
import VideoQuestionsTab from "./components/video-questions";
import CourseManagementTab from "./components/course-management";
import AssessmentsTab from "./components/assessments";
import UserManagementTab from "./components/user-management";

export default function AdminDashboard() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("video-questions"); // Default tab

  // Check if current user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setIsAdmin(profileData?.is_admin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // If not admin, show loading or redirect
  if (isAdmin === null) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage courses, videos, questions, and user permissions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 sm:grid-cols-4 w-full p-1 mb-4 h-full">
          <TabsTrigger value="video-questions" className="text-base py-2 px-3">
            <VideoIcon className="mr-2 h-4 w-4" /> Video Questions
          </TabsTrigger>
          <TabsTrigger value="course-management" className="text-base py-2 px-3">
            <PlusCircle className="mr-2 h-4 w-4" /> Courses
          </TabsTrigger>
          <TabsTrigger value="assessments" className="text-base py-2 px-3">
            <ListChecks className="mr-2 h-4 w-4" /> Assessments
          </TabsTrigger>
          <TabsTrigger value="users" className="text-base py-2 px-3">
            <Users className="mr-2 h-4 w-4" /> User Management
          </TabsTrigger>
        </TabsList>

        {/* Video Questions Tab */}
        <TabsContent value="video-questions">
          <VideoQuestionsTab />
        </TabsContent>

        {/* Course Management Tab */}
        <TabsContent value="course-management">
          <CourseManagementTab />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <AssessmentsTab />
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
