"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import CertificateModal from "@/components/CertificateModal";

// Define interfaces based on the actual database schema
interface Video {
  id: number;
  title: string;
  youtube_video_id: string;
  about: string | null;
  thumbnail: string | null;
  order_in_chapter?: number;
  completed?: boolean;
}

interface Assessment {
  id: number;
  title: string;
  course_id: number;
  description?: string | null;
  passing_percentage?: number;
}

interface AssessmentAttemptSummary {
  highest_score: number;
  attempts: number;
  passed: boolean;
  latest_attempt?: {
    id: number;
    finished_at: string | null;
    score: number | null;
    status: string | null;
  } | null;
}

const StreamlinedCertificate = () => {
  const { id: courseId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  // State variables
  const [showCertModal, setShowCertModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingCertificate, setExistingCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [courseDescription, setCourseDescription] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [userProgress, setUserProgress] = useState<Set<number>>(new Set());
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<{
    [key: number]: AssessmentAttemptSummary;
  }>({});

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setCurrentUser(userData.user);
        }

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, description")
          .eq("id", courseId)
          .single();

        if (courseError) {
          console.error("Error fetching course:", courseError);
          return;
        }

        if (courseData) {
          setCourseTitle(courseData.title);
          setCourseDescription(courseData.description || "");
        }

        // Fetch videos and assessments in parallel
        const [videosResponse, assessmentsResponse, userResponse] =
          await Promise.all([
            supabase
              .from("videos")
              .select("*")
              .eq("course_id", courseId)
              .order("id"),
            supabase
              .from("assessments")
              .select("*")
              .eq("course_id", courseId)
              .order("id"),
            supabase.auth.getUser(),
          ]);

        // Process videos
        if (videosResponse.error) {
          console.error("Error fetching videos:", videosResponse.error);
        } else if (videosResponse.data && videosResponse.data.length > 0) {
          setVideos(videosResponse.data);
        }

        // Process assessments
        if (assessmentsResponse.error) {
          console.error(
            "Error fetching assessments:",
            assessmentsResponse.error
          );
        } else if (
          assessmentsResponse.data &&
          assessmentsResponse.data.length > 0
        ) {
          setAssessments(assessmentsResponse.data);
        }

        // If user is logged in, fetch progress data
        const user = userResponse.data.user;
        if (user && videosResponse.data) {
          const videoIds = videosResponse.data.map((v) => v.id);

          const { data: completedVideosData, error: completedVideosError } =
            await supabase
              .from("video_watched")
              .select("video_id, quiz_taken")
              .eq("user_id", user.id)
              .in("video_id", videoIds);

          if (completedVideosError) {
            console.error(
              "Error fetching completed videos:",
              completedVideosError
            );
          } else if (completedVideosData) {
            // Create a Set of completed video IDs
            const completedVideoIds = new Set(
              completedVideosData
                .filter((item) => item.quiz_taken)
                .map((item) => item.video_id)
            );

            // Update user progress state
            setUserProgress(completedVideoIds);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setLoading(false);
      }
    };

    const fetchAssessmentAttempts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Fetch all assessment attempts for this user
        const { data: attemptsData, error } = await supabase
          .from("assessment_attempts")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .eq("passed", true);

        if (error) {
          console.error("Error fetching assessment attempts:", error);
          return;
        }

        setAssessmentAttempts(attemptsData);
      } catch (error) {
        console.error("Error in fetchAssessmentAttempts:", error);
      }
    };

    // Check for existing certificate
    const checkCertificate = async () => {
      const cert = await checkExistingCertificate();
      setExistingCertificate(cert);
    };

    if (courseId) {
      fetchCourseData();
      fetchAssessmentAttempts();
      checkCertificate();
    }
  }, [courseId]);

  // Check if certificate is unlocked
  const isCertificateUnlocked = () => {
    return assessmentAttempts[0]?.passed;
  };

  // Check for existing certificate
  const checkExistingCertificate = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("certificate_user")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking for existing certificate:", error);
        return null;
      }

      return data; // Will be null if no certificate exists
    } catch (error) {
      console.error("Error in checkExistingCertificate:", error);
      return null;
    }
  };

  // Function to open certificate URL
  const openCertificate = () => {
    if (existingCertificate?.url) {
      window.open(existingCertificate.url, "_blank");
    } else {
      alert("Certificate URL not available. Please contact support.");
    }
  };

  // Generate certificate function
  const generateCertificate = () => {
    // Check if the user has completed all required assessments
    if (!isCertificateUnlocked()) {
      alert("Please complete all assessments to unlock your certificate");
      return;
    }

    // Show the certificate modal
    setShowCertModal(true);
  };

  // Handle certificate generation success
  const handleCertificateSuccess = async () => {
    // Refresh the certificate status
    const updatedCert = await checkExistingCertificate();
    setExistingCertificate(updatedCert);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-8 h-8 border-2 border-[#6b5de4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">{courseTitle} Certificate</h1>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          {isCertificateUnlocked() ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-green-400 flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  All requirements completed! You can now generate your
                  certificate.
                </p>
              </div>

              {existingCertificate && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                  <div className="flex items-center text-green-400 mb-2">
                    <Check className="w-5 h-5 mr-2" />
                    <p className="font-medium">
                      Certificate already generated!
                    </p>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Your certificate was created on{" "}
                    {new Date(
                      existingCertificate.created_at
                    ).toLocaleDateString()}
                    .
                  </p>
                  {existingCertificate.name && (
                    <p className="text-sm text-gray-300">
                      Recipient:{" "}
                      <span className="text-white">
                        {existingCertificate.name}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {existingCertificate ? (
                <Button
                  onClick={openCertificate}
                  className="w-full bg-green-600 hover:bg-green-700 py-3 mt-4"
                >
                  View Your Certificate
                </Button>
              ) : (
                <Button
                  onClick={generateCertificate}
                  className="w-full bg-[#6b5de4] hover:bg-[#5a4dd0] py-3 mt-4"
                >
                  Generate Certificate
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-300 flex items-center">
                  <X className="w-5 h-5 mr-2 text-red-400" />
                  Complete all lessons and quizzes to unlock your certificate
                </p>
              </div>

              <div className="aspect-[4/3] max-w-2xl mx-auto bg-[#242424] rounded-lg flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Locked overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="bg-[#1a1a1a] rounded-full p-5 shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-[#6b5de4]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>

                {/* Blurred certificate preview */}
                <div className="text-center filter blur-sm">
                  <h3 className="text-2xl font-bold mb-4">
                    Certificate of Completion
                  </h3>
                  <div className="w-24 h-1 bg-[#6b5de4] mx-auto mb-4"></div>
                  <p className="text-gray-400 mb-6">
                    Complete all requirements to unlock your certificate
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (Array.from(userProgress).length / videos.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6b5de4] rounded-full"
                    style={{
                      width: `${
                        (Array.from(userProgress).length / videos.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {Array.from(userProgress).length} of {videos.length} lessons
                  completed
                </div>
              </div>

              {/* Disabled button */}
              <Button
                disabled
                className="w-full bg-gray-700 opacity-50 cursor-not-allowed mt-6"
              >
                Complete All Lessons to Unlock
              </Button>
            </>
          )}
        </div>

        {/* Certificate Requirements Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Certificate Requirements</h2>

          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-medium mb-3">Course Assessments</h3>

            <div className="space-y-4">
              {assessments.map((assessment) => {
                const attemptData = assessmentAttempts[0] || {
                  highest_score: 0,
                  attempts: 0,
                  passed: false,
                  latest_attempt: null,
                };

                return (
                  <div
                    key={assessment.id}
                    className="flex justify-between items-center p-3 bg-[#242424] rounded-md"
                  >
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-sm text-gray-400">
                        Passing score: {assessment.passing_percentage || 80}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          attemptData.passed ? "bg-green-500" : "bg-gray-600"
                        }`}
                      ></div>
                      <Button
                        size="sm"
                        variant={attemptData.passed ? "outline" : "default"}
                        className={
                          attemptData.passed
                            ? "border-green-500 text-green-500"
                            : "bg-[#6b5de4]"
                        }
                        onClick={() =>
                          router.push(`/assignment/${assessment.id}`)
                        }
                      >
                        {attemptData.passed ? "Review" : "Take Assessment"}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {assessments.length === 0 && (
                <p className="text-gray-400 py-2">
                  No assessments available for this course.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          defaultEmail={currentUser?.email || ""}
          defaultName={
            currentUser?.profile?.full_name ||
            currentUser?.profile?.display_name ||
            currentUser?.user_metadata?.full_name ||
            ""
          }
          courseId={courseId}
          courseTitle={courseTitle}
          onSuccess={handleCertificateSuccess}
        />
      )}
    </div>
  );
};

export default StreamlinedCertificate;
