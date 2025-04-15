"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, BarChart } from "lucide-react";
import Link from "next/link";

// If you don't have a custom type, you can use "any" or create an interface:
interface Assessment {
  id: number;
  title: string;
  description: string | null;
  timeLimit: number | null;
  difficulty: string | null;
  thumbnail: string | null;
  category?: string | null; // If not in DB, remove or default
  questions?: any[]; // If you want to display question count
}

interface AssignmentCardProps {
  assignment: Assessment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const {
    id,
    title,
    description,
    timeLimit,
    difficulty,
    thumbnail,
    category,
    questions,
  } = assignment;

  // Fallback thumbnail
  const getBgImage = () =>
    thumbnail ||
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80";

  // Difficulty color styling
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "hard":
        return "bg-rose-500";
      default:
        return "bg-blue-500"; // default if difficulty is missing
    }
  };

  return (
    <Link href={`/assignment/${id}`}>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg border border-border/50 h-full">
        {/* Thumbnail */}
        <div
          className="h-48 w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${getBgImage()})` }}
        />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {category ?? "General"}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full text-white ${getDifficultyColor()}`}
            >
              {difficulty ?? "N/A"}
            </span>
          </div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{timeLimit ?? 0} minutes</span>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <BarChart className="mr-1 h-4 w-4" />
              <span>{questions?.length ?? 0} questions</span>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              Start Test
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AssignmentCard;
