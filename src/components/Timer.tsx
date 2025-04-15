"use client";
import React, { useEffect, useState } from "react";
import { useTest } from "@/contexts/TestContext";
import { Clock } from "lucide-react";

const Timer: React.FC = () => {
  const { testState, isTimerActive } = useTest();
  const { remainingTime } = testState;

  const [animatedWidth, setAnimatedWidth] = useState("100%");
  const [originalTime, setOriginalTime] = useState<number | null>(null);

  useEffect(() => {
    if (remainingTime !== null && originalTime === null) {
      setOriginalTime(remainingTime);
    }
  }, [remainingTime, originalTime]);

  useEffect(() => {
    if (originalTime && remainingTime !== null) {
      const percentRemaining = (remainingTime / originalTime) * 100;
      setAnimatedWidth(`${percentRemaining}%`);
    }
  }, [remainingTime, originalTime]);

  if (remainingTime === null) return null;

  // Format time remaining
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  // Format as MM:SS
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Determine timer color based on remaining time
  let timerColor = "bg-primary";
  if (remainingTime < 60000) {
    // Last minute - red
    timerColor = "bg-destructive";
  } else if (remainingTime < 300000) {
    // Last 5 minutes - yellow/orange
    timerColor = "bg-amber-500";
  }

  return (
    <div className="border-white right-4 z-10 glass-panel px-4 py-3 rounded-full shadow-md flex flex-col items-center justify-center animate-fade-in">
      <div className="flex items-center space-x-2 mb-1">
        <Clock
          className={`h-4 w-4 ${
            remainingTime < 60000 ? "text-destructive animate-pulse" : ""
          }`}
        />
        <span
          className={`font-mono text-sm font-semibold ${
            remainingTime < 60000 ? "text-destructive" : ""
          }`}
        >
          {formattedTime}
        </span>
      </div>
      <div className="timer-bar w-full">
        <div
          className={`timer-progress ${timerColor} transition-all duration-1000 ease-linear`}
          style={{ width: animatedWidth }}
        />
      </div>
    </div>
  );
};

export default Timer;
