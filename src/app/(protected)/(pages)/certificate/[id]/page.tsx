"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Download, Award, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
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
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

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
        console.error("Error checking for certificate:", error);
        return null;
      }

      return data as Certificate;
    } catch (error) {
      console.error("Error checking for certificate:", error);
      return null;
    }
  };

  // Check for passed assessment attempts
  const checkPassedAttempt = (attempts: AssessmentAttempt[]) => {
    if (!attempts || attempts.length === 0) return null;
    
    const passedAttempts = attempts.filter(attempt => 
      attempt.assessment_id === Number(assessmentId) && attempt.passed === true);
    
    // Sort by date (most recent first) and return the first one
    passedAttempts.sort((a, b) => 
      new Date(b.finished_at || b.started_at).getTime() - 
      new Date(a.finished_at || a.started_at).getTime()
    );
    
    return passedAttempts.length > 0 ? passedAttempts[0] : null;
  };

  // Function to fetch assessment data and certificate status
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

      // Fetch associated course
      if (assessmentData.course_id) {
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", assessmentData.course_id)
          .single();

        if (!courseError) {
          setCourse(courseData);
        }
      }

      // Fetch assessment attempts for the user
      const { data: attemptsData, error: attemptsError } = await supabase
        .from("assessment_attempts")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("assessment_id", assessmentId);

      if (!attemptsError && attemptsData) {
        setAttempts(attemptsData);
        
        // Check if user has passed this assessment
        const passed = checkPassedAttempt(attemptsData);
        setPassedAttempt(passed);

        // If user has passed, check for existing certificate
        if (passed) {
          const cert = await checkExistingCertificate(userData.user.id);
          setCertificate(cert);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  // Check if certificate is unlocked (user has passed the assessment)
  const isCertificateUnlocked = () => {
    return passedAttempt !== null;
  };

  // Function to open certificate URL
  const openCertificate = () => {
    if (certificate?.url) {
      window.open(certificate.url, "_blank");
    } else {
      toast.error("Certificate URL not found");
    }
  };

  // Generate certificate function
  const generateCertificate = async () => {
    // Check if the user has passed the assessment
    if (!isCertificateUnlocked()) {
      toast.error("You must pass the assessment to generate a certificate");
      return;
    }
    
    if (!currentUser) {
      toast.error("User information not available");
      return;
    }
    
    try {
      setGeneratingCertificate(true);
      
      // Prepare data for the webhook
      const certificateData = {
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email,
        assessment: assessment?.title || "",
        assessmentID: assessmentId.toString(),
        userID: currentUser.id
      };
      
      console.log("Sending certificate data:", certificateData);
      
      // Send data to the webhook
      const response = await fetch(
        "https://srv-roxra.app.n8n.cloud/webhook/d1e598f4-24e7-40fe-be60-91410aedd49c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(certificateData),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Parse the response to get the certificate URL
      const responseData = await response.json();
      const certificateUrl = responseData.url;
      
      if (!certificateUrl) {
        throw new Error("Certificate URL not found in response");
      }
      
      // Save the certificate to the database
      const { data: newCertificate, error: saveError } = await supabase
        .from("certificate_user")
        .insert({
          user_id: currentUser.id,
          assessment_id: Number(assessmentId),
          url: certificateUrl,
          name: certificateData.name,
          email: certificateData.email
        })
        .select()
        .single();
      
      if (saveError) {
        console.error("Error saving certificate:", saveError);
        throw new Error("Failed to save certificate information");
      }
      
      toast.success("Certificate generated successfully!");
      setCertificate(newCertificate);
      setGeneratingCertificate(false);
      
      // Open the certificate in a new tab
      window.open(certificateUrl, "_blank");
      
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate. Please try again.");
      setGeneratingCertificate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-8 h-8 border-2 border-[#6b5de4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Assessment Not Found</h2>
          <p className="text-gray-400 mb-6">The assessment you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard" className="text-[#6b5de4] hover:text-[#5a4dd0] flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{assessment?.title} Certificate</h1>
            {course && <p className="text-gray-400 mt-1">Course: {course.title}</p>}
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800 shadow-xl">
          {isCertificateUnlocked() ? (
            <>
              <div className="mb-6 text-center">
                <Award className="w-16 h-16 text-[#6b5de4] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                <p className="text-gray-300">
                  You've successfully passed the assessment for {assessment?.title}
                </p>
              </div>
              
              {certificate ? (
                <div className="bg-[#242424] p-6 rounded-lg mb-6">
                  <div className="flex items-center text-green-400 mb-3">
                    <Check className="w-5 h-5 mr-2" />
                    <p className="font-medium">Certificate Available</p>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">
                    Your certificate was generated on {new Date(certificate.created_at).toLocaleDateString()}
                  </p>
                  
                  {certificate.url && (
                    <div className="mt-4 flex items-center justify-center">
                      <Button
                        onClick={openCertificate}
                        className="bg-green-600 hover:bg-green-700 py-3 px-6"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#242424] p-6 rounded-lg mb-6">
                  <p className="text-center text-gray-300 mb-6">
                    You've passed the assessment and qualify for a certificate. Generate it now!
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={generateCertificate}
                      disabled={generatingCertificate}
                      className="bg-[#6b5de4] hover:bg-[#5a4dd0] py-3 px-6"
                    >
                      {generatingCertificate ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Certificate Not Available</h2>
                <p className="text-gray-300 mb-6">
                  You need to pass the assessment to earn your certificate.
                </p>
              </div>
              
              <div className="bg-[#242424] p-6 rounded-lg mb-6">
                <h3 className="font-medium text-lg mb-4">Assessment Attempts</h3>
                
                {attempts.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {attempts.map((attempt) => (
                      <div key={attempt.id} className="border border-gray-700 p-3 rounded-md flex justify-between items-center">
                        <div>
                          <p className="text-sm">
                            Attempt #{attempt.attempt_number} -{" "}
                            <span className="text-gray-400">
                              {new Date(attempt.started_at).toLocaleDateString()}
                            </span>
                          </p>
                          {attempt.score !== null && (
                            <p className="text-sm mt-1">
                              Score: <span className="font-medium">{attempt.score}%</span>
                            </p>
                          )}
                        </div>
                        <div>
                          {attempt.passed ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                              Passed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-6">You haven't attempted this assessment yet.</p>
                )}
                
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => router.push(`/test/${assessmentId}`)}
                    className="bg-[#6b5de4] hover:bg-[#5a4dd0] py-3 px-6"
                  >
                    Take Assessment
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back links */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row sm:justify-between gap-4">
          <Link href="/dashboard" className="text-[#6b5de4] hover:text-[#5a4dd0] flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          {course && (
            <Link href={`/course/${course.id}`} className="text-[#6b5de4] hover:text-[#5a4dd0] flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {course.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
