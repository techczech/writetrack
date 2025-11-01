import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

// Helper to format seconds into HH:MM:SS
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

const FullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4v6"/><path d="M14 20h6v-6"/><path d="M4 20l6-6"/><path d="M20 4l-6 6"/></svg>
);

const MinimizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l6-6"/><path d="M10 14l-6 6"/></svg>
);

interface TimerProps {
  onStop: (minutes: number) => void;
  onPause: () => void;
  onResume: () => void;
}

const Timer: React.FC<TimerProps> = ({ onStop, onPause, onResume }) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, []);

  const tick = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setTime(accumulatedTimeRef.current + elapsed);
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(tick, 1000);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      startTimeRef.current = Date.now();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(tick, 1000);
      onResume();
    } else {
      // Pausing
      if (intervalRef.current) clearInterval(intervalRef.current);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      accumulatedTimeRef.current += elapsed;
      setIsPaused(true);
      onPause();
    }
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalTimeInSeconds = accumulatedTimeRef.current + (isActive && !isPaused ? (Date.now() - startTimeRef.current) / 1000 : 0);
    const finalTimeInMinutes = Math.round(finalTimeInSeconds / 60);
    onStop(finalTimeInMinutes);
    setIsActive(false);
    setIsPaused(true);
    setTime(0);
    accumulatedTimeRef.current = 0;
  };

  const toggleFullScreen = () => {
    if (!timerContainerRef.current) return;
    if (!document.fullscreenElement) {
      timerContainerRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const timerDisplayClass = isFullScreen
    ? 'text-8xl md:text-9xl font-mono'
    : 'text-4xl md:text-5xl font-mono';

  const containerClass = isFullScreen
    ? 'fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50'
    : 'relative flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg';

  return (
    <div ref={timerContainerRef} className={containerClass}>
      <div className={timerDisplayClass}>
        {formatTime(time)}
      </div>
      <div className="flex space-x-4 mt-6">
        {!isActive ? (
          <Button onClick={handleStart} size="lg">Start</Button>
        ) : (
          <>
            <Button onClick={handlePauseResume} variant="secondary" size="lg">
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={handleStop} variant="destructive" size="lg">Stop</Button>
          </>
        )}
      </div>
       <Button onClick={toggleFullScreen} variant="ghost" className="!absolute top-2 right-2 p-2">
            {isFullScreen ? <MinimizeIcon className="w-6 h-6"/> : <FullscreenIcon className="w-6 h-6"/>}
       </Button>
    </div>
  );
};

export default Timer;
