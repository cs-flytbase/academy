"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import CertificateAssessmentCard from "@/components/CertificateAssessmentCard";
import { useRouter } from "next/navigation";

// Inline interface for Assignment matching your database schema
interface Assignment {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  timeLimit: number | null; // mapped from time_limit
  difficulty: string | null; // mapped from difficulty (can be null)
  category: string | null; // mapped from category (can be null)
  courseId: number; // mapped from course_id
  createdAt: string; // mapped from created_at
}

const Index = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("assessments").select("*");
      console.log("assignments:", data);

      if (error) {
        console.error("Error fetching assignments:", error);
      } else {
        // Map the snake_case keys from Supabase to camelCase for our interface.
        const mappedData: Assignment[] = (data ?? []).map(
          (assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            thumbnail: assignment.thumbnail,
            timeLimit: assignment.time_limit,
            difficulty: assignment.difficulty,
            category: assignment.category,
            courseId: assignment.course_id,
            createdAt: assignment.created_at,
          })
        );
        setAssignments(mappedData);
      }
      setLoading(false);
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading assignments...</p>
      </div>
    );
  }

  // Filter assignments by search query
  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black min-h-screen">
      {/* Coursera-Style Header for Certificates */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 md:px-20 pt-10 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Certificates</h1>
          <p className="text-base text-gray-400 mt-1">Complete an assessment to earn your professional certificate.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto md:justify-end">
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-5 py-2 border border-gray-700 rounded-full shadow-sm bg-[#23232b] text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition placeholder-gray-500"
            style={{ maxWidth: 350 }}
          />
          <button
            className="rounded-full border border-gray-700 shadow-sm px-5 py-2 h-auto bg-[#23232b] text-gray-100 hover:bg-[#23232b]/80 flex items-center gap-2"
            type="button"
            tabIndex={-1}
            disabled
          >
            {/* You can swap this icon for a filter icon if you want real filtering */}
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17V13.414a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" /></svg>
            Filter
          </button>
        </div>
      </div>
      {/* Certificates Grid */}
      <div className="mx-auto px-2 md:px-20 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-10">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="animate-fade-in w-full ">
              <CertificateAssessmentCard
                courseTitle={assignment.title}
                numQuestions={20}
                duration={assignment.timeLimit ? `${assignment.timeLimit} min` : '45 min'}
                difficulty={assignment.difficulty || 'Standard'}
                onTakeTest={() => router.push(`/assignment/${assignment.id}`)}
                onDetails={() => router.push(`/assignment/${assignment.id}`)}
              />
               {/* <CertificateAssessmentCard
                courseTitle={assignment.title}
                numQuestions={20}
                duration={assignment.timeLimit ? `${assignment.timeLimit} min` : '45 min'}
                difficulty={assignment.difficulty ?? 'Intermediate'}
                onTakeTest={() => router.push(`/assignment/${assignment.id}`)}
                onDetails={() => router.push(`/assignment/${assignment.id}`)}
              /> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
