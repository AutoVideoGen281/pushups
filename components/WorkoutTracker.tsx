import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutSetUnion, isRepWorkoutSet, isDurationWorkoutSet, RepWorkoutSet, DurationWorkoutSet, WorkoutType } from '../types';
import { WORKOUT_CONFIG } from '../constants';

interface WorkoutTrackerProps {
  workout?: WorkoutSetUnion[];
  mode?: 'workout' | 'pr';
  workoutType: WorkoutType;
  onComplete: (completedSets: WorkoutSetUnion[]) => void;
}

const REST_DURATION = 105; // 1 minute 45 seconds

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString();
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ workout = [], mode = 'workout', workoutType, onComplete }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState(0); // Reps or seconds
  const [completedSets, setCompletedSets] = useState<WorkoutSetUnion[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [countdown, setCountdown] = useState(REST_DURATION);

  const [isTiming, setIsTiming] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  
  const finishSetInProgress = useRef(false);
  const isPressing = useRef(false);

  const isPRMode = mode === 'pr';
  const config = WORKOUT_CONFIG[workoutType];
  const isDurationBased = config.unit === 'seconds';

  const currentSet = workout[currentSetIndex];
  const currentTarget = isPRMode ? Infinity : (isRepWorkoutSet(currentSet) ? currentSet.targetReps : (isDurationWorkoutSet(currentSet) ? currentSet.targetDuration : Infinity));

  const startNextSet = useCallback(() => {
      finishSetInProgress.current = false;
      setCurrentSetIndex(prev => prev + 1);
      setCurrentValue(0);
      setIsResting(false);
      setCountdown(REST_DURATION);
  }, []);

  const finishSet = useCallback(() => {
    if (finishSetInProgress.current) return;
    finishSetInProgress.current = true;
    
    if (isTiming) {
        setIsTiming(false);
        clearInterval(timerIntervalRef.current!);
    }
    
    let newSet: WorkoutSetUnion;
    if (isDurationBased) {
        newSet = {
            targetDuration: isPRMode ? 0 : (currentSet as DurationWorkoutSet)?.targetDuration || 0,
            completedDuration: currentValue
        };
    } else {
        newSet = {
            targetReps: isPRMode ? 0 : (currentSet as RepWorkoutSet)?.targetReps || 0,
            completedReps: currentValue
        };
    }
    const finalSets = [...completedSets, newSet];
    setCompletedSets(finalSets);

    if (isPRMode || currentSetIndex >= workout.length - 1) {
      onComplete(finalSets);
    } else {
      setIsResting(true);
    }
  }, [completedSets, currentValue, currentSetIndex, isPRMode, onComplete, workout.length, isTiming, isDurationBased, currentSet]);

  // Auto-finish set for rep-based workouts
  useEffect(() => {
    if (!isPRMode && !isDurationBased && currentValue > 0 && currentValue >= currentTarget) {
      const timer = setTimeout(() => {
        finishSet();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentValue, currentTarget, isPRMode, finishSet, isDurationBased]);
  
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

  const handlePress = () => {
    if (isDurationBased) {
        if (isTiming) { // Stop timer
            setIsTiming(false);
            clearInterval(timerIntervalRef.current!);
            setFeedback(false);
        } else { // Start timer
            setIsTiming(true);
            setFeedback(true);
            const startTime = Date.now() - currentValue * 1000;
            timerIntervalRef.current = window.setInterval(() => {
                setCurrentValue(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
    } else {
        // Rep counting logic remains mostly the same
        isPressing.current = true;
        setFeedback(true);
    }
  };

  const handleRelease = () => {
    if (!isDurationBased && isPressing.current) {
        isPressing.current = false;
        setFeedback(false);
        if (isResting || finishSetInProgress.current) return;
        setCurrentValue(prev => prev + 1);
    }
  };
  
  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isResting || finishSetInProgress.current) return;
    if (isDurationBased) return; // Duration handled by unified tap
    handlePress();
  };

  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isDurationBased) return;
    handleRelease();
  };
  
  const handleInteractionCancel = () => {
    if (isPressing.current) {
      isPressing.current = false;
      setFeedback(false);
    }
  };

  const handleMainAreaClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isResting || finishSetInProgress.current) return;
    if (isDurationBased) {
      handlePress();
    }
  };

  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
      {isResting ? (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-400">Set {currentSetIndex + 1} Complete!</h2>
            <p className="text-6xl font-black text-white">
                {isDurationBased ? formatTime(currentValue) : currentValue}
                <span className="text-2xl font-bold text-gray-500"> {config.unit.toUpperCase()}</span>
            </p>
            
            <div className="text-center my-2">
                <p className="text-lg text-gray-300">Rest up! Next set in...</p>
                <p className="text-7xl font-mono font-black text-white tracking-tighter">{formatTime(countdown)}</p>
            </div>
            
            <button onClick={startNextSet} className="w-full max-w-xs bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10">
                Skip Rest & Start Set {currentSetIndex + 2}
            </button>
        </div>
      ) : (
        <div 
          className="w-full h-full flex flex-col justify-center items-center cursor-pointer select-none relative"
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          onMouseLeave={handleInteractionCancel}
          onTouchCancel={handleInteractionCancel}
          onClick={handleMainAreaClick}
        >
          <div className="absolute top-4 text-center">
            <h2 className="text-2xl font-bold text-gray-500">
              {isPRMode ? `Max ${config.name} Test` : `Set ${currentSetIndex + 1} of ${workout.length}`}
            </h2>
            {!isPRMode && (
              <p className="text-xl text-gray-600">Target: {isDurationBased ? formatTime(currentTarget) : `${currentTarget} ${config.unit}`}</p>
            )}
          </div>
          
          <div className={`transition-transform duration-150 ${feedback ? 'scale-110' : 'scale-100'}`}>
            <span className="text-[10rem] sm:text-[14rem] font-black text-white leading-none tracking-tighter font-mono">
                {isDurationBased ? formatTime(currentValue) : currentValue}
            </span>
          </div>
          {isDurationBased && (
              <p className="text-2xl font-bold text-gray-400 mt-4">{isTiming ? 'Timing...' : 'Tap to start/stop'}</p>
          )}

          {(isPRMode || isDurationBased) && (
             <div 
                className="absolute bottom-4 w-full max-w-xs" 
                onMouseDown={stopPropagation} onTouchStart={stopPropagation}
                onMouseUp={stopPropagation} onTouchEnd={stopPropagation}
                onClick={stopPropagation}
             >
                <button onClick={finishSet} className="w-full bg-gray-800 border border-gray-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-700 transition-colors duration-300">
                  {isTiming ? 'Stop & Finish' : `Finish & Save ${isPRMode ? 'PR' : 'Set'}`}
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
