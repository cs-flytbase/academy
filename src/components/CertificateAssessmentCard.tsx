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
        "relative w-full min-h-[280px] md:min-h-[330px] rounded-3xl transition-all duration-300 group",
        isHovered ? "scale-[1.01] shadow-2xl" : "shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* SIMPLE BLUE BORDER */}
      <div 
        className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#000000] via-[#1A6ED0] to-[#1A6ED0] p-[1.5px]"
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
          
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 relative h-full flex flex-col justify-between">
            {/* TOP SECTION */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* ICON + HEADINGS */}
              <div className="flex items-start gap-3 md:gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] rounded-full blur-md opacity-70 animate-pulse-slow" />
                  <div className="relative bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] rounded-full p-3 md:p-4 shadow-lg">
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-md" />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-5 bg-gradient-to-r from-[#2C7BF2] to-[#0E61DD]" />
                    <p className="tracking-wide text-xs font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#3a8dff] to-[#0E61DD] whitespace-nowrap">
                      Certificate Assessment
                    </p>
                  </div>
                  <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white line-clamp-2">
                    {courseTitle}
                  </h3>
                </div>
              </div>

              {/* META LINE */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 bg-white/5 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                  <FileText className="h-3 w-3 text-[#3a8dff]" /> 
                  <span className="text-gray-200 whitespace-nowrap">{numQuestions} questions</span>
                </span>
                
                <span className="flex items-center gap-1 bg-white/5 backdrop-blur-sm px-2 py-1 rounded-xl border border-white/10">
                  <Clock className="h-3 w-3 text-[#3a8dff]" /> 
                  <span className="text-gray-200 whitespace-nowrap">{duration}</span>
                </span>
                
                <span className={cn(
                  difficultyStyle.bgColor,
                  difficultyStyle.textColor,
                  "flex items-center gap-1 px-2 py-1 rounded-xl font-medium border text-xs",
                  difficultyStyle.borderColor
                )}>
                  {difficulty}
                </span>
              </div>
            </div>
            
            {/* CTA ROW */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={onDetails}
                className="flex-1 group/btn text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-[#3a8dff]/50 transition-all duration-300 text-xs px-3 py-2.5 h-9"
              >
                <span>View Details</span>
                <ChevronRight className="ml-1 h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={onTakeTest}
                className={cn(
                  "flex-1 bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] text-white font-bold text-xs",
                  "shadow-lg shadow-blue-900/20 hover:shadow-blue-800/40",
                  "border-0 rounded-xl overflow-hidden relative group/main px-3 py-2.5 h-9",
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