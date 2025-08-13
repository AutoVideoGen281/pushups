import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutSet } from '../types';

interface WorkoutTrackerProps {
  workout?: WorkoutSet[];
  mode?: 'workout' | 'pr';
  onComplete: (completedSets: WorkoutSet[]) => void;
}

const REST_DURATION = 105; // 1 minute 45 seconds

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString();
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ workout = [], mode = 'workout', onComplete }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentReps, setCurrentReps] = useState(0);
  const [completedSets, setCompletedSets] = useState<WorkoutSet[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [repFeedback, setRepFeedback] = useState(false);
  const [countdown, setCountdown] = useState(REST_DURATION);
  
  const finishSetInProgress = useRef(false);
  const isPressing = useRef(false);

  const isPRMode = mode === 'pr';
  const currentTargetReps = isPRMode ? Infinity : workout[currentSetIndex]?.targetReps;
  
  const startNextSet = useCallback(() => {
      finishSetInProgress.current = false;
      setCurrentSetIndex(prev => prev + 1);
      setCurrentReps(0);
      setIsResting(false);
      setCountdown(REST_DURATION);
  }, []);

  const finishSet = useCallback(() => {
    if (finishSetInProgress.current) return;
    finishSetInProgress.current = true;
    
    const finalSets = [...completedSets, { 
      targetReps: isPRMode ? 0 : currentTargetReps, 
      completedReps: currentReps 
    }];
    setCompletedSets(finalSets);

    if (isPRMode || currentSetIndex >= workout.length - 1) {
      onComplete(finalSets);
    } else {
      setIsResting(true);
    }
  }, [completedSets, currentReps, currentSetIndex, currentTargetReps, isPRMode, onComplete, workout.length]);

  // Auto-finish set when target reps are met
  useEffect(() => {
    if (!isPRMode && currentReps > 0 && currentReps >= currentTargetReps) {
      const timer = setTimeout(() => {
        finishSet();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentReps, currentTargetReps, isPRMode, finishSet]);
  
  // Rest timer countdown
  useEffect(() => {
    if (isResting) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            startNextSet();
            return REST_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isResting, startNextSet]);

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isResting || finishSetInProgress.current) return;
    isPressing.current = true;
    setRepFeedback(true);
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isPressing.current) {
      isPressing.current = false;
      setRepFeedback(false);
      if (isResting || finishSetInProgress.current) {
        return;
      }
      setCurrentReps(prev => prev + 1);
    }
  };
  
  const handlePressCancel = () => {
    if (isPressing.current) {
      isPressing.current = false;
      setRepFeedback(false);
    }
  };

  const handleFinishClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    finishSet();
  };

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
      {isResting ? (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-400">Set {currentSetIndex + 1} Complete!</h2>
            <p className="text-6xl font-black text-white">{currentReps} <span className="text-2xl font-bold text-gray-500">REPS</span></p>
            
            <div className="text-center my-2">
                <p className="text-lg text-gray-300">Rest up! Next set in...</p>
                <p className="text-7xl font-mono font-black text-white tracking-tighter">{formatTime(countdown)}</p>
            </div>
            
            <button
                onClick={startNextSet}
                className="w-full max-w-xs bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10"
            >
                Skip Rest & Start Set {currentSetIndex + 2}
            </button>
        </div>
      ) : (
        <div 
          className="w-full h-full flex flex-col justify-center items-center cursor-pointer select-none relative"
          onMouseDown={handlePressStart}
          onTouchStart={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchEnd={handlePressEnd}
          onMouseLeave={handlePressCancel}
          onTouchCancel={handlePressCancel}
        >
          <div className="absolute top-4 text-center">
            <h2 className="text-2xl font-bold text-gray-500">
              {isPRMode ? 'Max Push-Up Test' : `Set ${currentSetIndex + 1} of ${workout.length}`}
            </h2>
            {!isPRMode && (
              <p className="text-xl text-gray-600">Target: {currentTargetReps} reps</p>
            )}
          </div>
          
          <div className={`transition-transform duration-150 ${repFeedback ? 'scale-110' : 'scale-100'}`}>
            <span className="text-[12rem] sm:text-[16rem] font-black text-white leading-none tracking-tighter">{currentReps}</span>
          </div>

          {isPRMode && (
             <div className="absolute bottom-4 w-full max-w-xs" onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
                <button
                onClick={handleFinishClick}
                className="w-full bg-gray-800 border border-gray-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-300"
                >
                Finish & Save PR
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
