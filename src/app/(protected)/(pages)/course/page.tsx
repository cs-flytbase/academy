"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Heart, BookOpen, Clock, Video, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import CourseCard from "@/components/ui/course-card";
import { Input } from "@/components/ui/input";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  video_count: number;
  playlist_id: string;
  created_at: string;
}

interface User {
  id: string;
}

const UserPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        if (currentUser) {
          setUser({ id: currentUser.id });

          // Fetch courses
          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("*");

          if (coursesError) {
            console.error("Error fetching courses:", coursesError);
          } else {
            setCourses(coursesData || []);
          }

          // Fetch user's enrollments
          const { data: enrollmentsData, error: enrollmentsError } =
            await supabase
              .from("course_enrollments")
              .select("course_id")
              .eq("user_id", currentUser.id);

          if (enrollmentsError) {
            console.error("Error fetching enrollments:", enrollmentsError);
          } else {
            setEnrolledCourses(enrollmentsData.map((item) => item.course_id));
          }

          // Fetch user's wishlist
          const { data: wishlistData, error: wishlistError } = await supabase
            .from("course_wishlist")
            .select("course_id")
            .eq("user_id", currentUser.id);

          if (wishlistError) {
            console.error("Error fetching wishlist:", wishlistError);
          } else {
            setWishlist(wishlistData.map((item) => item.course_id));
          }
        } else {
          // If no user is logged in, load courses only
          const { data, error } = await supabase.from("courses").select("*");
          if (error) {
            console.error("Error fetching courses:", error);
          } else {
            setCourses(data || []);
          }

          // Load wishlist from localStorage for non-logged in users
          const savedWishlist = localStorage.getItem("courseWishlist");
          if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
          }
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleEnroll = async (
    e: React.MouseEvent,
    courseId: number,
    courseTitle: string
  ) => {
    e.preventDefault(); // Prevent card navigation
    e.stopPropagation(); // Prevent event bubbling

    if (!user) {
      toast.error("Please sign in to enroll in courses");
      return;
    }

    // Check if already enrolled
    if (enrolledCourses.includes(courseId)) {
      // If already enrolled, just redirect to the course
      window.location.href = `/course/${courseId}`;
      return;
    }

    // Set loading state for this specific course
    setActionLoading(courseId);

    try {
      // Add enrollment to database
      const { error } = await supabase.from("course_enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        status: "active",
        progress_percentage: 0,
        // enrolled_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error enrolling in course:", error);
        toast.error("Failed to enroll in course");
        return;
      }

      // Update local state
      setEnrolledCourses((prev) => [...prev, courseId]);

      toast.success(`Enrolled in "${courseTitle}"`, {
        description: "You can now access all course materials.",
      });

      // Navigate to course page after a small delay
      setTimeout(() => {
        window.location.href = `/course/${courseId}`;
      }, 1000);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleWishlist = async (
    e: React.MouseEvent,
    courseId: number,
    courseTitle: string
  ) => {
    e.preventDefault(); // Prevent card navigation
    e.stopPropagation(); // Prevent event bubbling

    // Set loading state for this specific course
    setActionLoading(courseId);

    try {
      const isInWishlist = wishlist.includes(courseId);

      if (user) {
        // User is logged in, update database
        if (isInWishlist) {
          // Remove from wishlist in database
          const { error } = await supabase
            .from("course_wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq("course_id", courseId);

          if (error) {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove from wishlist");
            return;
          }
        } else {
          // Add to wishlist in database
          const { error } = await supabase.from("course_wishlist").insert({
            user_id: user.id,
            course_id: courseId,
          });

          if (error) {
            console.error("Error adding to wishlist:", error);
            toast.error("Failed to add to wishlist");
            return;
          }
        }
      } else {
        // User not logged in, just update localStorage
        const newWishlist = isInWishlist
          ? wishlist.filter((id) => id !== courseId)
          : [...wishlist, courseId];

        localStorage.setItem("courseWishlist", JSON.stringify(newWishlist));
      }

      // Update local state
      setWishlist((prev) => {
        if (isInWishlist) {
          toast.info(`Removed "${courseTitle}" from wishlist`);
          return prev.filter((id) => id !== courseId);
        } else {
          toast.success(`Added "${courseTitle}" to wishlist`);
          return [...prev, courseId];
        }
      });
    } catch (error) {
      console.error("Wishlist operation error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const navigateToCourse = (courseId: number) => {
    window.location.href = `/course/${courseId}`;
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );

  if (!courses.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:px-20">
        <div className="text-6xl mb-4">📚</div> 
        <h2 className="text-2xl font-bold text-center mb-2">
          No Courses Found
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          We couldn't find any courses at the moment.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );

  return (
    <div className="bg-black min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Dark Coursera-Style Header */}
      <div className="flex flex-col gap-4 px-3 md:flex-row md:items-center md:justify-between md:px-6 lg:px-20 pt-6 pb-4">
        <div className="max-w-full">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white truncate">Courses</h1>
          <p className="text-xs md:text-base text-gray-400 mt-1">Browse our catalog of top courses and start learning today.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full items-center gap-2 md:w-auto md:justify-end">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto md:w-64 lg:w-80 px-3 py-2 border border-gray-700 rounded-full shadow-sm bg-[#23232b] text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition placeholder-gray-500 text-sm"
          />
          <Button variant="outline" className="w-full sm:w-auto rounded-full border-gray-700 shadow-sm px-3 py-1 h-auto bg-[#23232b] text-gray-100 hover:bg-[#23232b]/80 text-sm">
            <Filter className="mr-1 h-3 w-3" />
            Filter
          </Button>
        </div>
      </div>
      
      {/* Courses Grid */}
      <div className="w-full px-3 md:px-6 lg:px-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="block h-full cursor-pointer"
            >
              <CourseCard
                title={course.title}
                description={course.description}
                isEnrolled={enrolledCourses.includes(course.id)}
                numVideos={course.video_count}
                duration="3h 45m"
                thumbnailSrc={course.thumbnail || "https://placehold.co/600x400/3730a3/ffffff?text=Course"}
                wishlisted={wishlist.includes(course.id)}
                onEnroll={(e) => handleEnroll(e, course.id, course.title)}
                onToggleWishlist={(e) => toggleWishlist(e, course.id, course.title)}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;