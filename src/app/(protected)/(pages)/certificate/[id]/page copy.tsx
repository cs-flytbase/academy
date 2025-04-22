"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Download, Award, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import CertificateModal from "@/components/CertificateModal";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// Define interfaces based on the actual database schema
interface Assessment {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  time_limit: number | null;
  thumbnail: string | null;
  created_at: string;
  course_id: number;
}

interface AssessmentAttempt {
  id: number;
  user_id: string;
  assessment_id: number;
  attempt_number: number;
  started_at: string;
  finished_at: string | null;
  score: number | null;
  status: string | null;
  passed: boolean;
}

interface Certificate {
  id: number;
  created_at: string;
  user_id: string;
  url: string;
  name: string;
  email: string;
  assessment_id: number;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
}

const CertificatePage = () => {
  const { id: assessmentId } = useParams(); // Use assessment ID from URL
  const router = useRouter();
  const supabase = createClient();

  // State variables
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [passedAttempt, setPassedAttempt] = useState<AssessmentAttempt | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);

  // Check for existing certificate
  const checkExistingCertificate = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("certificate_user")
        .select("*")
        .eq("user_id", userId)
        .eq("assessment_id", assessmentId)
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
  
  // Check if the user has passed the assessment
  const checkPassedAttempt = (attempts: AssessmentAttempt[]) => {
    // Filter attempts for this assessment and find if any have passed=true
    const passedAttempts = attempts.filter(attempt => 
      attempt.assessment_id === Number(assessmentId) && attempt.passed === true);
    
    // Return the most recent passed attempt if it exists
    return passedAttempts.length > 0 ? passedAttempts[0] : null;
  };

  // Fetch assessment data and check for certificate
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!assessmentId) return;
        setLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }
        
        setCurrentUser(userData.user);
        
        // Fetch assessment details
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();
          
        if (assessmentError) {
          console.error("Error fetching assessment:", assessmentError);
          setLoading(false);
          return;
        }
        
        setAssessment(assessmentData);
        
        // Fetch course details associated with this assessment
        if (assessmentData.course_id) {
          const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("*")
            .eq("id", assessmentData.course_id)
            .single();
            
          if (!courseError && courseData) {
            setCourse(courseData);
          }
        }
        
        // Fetch assessment attempts for this user and assessment
        const { data: attemptsData, error: attemptsError } = await supabase
          .from("assessment_attempts")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("assessment_id", assessmentId)
          .order("started_at", { ascending: false });
          
        if (attemptsError) {
          console.error("Error fetching attempts:", attemptsError);
        } else if (attemptsData && attemptsData.length > 0) {
          setAttempts(attemptsData);
          
          // Check if any attempt has passed = true
          const passed = checkPassedAttempt(attemptsData);
          setPassedAttempt(passed);
          
          // If passed, check for existing certificate
          if (passed) {
            const existingCert = await checkExistingCertificate(userData.user.id);
            if (existingCert) {
              setCertificate(existingCert);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assessmentId, supabase]);

  // Check if certificate is unlocked (user has passed the assessment)
  const isCertificateUnlocked = () => {
    return passedAttempt !== null;
  };

  // Function to open certificate URL
  const openCertificate = () => {
    if (certificate?.url) {
      window.open(certificate.url, "_blank");
    } else {
      toast.error("Certificate URL not available. Please contact support.");
    }
  };

  // Generate certificate function
  const generateCertificate = () => {
    // Check if the user has passed the assessment
    if (!isCertificateUnlocked()) {
      toast.error("You must pass the assessment to generate a certificate");
      return;
    }

    // Show the certificate modal
    setShowCertModal(true);
  };

  // Handle certificate generation success
  const handleCertificateSuccess = (newCertificate: Certificate) => {
    setCertificate(newCertificate);
    setShowCertModal(false);
    // Refresh the page to show the new certificate
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-8 h-8 border-2 border-[#6b5de4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If no assessment data was found
  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-8">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 max-w-md w-full text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Assessment Not Found</h1>
          <p className="text-gray-400 mb-6">The assessment you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-[#6b5de4] hover:bg-[#5a4dd0] py-2 px-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#121212] text-white">
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Back button */}
      <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{assessment.title} Certificate</h1>
          {course && <p className="text-gray-400 mt-1">Course: {course.title}</p>}
        </div>
        
        {/* Assessment info badges */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {assessment.difficulty && (
            <span className="bg-[#2a2a2a] text-xs px-2 py-1 rounded-full">
              {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)}
            </span>
          )}
          {assessment.category && (
            <span className="bg-[#2a2a2a] text-xs px-2 py-1 rounded-full">
              {assessment.category}
            </span>
          )}
          {assessment.time_limit && (
            <span className="bg-[#2a2a2a] text-xs px-2 py-1 rounded-full">
              {assessment.time_limit} min
            </span>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
        {isCertificateUnlocked() ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-green-400 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Assessment passed! You have earned your certificate.
              </p>
            </div>

            {/* Certificate preview */}
            <div className="aspect-[4/3] max-w-2xl mx-auto bg-[#242424] rounded-lg flex flex-col items-center justify-center p-8 relative overflow-hidden">
              <div className="text-center">
                <Award className="w-16 h-16 text-[#6b5de4] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  Certificate of Completion
                </h3>
                <div className="w-24 h-1 bg-[#6b5de4] mx-auto mb-4"></div>
                <p className="text-gray-300 mb-2">This certifies that</p>
                <p className="text-xl font-semibold mb-2">{currentUser?.email}</p>
                <p className="text-gray-300 mb-2">has successfully completed</p>
                <p className="text-xl font-semibold mb-6">{assessment.title}</p>
                
                <div className="flex justify-center text-gray-400 text-sm">
                  <p>Issued {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Certificate status */}
            {certificate && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <div className="flex items-center text-green-400 mb-2">
                  <Check className="w-5 h-5 mr-2" />
                  <p className="font-medium">
                    Certificate already generated!
                  </p>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Your certificate was created on{" "}
                  {new Date(certificate.created_at).toLocaleDateString()}.
                </p>
                {certificate.name && (
                  <p className="text-sm text-gray-300">
                    Recipient:{" "}
                    <span className="text-white">
                      {certificate.name}
                    </span>
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-300 flex items-center">
                <X className="w-5 h-5 mr-2 text-red-400" />
                You need to pass the assessment to earn your certificate
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
                  Pass the assessment to unlock your certificate
                </p>
              </div>
            </div>

            {/* Assessment attempt info */}
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-2">Your Attempts</h3>
              
              {attempts.length > 0 ? (
                <div className="space-y-2">
                  {attempts.map((attempt) => (
                    <div key={attempt.id} className="bg-[#242424] p-3 rounded-md flex justify-between items-center">
                      <div>
                        <div className="text-sm flex items-center">
                          <span className="text-gray-400 mr-2">Attempt #{attempt.attempt_number}</span>
                          {attempt.passed ? (
                            <span className="text-green-400 flex items-center">
                              <Check className="w-4 h-4 mr-1" /> Passed
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center">
                              <X className="w-4 h-4 mr-1" /> Failed
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {attempt.started_at && (
                            <span>Date: {new Date(attempt.started_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        {attempt.score !== null ? `${attempt.score}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">You haven't attempted this assessment yet.</p>
              )}
              
              <Button
                onClick={() => router.push(`/test/${assessmentId}`)}
                className="w-full bg-[#6b5de4] hover:bg-[#5a4dd0] py-3 mt-4"
              >
                Take Assessment
              </Button>
              {/* Assessment completion info */}
            </div>
          </>
        )}
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
          assessmentId={Number(assessmentId)}
          courseTitle={assessment?.title || ''}
          onSuccess={handleCertificateSuccess}
        />
      )}
    </div>
    </div>
  );
};

export default CertificatePage;
