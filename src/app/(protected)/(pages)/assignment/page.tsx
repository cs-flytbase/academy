"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import AssignmentCard from "@/components/AssignmentCard";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        {/* Hero Section */}
        {/* <section className="mb-16 text-center">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Testing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Assignments &amp; Tests
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Select an assignment to begin. Each assignment has a time limit, and
            your progress will be tracked.
          </p>

          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </section> */}

        {/* Assignments Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="animate-fade-in">
                <AssignmentCard assignment={assignment} />
                {/* {JSON.stringify(assignments[0])} */}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
