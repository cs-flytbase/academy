"use client";
import confetti from "canvas-confetti";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import YouTubeEmbed from "@/components/ui-custom/YouTubeEmbed";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Menu,
  ArrowRight,
  AlignLeft,
  List,
  LayoutList,
  Link as LinkIcon,
  X,
  Play,
  ChevronLeft,
} from "lucide-react";

interface Video {
  id: number;
  title: string;
  youtube_video_id: string;
  about: string | null;
  thumbnail: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
}

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

const CourseDetail = () => {
  // Add this state variable
  const [videoProgressMap, setVideoProgressMap] = useState({});
  // Add these new state variables at the beginning of your component
  const [user, setUser] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [previousAnswers, setPreviousAnswers] = useState({});
  const { course } = useParams();
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<{ [key: number]: Option[] }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number | null;
  }>({});
  const [completedVideos, setCompletedVideos] = useState<Set<number>>(
    new Set()
  );
  const [quizResults, setQuizResults] = useState<{
    shown: boolean;
    score: number;
    total: number;
  }>({ shown: false, score: 0, total: 0 });
  const [tableOfContentsVisible, setTableOfContentsVisible] = useState(false);
  // New state for the lesson completed modal
  const [lessonCompletedModal, setLessonCompletedModal] = useState(false);
  // New state for the progress percentage
  const [progressPercentage, setProgressPercentage] = useState(0);
  // Add this near your other state variables
  const [initialVideoLoaded, setInitialVideoLoaded] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const shootRealisticConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { x: 0.5, y: 0.5 },
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const shootFireworks = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const shootCash = () => {
    const scalar = 2;
    const cash = confetti.shapeFromText({ text: "💸", scalar });
    const money = confetti.shapeFromText({ text: "💰", scalar });

    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [cash, money],
      scalar,
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 30,
      });

      confetti({
        ...defaults,
        particleCount: 5,
        flat: true,
      });

      confetti({
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };
  const handleConfetti = () => {
    // your other functions here
    shootCash();
  };
  // Add this function to your component
  const findLastWatchedVideoIndex = (progressMap, videos) => {
    // First try to find any video in progress (not completed, but has progress)
    for (let i = videos.length - 1; i >= 0; i--) {
      const videoId = videos[i].id;
      const progress = progressMap[videoId] || 0;
      const isCompleted = completedVideos.has(videoId);

      // If it has progress but is not completed, return this one
      if (progress > 0 && progress < 90 && !isCompleted) {
        return i;
      }
    }

    // If no in-progress video found, find the latest completed video
    // and return the one after it (if any)
    let lastCompletedIndex = -1;
    for (let i = 0; i < videos.length; i++) {
      if (completedVideos.has(videos[i].id)) {
        lastCompletedIndex = i;
      }
    }

    // If we found a completed video and it's not the last one,
    // return the next one
    if (lastCompletedIndex >= 0 && lastCompletedIndex < videos.length - 1) {
      return lastCompletedIndex + 1;
    }

    // If no progress at all, or all videos completed, return the first video
    return 0;
  };
  useEffect(() => {
    const fetchAllVideoProgress = async () => {
      if (!user || !videos.length) return;

      const supabase = createClient();

      // Fetch progress for all videos in this course
      const { data } = await supabase
        .from("video_watched")
        .select("*")
        .eq("user_id", user.id)
        .in(
          "video_id",
          videos.map((v) => v.id)
        );

      if (data && data.length > 0) {
        const progressMap = {};
        const completed = new Set<number>();

        data.forEach((item) => {
          progressMap[item.video_id] = item.progress_percentage || 0;

          if (item.completed) {
            completed.add(item.video_id);
          }
        });

        setVideoProgressMap(progressMap);
        setCompletedVideos(completed);

        // Only set the initial video based on progress if we haven't done it yet
        if (!initialVideoLoaded) {
          const bestVideoIndex = findLastWatchedVideoIndex(progressMap, videos);
          setCurrentVideoIndex(bestVideoIndex);
          setInitialVideoLoaded(true);
        }
      }
    };

    if (user && videos.length > 0) {
      fetchAllVideoProgress();
    }
  }, [user, videos, initialVideoLoaded]);
  // Add this useEffect to fetch user and progress data
  useEffect(() => {
    const fetchUserAndProgress = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user && currentVideo) {
        // Fetch video progress
        const { data: videoData } = await supabase
          .from("video_watched")
          .select("*")
          .eq("user_id", user.id)
          .eq("video_id", currentVideo.id)
          .single();

        if (videoData) {
          // If video was already completed, add to completedVideos set
          if (videoData.completed) {
            setLastPosition(0); // Start from beginning for completed videos
            setVideoProgress(100); // Keep progress at 100%

            setCompletedVideos((prev) => {
              const newSet = new Set(prev);
              newSet.add(currentVideo.id);
              return newSet;
            });
          } else {
            setLastPosition(videoData.last_position_seconds || 0);
            setVideoProgress(videoData.progress_percentage || 0);
          }
        }

        // Also fetch all completed videos for this course
        const { data: completedVideosData } = await supabase
          .from("video_watched")
          .select("video_id")
          .eq("user_id", user.id)
          .eq("completed", true)
          .in(
            "video_id",
            videos.map((v) => v.id)
          );

        if (completedVideosData && completedVideosData.length > 0) {
          const completedIds = new Set(
            completedVideosData.map((v) => v.video_id)
          );
          setCompletedVideos(completedIds);
        }
      }
    };

    fetchUserAndProgress();
  }, [currentVideo]); // Make this depend on currentVideo so it refetches when video changes

  useEffect(() => {
    const fetchCourse = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", course);
      return data;
    };
    fetchCourse().then((data) => {
      if (data && data.length > 0) {
        setCourseTitle(data[0].title);
        console.log("courseTitle:", data[0].title);
      }
    });
  }, [course]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!course) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, youtube_video_id, about, thumbnail")
        .eq("course_id", course);

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data);
        // We'll set currentVideoIndex after we have the progress data
        // Just set the default to the first video for now
        setCurrentVideo(data[0] || null);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [course]);

  // Update current video when video index changes
  useEffect(() => {
    if (videos.length > 0) {
      setCurrentVideo(videos[currentVideoIndex]);
      // Reset quiz related states when switching videos
      setSelectedAnswers({});
      setQuestions([]);
      setOptions({});
      setQuizResults({ shown: false, score: 0, total: 0 });
      // Reset description expanded state
      setDescriptionExpanded(false);

      // Fetch questions for the video immediately
      if (videos[currentVideoIndex]) {
        fetchQuestionsForVideo(videos[currentVideoIndex].id);
      }
    }
  }, [currentVideoIndex, videos]);

  // Update progress percentage whenever completedVideos changes
  useEffect(() => {
    if (videos.length > 0) {
      const percentage = (completedVideos.size / videos.length) * 100;
      setProgressPercentage(percentage);
    }
  }, [completedVideos, videos]);

  // Close TOC when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tocRef.current &&
        !tocRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-menu-toggle]")
      ) {
        setTableOfContentsVisible(false);
      }
    };

    // Close TOC when pressing Escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTableOfContentsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);
  const fetchQuestionsForVideo = async (videoRowId: number) => {
    const supabase = createClient();

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("id, question_text, question_type")
      .eq("video_id", videoRowId)
      .eq("after_videoend", true);

    if (questionError) {
      console.error("Error fetching questions:", questionError);
      return;
    }

    setQuestions(questionData);

    const optionsMap: { [key: number]: Option[] } = {};

    for (const question of questionData) {
      const { data: optionsData, error: optionsError } = await supabase
        .from("question_options")
        .select("id, option_text, is_correct")
        .eq("question_id", question.id);

      if (optionsError) {
        console.error(
          `Error fetching options for question ${question.id}:`,
          optionsError
        );
        continue;
      }

      optionsMap[question.id] = optionsData;
    }

    setOptions(optionsMap);

    // If user is logged in, fetch previous answers
    if (user) {
      const previousAnswersMap = {};

      for (const question of questionData) {
        const { data: answerData } = await supabase
          .from("user_answers")
          .select("selected_option_id")
          .eq("user_id", user.id)
          .eq("question_id", question.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (answerData && answerData.length > 0) {
          previousAnswersMap[question.id] = answerData[0].selected_option_id;
        }
      }

      setPreviousAnswers(previousAnswersMap);

      // Pre-fill answers if we have previous ones
      if (Object.keys(previousAnswersMap).length > 0) {
        setSelectedAnswers(previousAnswersMap);
      }
    }
  };
  const updateVideoProgress = async (currentTime, duration) => {
    if (!user || !currentVideo) return;

    // Check if the video is already completed
    const isAlreadyCompleted = completedVideos.has(currentVideo.id);

    // Calculate progress percentage
    const progressPercentage = Math.floor((currentTime / duration) * 100);
    // Consider video completed if watched >90%
    const completed = progressPercentage > 90 || isAlreadyCompleted;

    // Update the progress map (but keep at 100 if already completed)
    setVideoProgressMap((prev) => ({
      ...prev,
      [currentVideo.id]: isAlreadyCompleted ? 100 : progressPercentage,
    }));

    // Only update database every 5 seconds or on significant progress changes
    // But skip the update entirely if it's already completed
    if (
      !isAlreadyCompleted &&
      (Math.abs(progressPercentage - videoProgress) > 5 ||
        Math.abs(currentTime - lastPosition) > 5)
    ) {
      setVideoProgress(progressPercentage);
      setLastPosition(currentTime);

      const supabase = createClient();

      await supabase.from("video_watched").upsert(
        {
          user_id: user.id,
          video_id: currentVideo.id,
          progress_percentage: progressPercentage,
          last_position_seconds: Math.floor(currentTime),
          completed: completed,
          watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,video_id",
        }
      );

      // If completed and not already in the set, update the completedVideos set
      if (completed && !completedVideos.has(currentVideo.id)) {
        setCompletedVideos((prev) => {
          const newSet = new Set(prev);
          newSet.add(currentVideo.id);
          return newSet;
        });
      }
    }
  };
  // const fetchQuestionsForVideo = async (videoRowId: number) => {
  //   const supabase = createClient();

  //   const { data: questionData, error: questionError } = await supabase
  //     .from("questions")
  //     .select("id, question_text, question_type")
  //     .eq("video_id", videoRowId)
  //     .eq("after_videoend", true);

  //   if (questionError) {
  //     console.error("Error fetching questions:", questionError);
  //     return;
  //   }

  //   setQuestions(questionData);

  //   const optionsMap: { [key: number]: Option[] } = {};

  //   for (const question of questionData) {
  //     const { data: optionsData, error: optionsError } = await supabase
  //       .from("question_options")
  //       .select("id, option_text, is_correct")
  //       .eq("question_id", question.id);

  //     if (optionsError) {
  //       console.error(
  //         `Error fetching options for question ${question.id}:`,
  //         optionsError
  //       );
  //       continue;
  //     }

  //     optionsMap[question.id] = optionsData;
  //   }

  //   setOptions(optionsMap);
  // };

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const isQuizComplete = () => {
    return (
      questions.length > 0 &&
      questions.every((q) => selectedAnswers[q.id] != null)
    );
  };

  const handleQuizSubmit = async () => {
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      if (!selectedOptionId) return;
      const correctOption = options[question.id]?.find((o) => o.is_correct);
      if (correctOption && correctOption.id === selectedOptionId) {
        correctCount++;
      }
    });

    setQuizResults({
      shown: true,
      score: correctCount,
      total: totalQuestions,
    });

    // Save answers to database if user is logged in
    if (user) {
      const supabase = createClient();

      // Prepare answers for insertion
      const answersToInsert = [];

      for (const [questionId, optionId] of Object.entries(selectedAnswers)) {
        answersToInsert.push({
          user_id: user.id,
          question_id: parseInt(questionId),
          selected_option_id: optionId,
          created_at: new Date().toISOString(),
        });
      }

      // Insert answers
      if (answersToInsert.length > 0) {
        const { error } = await supabase
          .from("user_answers")
          .insert(answersToInsert);

        if (error) {
          console.error("Error saving quiz answers:", error);
        }
      }

      // Mark video as completed and quiz as taken
      const { error: watchedError } = await supabase
        .from("video_watched")
        .upsert(
          {
            user_id: user.id,
            video_id: currentVideo.id,
            progress_percentage: 100,
            completed: true,
            quiz_taken: true, // Set quiz_taken to true
            watched_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,video_id", // This ensures upsert works on this composite key
          }
        );

      if (watchedError) {
        console.error("Error updating video watched status:", watchedError);
      }
    }
  };

  // Update your handleVideoSelect function to fetch the last position for the selected video
  // Update your handleVideoSelect function to check completed status
  const handleVideoSelect = async (index: number) => {
    setCurrentVideoIndex(index);
    const selectedVideo = videos[index];

    // Reset position until we fetch the correct one
    setLastPosition(0);

    // If user is logged in, fetch their progress for this specific video
    if (user && selectedVideo) {
      const supabase = createClient();
      const { data } = await supabase
        .from("video_watched")
        .select("*")
        .eq("user_id", user.id)
        .eq("video_id", selectedVideo.id)
        .single();

      if (data) {
        // Check if the video is completed
        if (data.completed) {
          // For completed videos, start from the beginning
          setLastPosition(0);
          setVideoProgress(100); // Keep progress at 100%
        } else {
          // For in-progress videos, start from the last position
          setLastPosition(data.last_position_seconds || 0);
          setVideoProgress(data.progress_percentage || 0);
        }
      } else {
        // No progress for this video yet
        setLastPosition(0);
        setVideoProgress(0);
      }
    }
  };

  // Modified to mark video as completed and show the completion modal
  const handleVideoEnd = async () => {
    shootRealisticConfetti();

    if (currentVideo && user) {
      // Mark video as completed in database
      const supabase = createClient();

      await supabase.from("video_watched").upsert(
        {
          user_id: user.id,
          video_id: currentVideo.id,
          progress_percentage: 100,
          completed: true,
          watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,video_id",
        }
      );

      // Update local state
      setCompletedVideos((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentVideo.id);
        return newSet;
      });
    }

    // Show the lesson completed modal
    setLessonCompletedModal(true);
  };

  const handleQuizComplete = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
    // Reset the quiz results
    setQuizResults({ shown: false, score: 0, total: 0 });
    // Collapse the quiz section
    setQuizExpanded(false);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizResults({ shown: false, score: 0, total: 0 });
  };

  const getProgressPercentage = () => {
    if (videos.length === 0) return 0;
    return (completedVideos.size / videos.length) * 100;
  };

  const toggleTableOfContents = () => {
    setTableOfContentsVisible(!tableOfContentsVisible);
  };

  // Function to close the lesson completed modal and move to the next lesson
  const handleNextLesson = () => {
    setLessonCompletedModal(false);
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // Function to close the lesson completed modal and open the quiz
  const handleOpenQuiz = () => {
    setLessonCompletedModal(false);
    setQuizExpanded(true);
  };

  // Function to close the lesson completed modal and stay on the same page
  const handleStayOnPage = () => {
    setLessonCompletedModal(false);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">
            Loading course content...
          </p>
        </div>
      </div>
    );
  }

  if (!videos.length || !currentVideo) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12 ">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">
            No videos found for this course
          </h1>
          <p className="text-muted-foreground mb-6">
            The course you're looking for might not have any content yet.
          </p>
          <Button asChild>
            <Link href="/course">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  const CircularProgress = ({
    progress = 0,
    completed = false,
    isActive = false,
    videoNumber = "", // Add this prop to replace index
  }) => {
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-8 h-8 absolute top-0 left-0">
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke="#333"
            strokeWidth="2"
            fill="transparent"
          />
        </svg>

        {/* Progress circle */}
        <svg className="w-8 h-8 absolute top-0 left-0 -rotate-90">
          <circle
            cx="16"
            cy="16"
            r={radius}
            stroke={
              completed
                ? "#10b981" // green
                : isActive
                ? "#2C7BF2" // blue
                : "#64748b" // gray
            }
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Icon in the center */}
        <div className=" z-10">
          {
            completed ? (
              <CheckCircle className="w-4 h-4 text-green-400 flex justify-center items-center" />
            ) : isActive ? (
              <Play className="w-4 h-4 text-[#2C7BF2]" />
            ) : (
              <span className="w-4 h-4 flex justify-center items-center text-xs font-medium text-gray-400">
                {videoNumber}
              </span>
            )
            //  progress > 0 ? (
            //   <span className="text-xs font-medium text-gray-400">
            //     {Math.round(progress)}%
            //   </span>
            // ) : (
            //   <span className="text-xs font-medium text-gray-400">
            //     {videoNumber}
            //   </span>
            // )
          }
        </div>
      </div>
    );
  };
  const NextVideoComponent = ({ nextVideo, onContinue }) => {
    if (!nextVideo) return null;

    return (
      <div className="w-full bg-[#6b5de4] text-white p-6 rounded-lg my-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-medium mb-1">Next lesson</span>
            <h3 className="text-2xl font-bold">{nextVideo.title}</h3>
          </div>

          <Button
            onClick={onContinue}
            className="bg-white hover:bg-white/90 text-[#6b5de4] px-6 py-5 rounded-lg h-auto"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Continue
          </Button>
        </div>
      </div>
    );
  };

  // Add this component to your main component
  // You can place this after the video description section and before the quiz section

  // In your main component, add code to determine the next video:
  const nextVideo =
    currentVideoIndex < videos.length - 1
      ? videos[currentVideoIndex + 1]
      : null;

  // Then render the component (place this where you want it to appear in the UI):
  {
    nextVideo && (
      <NextVideoComponent
        nextVideo={nextVideo}
        onContinue={() => {
          handleVideoSelect(currentVideoIndex + 1);
        }}
      />
    );
  }
  const VideoNavigation = ({
    videos,
    currentVideoIndex,
    handleVideoSelect,
    // courseTitle,
  }) => {
    // Get video number for display (e.g., "02")
    const videoNumber = String(currentVideoIndex + 1).padStart(2, "0");

    return (
      <div className="bg-[#6b5de4] text-white py-6 px-4 flex items-center justify-between w-full rounded-b-3xl mt-1">
        {/* Previous arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            currentVideoIndex > 0 && handleVideoSelect(currentVideoIndex - 1)
          }
          disabled={currentVideoIndex === 0}
          className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Center content with number, title and difficulty */}
        <div className="flex flex-col items-center">
          <div className="text-xl font-medium mb-1">{videoNumber}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            {videos[currentVideoIndex]?.title || ""}
          </h2>
          <div className="flex items-center gap-2 pb-2">
            {/* <span className="text-sm">Difficulty</span>
            <Badge className="bg-white text-[#6b5de4] hover:bg-white/90 font-medium px-3">
              Easy
            </Badge> */}
          </div>
        </div>

        {/* Next arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            currentVideoIndex < videos.length - 1 &&
            handleVideoSelect(currentVideoIndex + 1)
          }
          disabled={currentVideoIndex === videos.length - 1}
          className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  // Function to truncate description for preview
  const getTruncatedDescription = (text: string | null, maxLength = 100) => {
    if (!text) return "No description available";
    return text.length > maxLength && !descriptionExpanded
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Extract the chapter name from the first video title
  const getChapterName = () => {
    const firstVideoTitle = videos[0]?.title || "";
    const parts = firstVideoTitle.split(" - ");
    if (parts.length > 1) {
      return parts[0];
    }
    return "Chapter";
  };

  // Animation variants for the table of contents
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Animation variants for menu items
  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-14">
      {/* Lesson Completed Modal */}
      <AnimatePresence>
        {lessonCompletedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 text-center relative">
                <button
                  onClick={handleStayOnPage}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold mb-1">Lesson completed 🙌</h2>
                <div className="flex justify-center items-center mt-6 mb-4">
                  <div className="w-full max-w-sm bg-gray-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-[#0E61DD] to-[#2C7BF2]"
                    />
                  </div>
                  <span className="ml-3 text-sm text-gray-400">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  In order to get your {courseTitle} Journey certificate, you'll
                  have to complete each lesson quiz.
                </p>
                <p className="text-sm text-gray-400">
                  You can answer the questions now or later from your{" "}
                  <span className="text-blue-400">Account</span> page.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col p-4 gap-3">
                <Button
                  onClick={handleOpenQuiz}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4M12 8h.01"></path>
                  </svg>
                  Answer the quiz
                </Button>

                <div className="flex">
                  <Button
                    onClick={handleStayOnPage}
                    variant="outline"
                    className="flex-1 mr-2 border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Stay on this page
                  </Button>
                  <Button
                    onClick={handleNextLesson}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    Next lesson
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table of Contents Sidebar with animated toggle button */}
      <motion.div
        initial={{ x: -392 }}
        animate={{ x: tableOfContentsVisible ? 0 : -392 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed top-20 left-2 bottom-16 z-50 flex"
      >
        {/* Table of Contents Panel */}
        <div
          ref={tocRef}
          className="bg-[#121212] border-r border-gray-800 shadow-lg w-96 h-full overflow-hidden flex flex-col rounded-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-[#1A1A1A] rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-[#2C7BF2]  tracking-wide">
                <p className="text-sm font-bold text-white mt-1">Course</p>{" "}
                {courseTitle}
              </h2>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="overflow-y-auto flex-1 overflow-auto scrollbar-hide bg-black">
            {videos.map((video, index) => {
              const isCurrent = currentVideoIndex === index;
              const isCompleted = completedVideos.has(video.id);
              const progress = videoProgressMap[video.id] || 0;

              return (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(index)}
                  className={`
        relative cursor-pointer transition-colors 
        ${isCurrent ? "bg-[#2C7BF2]/30" : "hover:bg-gray-800/50"}
      `}
                >
                  {/* Purple highlight bar for current video */}
                  {isCurrent && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2C7BF2] rounded-r-sm" />
                  )}

                  <div className="flex items-center justify-between p-3">
                    {/* Left: Icon + Title */}
                    <div className="flex items-center space-x-3">
                      <CircularProgress
                        progress={progress}
                        completed={isCompleted}
                        isActive={isCurrent}
                        videoNumber={String(index + 1).padStart(2, "0")}
                      />

                      <p
                        className={`font-medium text-sm
              ${
                isCurrent
                  ? "text-white"
                  : isCompleted
                  ? "text-gray-300"
                  : "text-gray-300"
              }
            `}
                      >
                        {String(index + 1).padStart(2, "0")}.{" "}
                        {video.title.split(" - ").pop() || video.title}
                      </p>
                    </div>

                    {/* Right: Time + Badges */}
                    <div className="flex items-center space-x-2">
                      {/* {progress > 0 && progress < 90 && !isCompleted && (
                        <span className="text-xs text-gray-400">
                          quiz pending
                        </span>
                      )} */}
                      {/* <Badge>quiz pending</Badge> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggle Button that moves with the Table of Contents */}
        <motion.button
          data-menu-toggle
          onClick={toggleTableOfContents}
          className="absolute top-5 right-[-24] transform translate-x-1/2
                bg-[#242424] rounded-r-xl border border-l-0 border-gray-800
                hover:bg-gray-800 transition-colors h-12 w-12
                flex items-center justify-center focus:outline-none"
        >
          {tableOfContentsVisible ? (
            <ArrowLeft className="h-5 w-5 text-gray-300 cursor-pointer" />
          ) : (
            <Menu className="h-5 w-5 text-gray-300 cursor-pointer" />
          )}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="w-full  flex flex-col justify-center items-center">
        {/* Main Content Area */}
        <div className=" w-full mx-auto  ">
          {/* Video Section */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full relative rounded-lg overflow-hidden flex justify-center ">
              <div className="aspect-video w-full bg-black overflow-hidden max-h-[80vh] flex">
                {/* <YouTubeEmbed
                  videoId={currentVideo.youtube_video_id}
                  onVideoEnd={handleVideoEnd}
                  // progressGradient="from-purple-600 via-indigo-500 to-pink-500"
                  // progressGradient="from-blue-600 to-cyan-400"
                  // autoplay={true}
                /> */}
                <YouTubeEmbed
                  videoId={currentVideo.youtube_video_id}
                  onVideoEnd={handleVideoEnd}
                  onProgressUpdate={updateVideoProgress}
                  initialPosition={lastPosition}
                />
              </div>
            </div>

            {/* <div className="mt-6 flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0 w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {currentVideo.title}
                </h2>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={() =>
                    currentVideoIndex > 0 &&
                    handleVideoSelect(currentVideoIndex - 1)
                  }
                  disabled={currentVideoIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0E61DD] hover:bg-[#2C7BF2] text-white"
                  onClick={() =>
                    currentVideoIndex < videos.length - 1 &&
                    handleVideoSelect(currentVideoIndex + 1)
                  }
                  disabled={currentVideoIndex === videos.length - 1}
                >
                  <span>Next lesson</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div> */}
            <div className=" ">
              {/* <div className="w-5xl"> */}
              <VideoNavigation
                videos={videos}
                currentVideoIndex={currentVideoIndex}
                handleVideoSelect={handleVideoSelect}
              />
              {currentVideo.about && (
                <div className="mt-4 bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300">
                        {getTruncatedDescription(currentVideo.about)}
                      </p>
                    </div>
                  </div>
                  {currentVideo.about && currentVideo.about.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-[#0E61DD] hover:text-[#2C7BF2] hover:bg-gray-800/50"
                      onClick={() =>
                        setDescriptionExpanded(!descriptionExpanded)
                      }
                    >
                      {descriptionExpanded ? (
                        <>
                          Show Less <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
              {/* </div> */}
            </div>
          </motion.div>
          <div className="  mx-28">
            {/* Quiz Section */}
            {questions.length > 0 && (
              <motion.div
                className="mt-8 rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/30"
                  onClick={() => setQuizExpanded(!quizExpanded)}
                >
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <span>Video Quiz</span>
                      <Badge className="ml-2 bg-#2C7BF2 text-white border-none">
                        {questions.length} questions
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Test your understanding of the video content
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: quizExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {quizExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {quizResults.shown ? (
                        <div className="p-6 border-t border-gray-800">
                          <div className="flex flex-col items-center text-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", damping: 15 }}
                              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                                quizResults.score === quizResults.total
                                  ? "bg-green-900/30 text-green-400"
                                  : quizResults.score >= quizResults.total / 2
                                  ? "bg-amber-900/30 text-amber-400"
                                  : "bg-red-900/30 text-red-400"
                              }`}
                            >
                              <span className="text-3xl font-bold">
                                {quizResults.score}/{quizResults.total}
                              </span>
                            </motion.div>
                            <h3 className="text-xl font-bold mb-2 text-white">
                              Quiz Results
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                              {quizResults.score === quizResults.total
                                ? "Perfect score! You've mastered this section."
                                : quizResults.score >= quizResults.total / 2
                                ? "Good job! You're making progress."
                                : "Keep learning. Review the video and try again."}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                              <Button
                                variant="outline"
                                onClick={handleResetQuiz}
                                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                              >
                                Try Again
                              </Button>
                              <Button
                                onClick={handleQuizComplete}
                                className="bg-[#0E61DD] hover:bg-[#2C7BF2]"
                              >
                                {currentVideoIndex < videos.length - 1
                                  ? "Next Video"
                                  : "Complete Course"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 sm:p-6 border-t border-gray-800 space-y-6">
                            {questions.map((question, qIndex) => (
                              <motion.div
                                key={question.id}
                                className="space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * qIndex }}
                              >
                                <h3 className="font-medium flex gap-2 text-white">
                                  <span className="bg-[#0E61DD]/50 text-[#2C7BF2] rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                                    {qIndex + 1}
                                  </span>
                                  <span>{question.question_text}</span>
                                </h3>
                                <div className="ml-8 space-y-2">
                                  {options[question.id] &&
                                    options[question.id].map(
                                      (option, oIndex) => (
                                        <motion.div
                                          key={option.id}
                                          onClick={() =>
                                            handleAnswerSelect(
                                              question.id,
                                              option.id
                                            )
                                          }
                                          className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-all 
        ${
          selectedAnswers[question.id] === option.id
            ? "border-[#0E61DD] bg-[#2C7BF2]/20"
            : "border-gray-700 hover:border-[#0E61DD]/50 bg-gray-800/30"
        } 
        ${
          previousAnswers[question.id] === option.id && !quizResults.shown
            ? "ring-1 ring-[#0E61DD]/50"
            : ""
        }`}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{
                                            delay: 0.1 * qIndex + 0.05 * oIndex,
                                          }}
                                          whileHover={{ x: 5 }}
                                        >
                                          <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                              selectedAnswers[question.id] ===
                                              option.id
                                                ? "border-[#0E61DD]"
                                                : "border-gray-600"
                                            }`}
                                          >
                                            {selectedAnswers[question.id] ===
                                              option.id && (
                                              <motion.div
                                                className="w-3 h-3 rounded-full bg-[#0E61DD]"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                  type: "spring",
                                                  damping: 10,
                                                }}
                                              />
                                            )}
                                          </div>
                                          <label className="flex-1 cursor-pointer text-gray-300">
                                            {option.option_text}
                                          </label>

                                          {/* Badge for previously selected answer */}
                                          {previousAnswers[question.id] ===
                                            option.id &&
                                            !quizResults.shown && (
                                              <span className="px-2 py-1 text-xs bg-[#0E61DD]/20 text-[#2C7BF2] rounded-full">
                                                Previously selected
                                              </span>
                                            )}
                                        </motion.div>
                                      )
                                    )}
                                </div>
                                {qIndex < questions.length - 1 && (
                                  <Separator className="bg-gray-800" />
                                )}
                              </motion.div>
                            ))}
                          </div>
                          <div className="p-4 border-t border-gray-800 flex justify-end">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Button
                                onClick={handleQuizSubmit}
                                disabled={!isQuizComplete()}
                                className="bg-[#2C7BF2] hover:bg-#0E61DD disabled:bg-gray-800 disabled:text-gray-500"
                              >
                                Submit Answers
                              </Button>
                            </motion.div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            {nextVideo && (
              <NextVideoComponent
                nextVideo={nextVideo}
                onContinue={() => {
                  handleVideoSelect(currentVideoIndex + 1);
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* Bottom footer with links */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-gray-800 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="link"
            size="sm"
            className="text-[#2C7BF2] hover:text-[#0E61DD] text-xs sm:text-sm p-0"
          >
            Lesson's links
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-[#0E61DD] hover:text-[#2C7BF2] text-xs sm:text-sm p-0"
            onClick={toggleTableOfContents}
          >
            Table of content
          </Button>
        </div>
        <div>
          <span className="text-xs sm:text-sm text-gray-400">
            {currentVideoIndex + 1}/{videos.length}
          </span>
        </div>
      </div> */}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-[#0E61DD] to-[#2C7BF2]"
          initial={{ width: 0 }}
          animate={{ width: `${getProgressPercentage()}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default CourseDetail;
