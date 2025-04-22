import React from "react";
import { Course } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Youtube, FileVideo } from "lucide-react";

interface CourseListProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  loading: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onEditCourse,
  onDeleteCourse,
  loading,
}) => {
  if (loading) {
    return <div className="py-4">Loading courses...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No courses found. Click "Add Course" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {course.difficulty && (
                  <Badge
                    variant={course.difficulty === "advanced" ? "destructive" : 
                            course.difficulty === "intermediate" ? "default" : "outline"}
                  >
                    {course.difficulty}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="secondary">{course.category}</Badge>
                )}
                {course.playlist_id && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Youtube className="h-3 w-3" /> Playlist
                  </Badge>
                )}
                {course.video_count > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileVideo className="h-3 w-3" /> {course.video_count} videos
                  </Badge>
                )}
                {course.watch_hour && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg> 
                    {course.watch_hour}
                  </Badge>
                )}
              </div>
              <h4 className="font-medium">{course.title}</h4>
              {course.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditCourse(course)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteCourse(course.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
