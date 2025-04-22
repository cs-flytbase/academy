"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Assessment, Course } from "../types";
import AssessmentList from "./assessment-list";
import AssessmentDialog from "./assessment-dialog";

export default function AssessmentsTab() {
  const supabase = createClient();
  
  // State
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Assessment form state
  const [assessmentForm, setAssessmentForm] = useState<{
    id?: string;
    name: string;
    description: string;
    time: number;
    number_of_questions: number;
    courses: string[];
    prompt: string;
    passing_percentage: number;
  }>({
    name: "",
    description: "",
    time: 60,
    number_of_questions: 20,
    courses: [],
    prompt: "must create 20 question no matter what",
    passing_percentage: 70,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchCourses();
    fetchAssessments();
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description")
        .order("title", { ascending: true });

      if (error) throw error;
      
      if (data) {
        console.log(`Fetched ${data.length} courses:`, data);
        setCourses(data);
      } else {
        console.warn('No courses found in the database');
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // Fetch all assessments
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new assessment
  const handleAddAssessment = () => {
    setAssessmentForm({
      name: "",
      description: "",
      time: 60,
      number_of_questions: 20,
      courses: [],
      prompt: "must create 20 question no matter what",
      passing_percentage: 70,
    });
    setIsEditingAssessment(false);
    setShowAssessmentDialog(true);
  };

  // Handle editing an assessment
  const handleEditAssessment = (assessment: Assessment) => {
    setIsEditingAssessment(true);
    setAssessmentForm({
      id: assessment.id,
      name: assessment.title,
      description: assessment.description,
      time: assessment.time_limit,
      number_of_questions: assessment.number_of_questions || 20,
      courses: assessment.courses || [],
      prompt: assessment.prompt || "must create 20 question no matter what",
      passing_percentage: assessment.passing_percentage || 70,
    });
    setShowAssessmentDialog(true);
  };

  // Handle confirming delete
  const confirmDelete = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setShowDeleteConfirm(true);
  };

  // Delete an assessment
  const deleteAssessment = async () => {
    if (!assessmentToDelete) return;

    setLoading(true);
    try {
      // First, delete associated questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id")
        .eq("assessment_id", assessmentToDelete);

      if (questionsError) throw questionsError;

      if (questionsData && questionsData.length > 0) {
        const questionIds = questionsData.map((q) => q.id);

        // Delete question options
        const { error: optionsError } = await supabase
          .from("question_options")
          .delete()
          .in("question_id", questionIds);

        if (optionsError) throw optionsError;

        // Delete the questions
        const { error: deleteQuestionsError } = await supabase
          .from("questions")
          .delete()
          .in("id", questionIds);

        if (deleteQuestionsError) throw deleteQuestionsError;
      }

      // Finally, delete the assessment
      const { error: deleteAssessmentError } = await supabase
        .from("assessments")
        .delete()
        .eq("id", assessmentToDelete);

      if (deleteAssessmentError) throw deleteAssessmentError;

      toast.success("Assessment deleted successfully");
      fetchAssessments();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Failed to delete assessment");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setAssessmentToDelete(null);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5" />
              Assessments
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAssessments}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={handleAddAssessment}
                size="sm"
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AssessmentList 
            assessments={assessments} 
            onEditAssessment={handleEditAssessment} 
            onDeleteAssessment={confirmDelete} 
            loading={loading} 
          />
        </CardContent>
      </Card>

      {/* Assessment Dialog */}
      {showAssessmentDialog && (
        <>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded max-w-md z-50 overflow-auto" style={{ maxHeight: '200px' }}>
              <p><strong>Debug:</strong> {courses.length} courses available</p>
              <pre>{JSON.stringify(courses, null, 2)}</pre>
            </div>
          )}
          <AssessmentDialog
            isOpen={showAssessmentDialog}
            onClose={() => {
              setShowAssessmentDialog(false);
              // Refetch courses when closing to ensure they're loaded next time
              fetchCourses();
            }}
            assessmentForm={assessmentForm}
            setAssessmentForm={setAssessmentForm}
            isEditingAssessment={isEditingAssessment}
            isCreatingAssessment={isCreatingAssessment}
            setIsCreatingAssessment={setIsCreatingAssessment}
            fetchAssessments={fetchAssessments}
            courses={courses}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assessment? This action cannot be undone.
              All associated questions and options will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAssessment}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
