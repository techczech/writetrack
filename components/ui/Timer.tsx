import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';

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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H4v6"/><path d="M14 20h6v-6"/><path d="M4 20l6-6"/><path d="M20 4l-6 6"/></svg>
);

const MinimizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l6-6"/><path d="M10 14l-6 6"/></svg>
);

interface TimerProps {
  onStop: (minutes: number) => void;
  onPause: () => void;
  onResume: () => void;
  initialDuration?: number; // in minutes
}

const Timer: React.FC<TimerProps> = ({ onStop, onPause, onResume, initialDuration = 0 }) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [workDurationGoal, setWorkDurationGoal] = useState(initialDuration * 60); // in seconds
  const [durationInput, setDurationInput] = useState('');
  const [hasNotified, setHasNotified] = useState(false);
  
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const timerContainerRef = useRef<HTMLDivElement>(null);

  // Effect for fullscreen handling
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Effect for the timer interval
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && !isPaused) {
      interval = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setTime(accumulatedTimeRef.current + elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  // Effect for checking if the work goal is reached
  useEffect(() => {
    if (isActive && !isPaused && workDurationGoal > 0 && !hasNotified && time >= workDurationGoal) {
      setHasNotified(true);
      alert('Your planned work session is over! You can stop the timer or set a new goal to continue.');
    }
  }, [time, isActive, isPaused, workDurationGoal, hasNotified]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setHasNotified(false);
    accumulatedTimeRef.current = 0;
    setTime(0);
    startTimeRef.current = Date.now();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      startTimeRef.current = Date.now();
      onResume();
    } else {
      // Pausing
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      accumulatedTimeRef.current += elapsed;
      setIsPaused(true);
      onPause();
    }
  };

  const handleStop = () => {
    const finalTimeInSeconds = accumulatedTimeRef.current + (isActive && !isPaused ? (Date.now() - startTimeRef.current) / 1000 : 0);
    const finalTimeInMinutes = Math.round(finalTimeInSeconds / 60);
    onStop(finalTimeInMinutes);
    setIsActive(false);
    setIsPaused(true);
    setTime(0);
    accumulatedTimeRef.current = 0;
    
    // Reset goal state
    setWorkDurationGoal(0);
    setDurationInput('');
    setHasNotified(false);
  };
  
  const handleSetDuration = () => {
    const minutes = parseInt(durationInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDurationGoal(minutes * 60);
      setDurationInput('');
    }
  };

  const handleExtendDuration = () => {
    const minutes = parseInt(durationInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setWorkDurationGoal(prev => prev + (minutes * 60));
      setHasNotified(false);
      setDurationInput('');
    }
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

      {isActive && workDurationGoal > 0 && !isFullScreen && (
        <div className="mt-4 text-lg">
          {!hasNotified ? (
            <p>
              <span className="text-gray-500 dark:text-gray-400">Time Left: </span>
              {formatTime(Math.max(0, workDurationGoal - time))}
            </p>
          ) : (
            <div className="text-center space-y-2">
              <p className="font-semibold text-green-600 dark:text-green-400">
                Goal Reached! (+{formatTime(time - workDurationGoal)})
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="number"
                  placeholder="Work for..."
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-32 text-sm py-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleExtendDuration(); }}
                />
                 <span className="text-sm text-gray-500 dark:text-gray-400">more minutes</span>
                <Button onClick={handleExtendDuration} size="sm">Extend</Button>
              </div>
            </div>
          )}
        </div>
      )}

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

      {!isActive && !isFullScreen && (
        <div className="mt-6 text-center">
            {workDurationGoal > 0 ? (
                <div className="text-gray-600 dark:text-gray-300">
                    <p>Current Goal: {workDurationGoal / 60} minutes.</p>
                    <Button variant="ghost" size="sm" onClick={() => setWorkDurationGoal(0)}>Change Goal</Button>
                </div>
            ) : (
                <div className="flex items-center justify-center space-x-2">
                    <Input
                        type="number"
                        placeholder="Set work goal (minutes)"
                        value={durationInput}
                        onChange={(e) => setDurationInput(e.target.value)}
                        className="w-48 py-1 text-sm"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSetDuration(); }}
                    />
                    <Button onClick={handleSetDuration} size="sm" variant="secondary">Set</Button>
                </div>
            )}
        </div>
      )}

       <Button onClick={toggleFullScreen} variant="ghost" className="!absolute top-2 right-2 p-2" aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullScreen ? <MinimizeIcon className="w-6 h-6"/> : <FullscreenIcon className="w-6 h-6"/>}
       </Button>
    </div>
  );
};

export default Timer;