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

  const handleRep = () => {
    if (isResting || finishSetInProgress.current) return;
    setCurrentReps(prev => prev + 1);
    setRepFeedback(true);
    setTimeout(() => setRepFeedback(false), 150);
  };
  
  return (
    <div className="w-full flex flex-col items-center justify-center text-center p-4">
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
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-400">
              {isPRMode ? 'Max Push-Up Test' : `Set ${currentSetIndex + 1} of ${workout.length}`}
            </h2>
            {!isPRMode && (
              <p className="text-xl text-gray-500">Target: {currentTargetReps} reps</p>
            )}
          </div>

          <div
            onMouseDown={handleRep}
            onTouchStart={handleRep}
            className={`w-full h-64 sm:h-80 max-w-sm bg-gray-900 rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none border-2 border-gray-800 transition-all duration-150 ${repFeedback ? 'bg-white/10 scale-105 border-white' : 'active:scale-95'}`}
          >
            <span className="text-8xl sm:text-9xl font-black text-white transition-transform">{currentReps}</span>
            <p className="text-gray-400 font-bold text-lg -mt-2">TAP TO COUNT</p>
          </div>

          <button
            onClick={finishSet}
            className="mt-8 w-full max-w-xs bg-gray-800 border border-gray-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-300"
          >
            {isPRMode ? 'Finish & Save PR' : (currentSetIndex >= workout.length - 1 ? 'Finish Workout' : 'Finish Set')}
          </button>
        </>
      )}
    </div>
  );
};

export default WorkoutTracker;