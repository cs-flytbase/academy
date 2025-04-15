"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Calendar,
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Heart,
  BookText,
  LineChart,
  Trophy,
  Users,
  Layers,
  Bookmark,
  GraduationCap as GradCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for our database schema
interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: number;
  status: string;
  progress_percentage: number;
  last_accessed_at: string;
  created_at: string;
}

interface CourseWishlist {
  id: string;
  user_id: string;
  course_id: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  video_count: number;
  playlist_id: string;
  created_at: string;
}

interface WishlistedCourse extends Course {
  wishlisted_at: string;
}

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  video_count: number;
  progress: number;
  status: string;
  last_accessed: string;
  enrolled_at: string;
  completed_lessons: number;
}

interface UserStats {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  wishlist_count: number;
  total_hours_spent: number;
}

const DashboardPage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [wishlistedCourses, setWishlistedCourses] = useState<
    WishlistedCourse[]
  >([]);
  const [stats, setStats] = useState<UserStats>({
    total_enrollments: 0,
    active_enrollments: 0,
    completed_enrollments: 0,
    wishlist_count: 0,
    total_hours_spent: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        if (!userData.user) {
          console.log("No authenticated user found");
          setLoading(false);
          return;
        }

        setUser(userData.user);

        // 1. Fetch enrolled courses with join to courses table
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("course_enrollments")
          .select(
            `
            *,
            courses:course_id (*)
          `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (enrollmentError) {
          console.error("Error fetching enrollments:", enrollmentError);
        } else if (enrollmentData) {
          // Transform the data into EnrolledCourse format
          const formattedCourses: EnrolledCourse[] = enrollmentData.map(
            (enrollment) => {
              const course = enrollment.courses as Course;
              return {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail || "/placeholder-course.jpg",
                video_count: course.video_count || 0,
                progress: enrollment.progress_percentage || 0,
                status: enrollment.status || "active",
                last_accessed:
                  enrollment.last_accessed_at || enrollment.created_at,
                enrolled_at: enrollment.created_at,
                completed_lessons: Math.floor(
                  ((course.video_count || 0) *
                    (enrollment.progress_percentage || 0)) /
                    100
                ),
              };
            }
          );
          setEnrolledCourses(formattedCourses);
        }

        // 2. Fetch wishlisted courses with join to courses table
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("course_wishlist")
          .select(
            `
            *,
            courses:course_id (*)
          `
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
        } else if (wishlistData) {
          // Transform the data into WishlistedCourse format
          const formattedWishlist: WishlistedCourse[] = wishlistData.map(
            (wishlistItem) => {
              const course = wishlistItem.courses as Course;
              return {
                ...course,
                wishlisted_at: wishlistItem.created_at,
              };
            }
          );
          setWishlistedCourses(formattedWishlist);
        }

        // Calculate statistics
        setStats({
          total_enrollments: enrollmentData?.length || 0,
          active_enrollments:
            enrollmentData?.filter((e) => e.status !== "completed").length || 0,
          completed_enrollments:
            enrollmentData?.filter((e) => e.status === "completed").length || 0,
          wishlist_count: wishlistData?.length || 0,
          total_hours_spent: calculateTotalHours(enrollmentData),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to calculate total learning hours
  const calculateTotalHours = (enrollments: any[] | null) => {
    if (!enrollments || enrollments.length === 0) return 0;

    let totalHours = 0;
    enrollments.forEach((enrollment) => {
      const course = enrollment.courses as Course;
      const progress = enrollment.progress_percentage || 0;
      const videoCount = course.video_count || 0;
      const watchedVideos = Math.floor((videoCount * progress) / 100);
      // Assume 15 minutes per video
      totalHours += watchedVideos * 0.25;
    });

    return totalHours;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your dashboard
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user.user_metadata?.full_name || "Learner"}
            </h1>
            <p className="text-muted-foreground">
              Track your enrolled courses and wishlist
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/course">
                Browse Courses <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Enrolled Courses
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.total_enrollments}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Completed Courses
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.completed_enrollments}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Wishlist
                  </p>
                  <p className="text-3xl font-bold">{stats.wishlist_count}</p>
                </div>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Learning Hours
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.total_hours_spent.toFixed(1)}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-full">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="enrolled" className="mb-8 ">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-full">
          <TabsTrigger value="enrolled" className="text-base py-3">
            <GradCap className="mr-2 h-4 w-4" /> Enrolled Courses
          </TabsTrigger>
          <TabsTrigger value="certificates" className="text-base py-3">
            <Heart className="mr-2 h-4 w-4" /> Certificates
          </TabsTrigger>
        </TabsList>

        {/* ENROLLED COURSES TAB */}
        <TabsContent value="enrolled">
          {enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Enrolled Courses</h2>
                <p className="text-sm text-muted-foreground">
                  {enrolledCourses.length} courses (
                  {stats.completed_enrollments} completed)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 lg:w-1/4 aspect-video md:aspect-auto">
                        <img
                          src={course.thumbnail || "/placeholder-course.jpg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold mb-2">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {course.description}
                            </p>
                          </div>

                          <Badge
                            variant={
                              course.status === "completed"
                                ? "default"
                                : "outline"
                            }
                            className={
                              course.status === "completed"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {course.status === "completed"
                              ? "Completed"
                              : "In Progress"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-2" />

                          <div className="flex flex-wrap justify-between items-center gap-2 pt-4">
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <BookOpen className="mr-1 h-3 w-3" />
                                {course.completed_lessons}/{course.video_count}{" "}
                                lessons completed
                              </div>
                              <div>
                                Enrolled on:{" "}
                                {new Date(
                                  course.enrolled_at
                                ).toLocaleDateString()}
                              </div>
                            </div>

                            <Button size="sm" asChild>
                              <Link href={`/course/${course.id}`}>
                                {course.status === "completed"
                                  ? "Review Course"
                                  : "Continue Learning"}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {enrolledCourses.length > 5 && (
                <div className="text-center mt-6">
                  <Button variant="outline" asChild>
                    <Link href="/my-courses">View All Enrolled Courses</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/40 rounded-lg border border-border">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Enrolled Courses</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to
                find courses that match your interests.
              </p>
              <Button asChild>
                <Link href="/course">Browse Courses</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* WISHLIST TAB */}
        <TabsContent value="certificates"></TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-6"
            asChild
          >
            <Link href="/course">
              <div className="flex flex-col items-center w-full text-center">
                <BookOpen className="h-8 w-8 mb-2" />
                <span className="font-medium">Browse Courses</span>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-6"
            asChild
          >
            <Link href="/my-courses">
              <div className="flex flex-col items-center w-full text-center">
                <GradCap className="h-8 w-8 mb-2" />
                <span className="font-medium">My Learning</span>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-6"
            asChild
          >
            <Link href="/assignment">
              <div className="flex flex-col items-center w-full text-center">
                <BookText className="h-8 w-8 mb-2" />
                <span className="font-medium">Assignments</span>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-6"
            asChild
          >
            <Link href="/profile">
              <div className="flex flex-col items-center w-full text-center">
                <Users className="h-8 w-8 mb-2" />
                <span className="font-medium">My Profile</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section Skeleton */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-32 mt-4 sm:mt-0" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      {/* Tabs Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-full mb-6" />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
        </div>
      </div>

      {/* Quick Links Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
