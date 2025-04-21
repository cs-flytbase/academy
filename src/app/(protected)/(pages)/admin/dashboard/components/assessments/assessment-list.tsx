"use client";

import React from "react";
import { Assessment } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Clock, CheckCircle, ListChecks } from "lucide-react";
import Link from "next/link";

interface AssessmentListProps {
  assessments: Assessment[];
  onEditAssessment: (assessment: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
  loading: boolean;
}

const AssessmentList: React.FC<AssessmentListProps> = ({
  assessments,
  onEditAssessment,
  onDeleteAssessment,
  loading,
}) => {
  if (loading) {
    return <div className="py-4">Loading assessments...</div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No assessments found. Click "Add Assessment" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="border rounded-lg p-4 hover:bg-muted/40 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {assessment.number_of_questions && (
                  <Badge variant="outline">
                    {assessment.number_of_questions} questions
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {assessment.time_limit} min
                </Badge>
                {assessment.passing_percentage && (
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {assessment.passing_percentage}% to pass
                  </Badge>
                )}
              </div>
              <h4 className="font-medium">{assessment.title}</h4>
              {assessment.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {assessment.description}
                </p>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              {/* Manage Questions button - navigates to questions page */}
              <Link href={`/admin/assessment-questions/${assessment.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Manage Questions"
                >
                  <ListChecks className="h-4 w-4" />
                </Button>
              </Link>
              {/* Edit Assessment button - redirects to questions page */}
              <Link href={`/admin/assessment-questions/${assessment.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit Assessment"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              {/* Delete Assessment button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteAssessment(assessment.id)}
                title="Delete Assessment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentList;
