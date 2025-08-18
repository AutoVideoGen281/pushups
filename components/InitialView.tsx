import React, { useState } from 'react';
import { WORKOUT_TYPES, WORKOUT_CONFIG } from '../constants';
import { WorkoutType } from '../types';

interface InitialViewProps {
  onSave: (prs: Record<WorkoutType, number>) => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onSave }) => {
  const [prs, setPrs] = useState<Record<WorkoutType, string>>({
    'push-ups': '',
    'pull-ups': '',
    'planks': '',
  });

  const handleInputChange = (type: WorkoutType, value: string) => {
    setPrs(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prValues: Record<WorkoutType, number> = {
      'push-ups': parseInt(prs['push-ups'], 10) || 0,
      'pull-ups': parseInt(prs['pull-ups'], 10) || 0,
      'planks': parseInt(prs['planks'], 10) || 0,
    };
    
    if (Object.values(prValues).some(v => v > 0)) {
      onSave(prValues);
    }
  };

  return (
    <div className="w-full text-center p-6 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Welcome to Push-Up Pro</h1>
      <p className="text-gray-400 mb-8 text-lg">Let's find your baseline for each exercise.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        
        {WORKOUT_TYPES.map(type => {
          const config = WORKOUT_CONFIG[type];
          return (
            <div key={type} className="w-full">
              <label htmlFor={`max-pr-${type}`} className="text-xl font-bold text-gray-200 block mb-2">
                Max {config.name} ({config.unit})
              </label>
              <input
                id={`max-pr-${type}`}
                type="number"
                value={prs[type]}
                onChange={(e) => handleInputChange(type, e.target.value)}
                placeholder="e.g., 20"
                className="w-48 text-center bg-gray-800 text-white text-3xl font-bold p-4 rounded-lg border-2 border-gray-700 focus:border-white focus:ring-0 outline-none transition"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          );
        })}

        <button
          type="submit"
          className="w-full max-w-xs bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10 mt-4"
        >
          Generate My First Workouts
        </button>
      </form>
    </div>
  );
};

export default InitialView;
