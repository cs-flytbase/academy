"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
  onEnroll?: () => void;
  /** Wishlist toggle */
  onToggleWishlist?: () => void;
  /** Initial wishlisted state */
  wishlisted?: boolean;
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
  className,
}: CourseCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-lg overflow-hidden rounded-lg bg-fb-surface-1 text-fb-text-high shadow-lg",
        className
      )}
    >
      {/* THUMBNAIL */}
      <div className="relative aspect-video w-full">
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
        {/* gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-fb-surface-1/80" />
      </div>

      {/* BODY */}
      <CardContent className="space-y-2 p-4">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-fb-text-med line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm">
          {/* META */}
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-fb-text-med">
              <Video className="h-4 w-4" /> {numVideos} videos
            </span>
            <span className="flex items-center gap-1 text-fb-text-med">
              <Clock className="h-4 w-4" /> {duration}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <Button
              onClick={onEnroll}
              className="bg-fb-primary hover:bg-fb-primary-dark text-white"
            >
              Enroll
            </Button>

            <Button
              variant="outline"
              onClick={onToggleWishlist}
              className={cn(
                "border-fb-text-med/20 text-fb-text-med hover:border-fb-primary hover:text-fb-primary",
                wishlisted && "border-fb-accent text-fb-accent"
              )}
            >
              <Heart
                fill={wishlisted ? "currentColor" : "none"}
                className="mr-1 h-4 w-4"
              />
              Wishlist
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCard;
