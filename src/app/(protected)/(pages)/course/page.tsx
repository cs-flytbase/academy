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
import { Heart, BookOpen, Clock, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
            added_at: new Date().toISOString(),
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );

  if (!courses.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      {/* <section className="bg-gradient-to-r from-primary/20 to-purple-500/20 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Expand Your Knowledge
          </h1>
          <p className="text-xl mb-6 max-w-xl text-muted-foreground">
            Discover top-quality courses designed to help you master new skills
            and advance your career.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>
      </section> */}

      {/* Courses Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-4 md:mb-0">
            Courses for You
          </h2>
          <div className="flex gap-4">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              My Learning {user && `(${enrolledCourses.length})`}
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              My Wishlist {user && `(${wishlist.length})`}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group bg-card border-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer relative "
              onClick={() => navigateToCourse(course.id)}
            >
              {/* Ribbon for enrollments or popular courses */}
              {enrolledCourses.includes(course.id) ? (
                <div className="absolute top-4 right-0 z-10">
                  <Badge className="bg-[#FA8500] text-white font-medium rounded-l-full rounded-r-none py-1 px-3">
                    Enrolled
                  </Badge>
                </div>
              ) : (
                course.video_count > 10 && (
                  <div className="absolute top-4 right-0 z-10">
                    <Badge className="bg-[#FA8500] text-white font-medium rounded-l-full rounded-r-none py-1 px-3">
                      Popular
                    </Badge>
                  </div>
                )
              )}

              <div className="relative w-full overflow-hidden h-48">
                <img
                  src={
                    course.thumbnail ||
                    "https://placehold.co/600x400/3730a3/ffffff?text=Course"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Badge
                    variant="outline"
                    className="bg-black/50 text-white border-none"
                  >
                    <Video className="mr-1 h-3 w-3" />
                    {course.video_count} videos
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-black/50 text-white border-none"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.round(course.video_count * 7)} min
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm line-clamp-2 h-10">
                    {course.description ||
                      "Dive into this comprehensive course designed to enhance your skills and knowledge."}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-5 pt-2 flex gap-2 border-t border-border/40">
                  <Button
                    className={`flex-1 ${
                      enrolledCourses.includes(course.id)
                        ? "bg-white hover:bg-[#FFAB49]"
                        : "bg-primary hover:bg-primary/90"
                    } cursor-pointer`}
                    onClick={(e) => handleEnroll(e, course.id, course.title)}
                    disabled={actionLoading === course.id}
                  >
                    {actionLoading === course.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {enrolledCourses.includes(course.id)
                      ? "Continue Learning"
                      : "Enroll Now"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={
                      wishlist.includes(course.id)
                        ? "text-red-500 border-red-200"
                        : ""
                    }
                    onClick={(e) => toggleWishlist(e, course.id, course.title)}
                    disabled={actionLoading === course.id}
                  >
                    {actionLoading === course.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart
                        className={`h-5 w-5 ${
                          wishlist.includes(course.id) ? "fill-red-500" : ""
                        }`}
                      />
                    )}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserPage;
