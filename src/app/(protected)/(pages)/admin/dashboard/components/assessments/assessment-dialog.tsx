"use client";

import React from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
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
  const handleCourseChange = (selectedCourses: string[]) => {
    setAssessmentForm({
      ...assessmentForm,
      courses: selectedCourses,
    });
  };

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
    if (!isEditingAssessment && assessmentForm.courses.length === 0) {
      toast.error("Please select at least one course");
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

        toast.success("Assessment creation request submitted successfully!");

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
                <Label>Select Courses *</Label>
                <MultiSelect
                  options={courses.map(course => ({ label: course.title, value: course.id }))}
                  selected={assessmentForm.courses}
                  onChange={handleCourseChange}
                  placeholder="Select courses..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Questions will be generated from the selected courses.
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
