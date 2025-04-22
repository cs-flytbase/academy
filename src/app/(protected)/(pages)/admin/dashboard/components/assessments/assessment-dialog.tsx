"use client";

import React from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Course } from "../types";

interface AssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentForm: {
    id?: string;
    name: string;
    description: string;
    time: number;
    number_of_questions: number;
    courses: string[];
    prompt: string;
    passing_percentage: number;
  };
  setAssessmentForm: (form: any) => void;
  isEditingAssessment: boolean;
  isCreatingAssessment: boolean;
  setIsCreatingAssessment: (creating: boolean) => void;
  fetchAssessments: () => Promise<void>;
  courses: Course[];
}

const AssessmentDialog: React.FC<AssessmentDialogProps> = ({
  isOpen,
  onClose,
  assessmentForm,
  setAssessmentForm,
  isEditingAssessment,
  isCreatingAssessment,
  setIsCreatingAssessment,
  fetchAssessments,
  courses,
}) => {
  const supabase = createClient();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Convert numeric inputs to numbers
    if (name === 'time' || name === 'number_of_questions' || name === 'passing_percentage') {
      parsedValue = parseInt(value) || 0;
    }
    
    setAssessmentForm({
      ...assessmentForm,
      [name]: parsedValue,
    });
  };

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    console.log('Selected course:', courseId);
    
    if (!courseId) return;
    
    // Add the course to the array if it's not already included
    if (!assessmentForm.courses.includes(courseId)) {
      setAssessmentForm({
        ...assessmentForm,
        courses: [...assessmentForm.courses, courseId],
      });
    }
  };
  
  // Remove a course from selection
  const removeCourse = (courseId: string) => {
    setAssessmentForm({
      ...assessmentForm,
      courses: assessmentForm.courses.filter(id => id !== courseId),
    });
  };
  
  // Log available courses when they change
  React.useEffect(() => {
    console.log(`AssessmentDialog received ${courses.length} courses:`, courses);
  }, [courses]);

  // Create or update an assessment
  const createOrUpdateAssessment = async () => {
    // Validate form data
    if (!assessmentForm.name.trim()) {
      toast.error("Assessment name is required");
      return;
    }

    if (!assessmentForm.description.trim()) {
      toast.error("Assessment description is required");
      return;
    }

    // Only require course selection when creating a new assessment, not when editing
    if (!isEditingAssessment && (!assessmentForm.courses || assessmentForm.courses.length === 0)) {
      toast.error("Please select a course");
      return;
    }

    setIsCreatingAssessment(true);

    try {
      if (isEditingAssessment && assessmentForm.id) {
        // Update existing assessment
        const { error } = await supabase
          .from("assessments")
          .update({
            title: assessmentForm.name,
            description: assessmentForm.description,
            time_limit: assessmentForm.time,
            // Note: passing_percentage field doesn't exist in the database schema
            // We can't change number_of_questions on existing assessments
            // as questions would have already been generated
          })
          .eq("id", assessmentForm.id);

        if (error) throw error;

        toast.success("Assessment updated successfully!");
        fetchAssessments();
      } else {
        // Create new assessment via webhook
        // Prepare the data for the webhook
        const requestData = {
          courses: assessmentForm.courses,
          name: assessmentForm.name,
          number_of_questions: assessmentForm.number_of_questions,
          description: assessmentForm.description,
          time: assessmentForm.time,
          prompt: assessmentForm.prompt,
          passing_percentage: assessmentForm.passing_percentage,
        };

        // Send the request to the webhook endpoint
        const response = await fetch(
          "https://srv-roxra.app.n8n.cloud/webhook/ae07cfdc-a2c1-4a09-8cfc-ac4c2183c64f",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        // Get the assessment ID from the response
        const responseData = await response.json();
        const assessmentId = responseData.assessment_id;
        
        if (assessmentId) {
          // Create entries in the course_assessments table for each selected course
          for (const courseId of assessmentForm.courses) {
            const { error: courseAssessmentError } = await supabase
              .from("course_assessments")
              .insert({
                course_id: parseInt(courseId),
                assessment_id: assessmentId
              });
            
            if (courseAssessmentError) {
              console.error("Error creating course-assessment relationship:", courseAssessmentError);
              // Continue with other inserts even if one fails
            }
          }
          
          toast.success("Assessment created and linked to courses successfully!");
        } else {
          toast.success("Assessment creation request submitted successfully!");
          console.warn("Assessment ID not returned from webhook. Could not create course_assessments entries.");
        }

        // Refresh the assessments list after a short delay to allow for creation
        setTimeout(() => {
          fetchAssessments();
        }, 2000);
      }

      onClose();
    } catch (error) {
      console.error("Error creating/updating assessment:", error);
      toast.error(
        isEditingAssessment
          ? "Failed to update assessment"
          : "Failed to create assessment"
      );
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditingAssessment ? "Edit Assessment" : "Create New Assessment"}
          </DialogTitle>
          <DialogDescription>
            {isEditingAssessment
              ? "Update the assessment details below."
              : "Create a new assessment by filling out the form below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Assessment Name *</Label>
            <Input
              id="name"
              name="name"
              value={assessmentForm.name}
              onChange={handleChange}
              placeholder="Enter assessment name"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={assessmentForm.description}
              onChange={handleChange}
              placeholder="Enter assessment description"
              className="min-h-[100px]"
            />
          </div>

          {/* Time Limit */}
          <div className="grid gap-2">
            <Label htmlFor="time">Time Limit (minutes)</Label>
            <Input
              id="time"
              name="time"
              type="number"
              min="1"
              max="180"
              value={assessmentForm.time}
              onChange={handleChange}
            />
          </div>

          {/* Passing Percentage */}
          <div className="grid gap-2">
            <Label htmlFor="passing_percentage">Passing Percentage</Label>
            <Input
              id="passing_percentage"
              name="passing_percentage"
              type="number"
              min="1"
              max="100"
              value={assessmentForm.passing_percentage}
              onChange={handleChange}
            />
          </div>

          {/* Only show these fields when creating a new assessment */}
          {!isEditingAssessment && (
            <>
              {/* Number of Questions */}
              <div className="grid gap-2">
                <Label htmlFor="number_of_questions">Number of Questions</Label>
                <Input
                  id="number_of_questions"
                  name="number_of_questions"
                  type="number"
                  min="5"
                  max="50"
                  value={assessmentForm.number_of_questions}
                  onChange={handleChange}
                />
              </div>

              {/* Course Selection */}
              <div className="grid gap-2">
                <Label htmlFor="courses">Course(s) *</Label>
                <div className="relative">
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Available courses: {courses.length}
                    </div>
                  )}
                  
                  {/* Display selected courses as badges */}
                  {assessmentForm.courses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {assessmentForm.courses.map(courseId => {
                        const course = courses.find(c => c.id === courseId);
                        return (
                          <div key={courseId} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                            <span>{course ? course.title : courseId}</span>
                            <button 
                              type="button" 
                              onClick={() => removeCourse(courseId)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Course dropdown */}
                  {courses && courses.length > 0 ? (
                    <Select
                      onValueChange={handleCourseChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select courses..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter(course => !assessmentForm.courses.includes(course.id))
                          .map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title || `Course ${course.id}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-4 border border-dashed rounded-md bg-muted text-center">
                      <p className="text-sm text-muted-foreground">No courses found. Please add courses first.</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Questions will be generated from selected courses.
                </p>
              </div>

              {/* Prompt */}
              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt for AI Question Generation</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={assessmentForm.prompt}
                  onChange={handleChange}
                  placeholder="Instructions for AI to generate questions"
                  className="min-h-[80px]"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreatingAssessment}>
            Cancel
          </Button>
          <Button 
            onClick={createOrUpdateAssessment} 
            disabled={isCreatingAssessment}
          >
            {isCreatingAssessment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditingAssessment ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDialog;
