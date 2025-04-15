// Updated YouTubeEmbed.tsx
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEmbedProps {
  videoId: string;
  autoplay?: boolean;
  onVideoEnd?: () => void;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  initialPosition?: number;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  autoplay = false,
  onVideoEnd,
  onProgressUpdate,
  initialPosition = 0,
  className = "",
}) => {
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const initialPositionRef = useRef<number>(initialPosition);
  const videoIdRef = useRef<string>(videoId);

  // Update refs when props change
  useEffect(() => {
    initialPositionRef.current = initialPosition;
    videoIdRef.current = videoId;
  }, [initialPosition, videoId]);

  const initializePlayer = () => {
    if (!playerRef.current) return;

    // Clear any existing player and interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (player) {
      try {
        player.destroy();
      } catch (e) {
        console.error("Error destroying player:", e);
      }
    }

    // Create a completely new player instance
    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
        // Do not set start time here, we'll do it in onReady
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handlePlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  const handlePlayerReady = (event: any) => {
    // When player is ready, seek to the initial position
    if (initialPositionRef.current > 0) {
      event.target.seekTo(initialPositionRef.current);
    }

    if (autoplay) {
      event.target.playVideo();
    }

    // Set up progress tracking
    progressInterval.current = setInterval(() => {
      try {
        if (event.target && typeof event.target.getCurrentTime === "function") {
          const currentTime = event.target.getCurrentTime();
          const duration = event.target.getDuration();
          const playerState = event.target.getPlayerState();

          // Only update progress when actually playing
          if (duration > 0 && playerState === window.YT.PlayerState.PLAYING) {
            if (onProgressUpdate) {
              onProgressUpdate(currentTime, duration);
            }
          }
        }
      } catch (err) {
        console.error("Error tracking progress:", err);
      }
    }, 1000);
  };

  const handlePlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED && onVideoEnd) {
      onVideoEnd();
    }
  };

  // Initialize player on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  }, []);

  // Reinitialize player when videoId changes
  useEffect(() => {
    if (videoId !== videoIdRef.current || player) {
      // Completely recreate the player when video changes
      if (playerRef.current && window.YT) {
        // Clear previous content
        playerRef.current.innerHTML = "";
        initializePlayer();
      }
    }
  }, [videoId]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={playerRef} className="w-full h-full" />
    </div>
  );
};

export default YouTubeEmbed;
