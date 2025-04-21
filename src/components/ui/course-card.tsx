"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseCardProps {
  /** Course title */
  title: string;
  /** Short one‑liner description */
  description: string;
  /** Number of videos in the course */
  numVideos: number;
  /** Total watch duration (e.g. "3h 45m") */
  duration: string;
  /** 16×9 thumbnail URL */
  thumbnailSrc: string;
  /** Callback when user clicks the Enroll CTA */
  onEnroll?: (e: React.MouseEvent) => void;
  /** Callback when user toggles wishlist */
  onToggleWishlist?: (e: React.MouseEvent) => void;
  /** Initial wishlisted state */
  wishlisted?: boolean;
  /** Whether the user is already enrolled */
  isEnrolled?: boolean;
  /** External utility to extend className */
  className?: string;
}

export function CourseCard({
  title,
  description,
  numVideos,
  duration,
  thumbnailSrc,
  onEnroll,
  onToggleWishlist,
  wishlisted,
  isEnrolled,
  className,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  
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
        "relative w-full h-[480px] rounded-3xl transition-all duration-300 group overflow-hidden",
        isHovered ? "scale-[1.01] shadow-2xl" : "shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* BORDER with gradient from top to bottom */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#000000] via-[#171d46] to-[#1A6ED0] p-[1.5px]">
        {/* INNER CARD */}
        <Card className="h-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#14171b] to-[#1a1e24] border-0 p-0 flex flex-col ">
          {/* INTERACTIVE GLOW EFFECT */}
          <div 
            className="absolute w-[200px] h-[200px] rounded-full blur-3xl bg-[#2C7BF2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{
              left: `${glowPosition.x - 100}px`,
              top: `${glowPosition.y - 100}px`,
              pointerEvents: 'none'
            }}
          />
          
          {/* THUMBNAIL - Flush with top */}
          <div className="relative w-full h-1/2 overflow-hidden flex-none">
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
            />
            {/* Gradient overlay for better contrast and visual interest */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#14171b]/90" />
            
            {/* Premium effect */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-tr from-[#3a8dff]/30 to-transparent opacity-0",
              isHovered ? "opacity-30" : "opacity-0",
              "transition-opacity duration-300"
            )} />
            
            {/* Stats on top of the thumbnail */}
            <div className="absolute bottom-4 left-4 flex items-center justify-between gap-3 z-20 w-full pr-7">
              <div className="flex items-center gap-0">
              <span className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <Video className="h-3.5 w-3.5 text-[#3a8dff]" /> 
                <span className="text-gray-200 text-xs">{numVideos} videos</span>
              </span>
              <span className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <Clock className="h-3.5 w-3.5 text-[#3a8dff]" />
                <span className="text-gray-200 text-xs">{duration}</span>
              </span>
              </div>
              <div>
              <Button
              variant="ghost"
              onClick={onToggleWishlist}
              className={cn(
                " rounded-full p-2 bg-black/40 backdrop-blur-sm border border-white/10",
                "hover:bg-black/60 hover:border-[#3a8dff]/50 transition-all duration-300",
                wishlisted ? "text-[#ff6b8a]" : "text-white"
              )}
            >
              <Heart 
                fill={wishlisted ? "currentColor" : "none"} 
                className="h-5 w-5" 
              />
            </Button>
              </div>
            </div>
            
            {/* Wishlist button - in top right corner */}
            {/* <Button
              variant="ghost"
              onClick={onToggleWishlist}
              className={cn(
                "absolute top-4 right-4 rounded-full p-2 bg-black/40 backdrop-blur-sm border border-white/10",
                "hover:bg-black/60 hover:border-[#3a8dff]/50 transition-all duration-300",
                wishlisted ? "text-[#ff6b8a]" : "text-white"
              )}
            >
              <Heart 
                fill={wishlisted ? "currentColor" : "none"} 
                className="h-5 w-5" 
              />
            </Button> */}
          </div>

          {/* CONTENT */}
          <CardContent className="px-8 pt-1 pb-1 flex-grow flex flex-col justify-between ">
            {/* Title and description */}
            <div className="space-y-0.5">
              <h3 className="text-xl font-bold leading-tight text-white ">
                {title}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mt-3">
                {description}
              </p>
            </div>
          </CardContent>
          
          {/* FOOTER - Always at bottom */}
          <CardFooter className="px-7 pb-5 pt-0 mt-auto">
            <Button
              onClick={onEnroll}
              disabled={isEnrolled}
              className={cn(
                "w-full py-2 rounded-xl font-bold text-sm",
                isEnrolled
                  ? "bg-gradient-to-r from-[#FA8500] to-[#FFAB49] text-white cursor-not-allowed"
                  : "bg-gradient-to-br from-[#3a8dff] to-[#0E61DD] text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-800/40 relative overflow-hidden group/btn"
              )}
            >
              {isEnrolled ? (
                <span className="flex items-center justify-center gap-2">
                  Enrolled <ChevronRight className="h-4 w-4" />
                </span>
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center">Enroll Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default CourseCard;