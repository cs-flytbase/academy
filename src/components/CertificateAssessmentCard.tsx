"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CertificateAssessmentCardProps {
  courseTitle: string;
  numQuestions: number;
  duration: string;
  difficulty: string;
  onTakeTest?: () => void;
  onDetails?: () => void;
  className?: string;
}

export function CertificateAssessmentCard({
  courseTitle,
  numQuestions,
  duration,
  difficulty,
  onTakeTest,
  onDetails,
  className,
}: CertificateAssessmentCardProps) {
  return (
    <div
      className={cn(
        "w-full min-h-[260px] rounded-3xl border-2 border-[#2C7BF2] p-[1px] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_theme(colors.fb-primary)] focus-within:shadow-[0_0_0_2px_theme(colors.fb-primary)]",
        className,
      )}
    >
      <Card className="rounded-[inherit] border border-white/10 bg-[#191C20] text-fb-text-high">
        <CardContent className="p-6 space-y-4">
          {/* ICON + HEADINGS */}
          <div className="flex items-start gap-4">
            <Award className="h-12 w-12 flex-shrink-0 text-fb-primary" />
            <div>
              <p className="tracking-wide text-sm font-medium uppercase text-fb-text-med">
                Certificate Assessment
              </p>
              <h3 className="mt-1 text-2xl font-semibold leading-tight">
                {courseTitle}
              </h3>
            </div>
          </div>

          {/* META LINE */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fb-text-med">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" /> {numQuestions} questions
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-fb-text-med sm:inline-block" />
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {duration}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-fb-text-med sm:inline-block" />
            <span>{difficulty}</span>
          </div>

          {/* CTA ROW */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={onDetails}
              className="flex-1 text-fb-text-med hover:text-fb-primary bg-transparent border-none shadow-none px-0"
            >
              Details
            </Button>
            <Button
              onClick={onTakeTest}
              className="flex-1 border-2 border-fb-primary bg-[#0E61DD] text-white font-semibold text-base shadow-md hover:bg-[#0E61DD]/90 focus:ring-2 focus:ring-[#0E61DD]/60 focus:outline-none transition-all py-3 rounded-full"
              style={{ minWidth: 0 }}
            >
              Take the Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CertificateAssessmentCard;
