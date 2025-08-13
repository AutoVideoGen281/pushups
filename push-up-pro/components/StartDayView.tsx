import React from 'react';
import { WorkoutSet } from '../types';

interface StartDayViewProps {
  workout: WorkoutSet[];
  onStart: () => void;
}

const StartDayView: React.FC<StartDayViewProps> = ({ workout, onStart }) => {
  return (
    <div className="w-full text-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Today's Challenge</h1>
      <p className="text-gray-400 mb-8 text-lg">Here's the plan. Get ready to work.</p>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-300">Your Sets:</h3>
        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          {workout.map((set, index) => (
            <div key={index} className="bg-gray-800 text-center rounded-lg p-3 border border-gray-700 w-20">
              <p className="text-xs text-gray-500 font-bold">SET {index + 1}</p>
              <p className="text-2xl font-extrabold text-white">{set.targetReps}</p>
              <p className="text-xs text-gray-500 font-bold">REPS</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10"
      >
        Start Workout
      </button>
    </div>
  );
};

export default StartDayView;