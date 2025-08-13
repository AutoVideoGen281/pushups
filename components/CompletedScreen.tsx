import React from 'react';
import { ProgressData } from '../types';
import { FireIcon } from './icons';

interface CompletedScreenProps {
  progress: ProgressData;
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({ progress }) => {
  const totalReps = progress.currentWorkout.reduce((sum, set) => sum + set.completedReps, 0);

  return (
    <div className="w-full text-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Workout Complete!</h1>
      <p className="text-gray-400 mb-8 text-lg">Incredible work. Consistency is key.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm font-medium">TOTAL REPS TODAY</p>
          <p className="text-4xl font-extrabold text-white">{totalReps}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm font-medium">STREAK</p>
          <p className="text-4xl font-extrabold text-white flex items-center justify-center gap-2">
            {progress.streak} <FireIcon className="w-8 h-8 text-orange-400" />
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-3 text-gray-300">Today's Sets:</h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {progress.currentWorkout.map((set, index) => (
            <div key={index} className="bg-gray-800 text-lg font-bold text-white rounded-md px-4 py-2">
              {set.completedReps}
            </div>
          ))}
        </div>
      </div>
      
      <p className="mt-12 text-gray-500">Come back tomorrow for your next challenge.</p>
    </div>
  );
};

export default CompletedScreen;
