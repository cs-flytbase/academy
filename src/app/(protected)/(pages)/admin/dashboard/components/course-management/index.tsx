"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Course } from "../types";
import CourseList from "./course-list";
import CourseForm from "./course-form";

export default function CourseManagementTab() {
  const supabase = createClient();
  
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("title", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Create a new course
  const handleAddCourse = () => {
    setCurrentCourse(null);
    setIsEditing(false);
    setShowCourseDialog(true);
  };

  // Edit an existing course
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditing(true);
    setShowCourseDialog(true);
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This will delete all associated videos and questions.")) {
      return;
    }

    setLoading(true);
    try {
      // Delete the course
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle>Course Management</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCourses}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleAddCourse}
                size="sm"
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CourseList 
            courses={courses} 
            onEditCourse={handleEditCourse} 
            onDeleteCourse={handleDeleteCourse} 
            loading={loading} 
          />
        </CardContent>
      </Card>

      {/* Course Form Dialog */}
      {showCourseDialog && (
        <CourseForm 
          isOpen={showCourseDialog}
          onClose={() => setShowCourseDialog(false)}
          course={currentCourse}
          isEditing={isEditing}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
}
