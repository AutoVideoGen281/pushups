import React from 'react';
import { WorkoutSet } from '../types';

interface WorkoutPreviewProps {
  workout: WorkoutSet[];
  onStart: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, onStart }) => {
  return (
    <div className="w-full text-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Here's Today's Plan</h1>
      <p className="text-gray-400 mb-8 text-lg">Get ready to crush it. You've got this.</p>
      
      <div className="mb-8 space-y-3">
        {workout.map((set, index) => (
          <div key={index} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
            <span className="text-gray-300 font-medium">Set {index + 1}</span>
            <span className="text-2xl font-bold text-white">{set.targetReps} reps</span>
          </div>
        ))}
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

export default WorkoutPreview;
