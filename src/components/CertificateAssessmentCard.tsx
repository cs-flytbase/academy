"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, FileText, Clock, ChevronRight } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  
  // Get difficulty badge styling
  const getDifficultyProps = () => {
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return { 
          bgColor: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30'
        };
      case 'intermediate':
        return { 
          bgColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30'
        };
      case 'advanced':
        return { 
          bgColor: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30'
        };
      case 'expert':
        return { 
          bgColor: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
          textColor: 'text-violet-400',
          borderColor: 'border-violet-500/30'
        };
      default:
        return { 
          bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30'
        };
    }
  };
  
  const difficultyStyle = getDifficultyProps();
  
  // Mouse movement effect for interactive glow
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      className={cn(
        "relative w-full min-h-[330px] rounded-3xl transition-all duration-300 group",
        isHovered ? "scale-[1.01] shadow-2xl" : "shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* SIMPLE BLUE BORDER */}
      <div 
        className="absolute inset-0 rounded-3xl bg-[#3a8dff] p-[1.5px]"
      >
        
        {/* INNER CARD */}
        <Card className="h-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#14171b] to-[#1a1e24] border-0">
          
          {/* INTERACTIVE GLOW EFFECT */}
          <div 
            className="absolute w-[200px] h-[200px] rounded-full blur-3xl bg-[#2C7BF2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              left: `${glowPosition.x - 100}px`,
              top: `${glowPosition.y - 100}px`,
              pointerEvents: 'none'
            }}
          />
          
          {/* DECORATIVE TOP BAR */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2C7BF2] to-transparent" />
          
          <CardContent className="p-8 space-y-8 relative h-full flex flex-col justify-between">
            {/* TOP SECTION */}
            <div className="space-y-6">
              {/* ICON + HEADINGS */}
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] rounded-full blur-md opacity-70 animate-pulse-slow" />
                  <div className="relative bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] rounded-full p-4 shadow-lg">
                    <Award className="h-8 w-8 text-white drop-shadow-md" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-5 bg-gradient-to-r from-[#2C7BF2] to-[#0E61DD]" />
                    <p className="tracking-wide text-xs font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#3a8dff] to-[#0E61DD]">
                      Certificate Assessment
                    </p>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold leading-tight text-white">
                    {courseTitle}
                  </h3>
                </div>
              </div>

              {/* META LINE */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <FileText className="h-4 w-4 text-[#3a8dff]" /> 
                  <span className="text-gray-200">{numQuestions} questions</span>
                </span>
                
                <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <Clock className="h-4 w-4 text-[#3a8dff]" /> 
                  <span className="text-gray-200">{duration}</span>
                </span>
                
                <span className={cn(
                  difficultyStyle.bgColor,
                  difficultyStyle.textColor,
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium border",
                  difficultyStyle.borderColor
                )}>
                  {difficulty}
                </span>
              </div>
            </div>
            
            {/* CTA ROW */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                variant="ghost"
                onClick={onDetails}
                className="flex-1 group/btn text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#3a8dff]/50 transition-all duration-300"
              >
                <span>View Details</span>
                <ChevronRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={onTakeTest}
                className={cn(
                  "flex-1 bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] text-white font-bold text-base",
                  "shadow-lg shadow-blue-900/20 hover:shadow-blue-800/40",
                  "border-0 rounded-xl overflow-hidden relative group/main",
                  "transition-all duration-300 ease-out"
                )}
              >
                <span className="relative z-10">Take the Test</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/main:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 translate-y-full group-hover/main:translate-y-0 transition-transform duration-300" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CertificateAssessmentCard;