"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, Heart } from "lucide-react";
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
  /** Wishlist toggle */
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
  return (
    <Card
      className={cn(
        "w-full h-96 overflow-hidden rounded-lg flex flex-col gap-0 bg-[#191C20] text-fb-text-high shadow-lg pt-0 pb-2",
        className
      )}    
    >
      {/* THUMBNAIL */}
      <div className="relative w-full h-1/2 overflow-hidden">
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover "
          sizes="(max-width: 640px) 100vw, 640px"
        />
        {/* gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-fb-surface-1/80" />
      </div>

      {/* BODY */}
      <CardContent className="flex-grow space-y-1 p-3">
        <h3 className="text-base font-medium leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-fb-text-med line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-4 text-xs text-fb-text-med">
          <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {numVideos}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {duration}</span>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            onClick={onToggleWishlist}
            className={cn(
              "text-fb-text-med hover:text-fb-primary",
              wishlisted && "text-fb-accent"
            )}
          >
            <Heart fill={wishlisted ? "currentColor" : "none"} className="h-4 w-4" />
          </Button>
          <Button
            onClick={onEnroll}
            disabled={isEnrolled}
            className={cn(
              isEnrolled
                ? "bg-fb-accent-strong border border-fb-accent-strong text-white cursor-not-allowed"
                : "bg-gradient-to-r from-[#AABDFF] to-[#2C7BF2] border border-[#2C7BF2] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300 ease-in-out"
            )}
          >
            {isEnrolled ? "Enrolled" : "Enroll"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default CourseCard;
