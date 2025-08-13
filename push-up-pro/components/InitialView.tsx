import React, { useState } from 'react';

interface InitialViewProps {
  onSave: (pr: number) => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onSave }) => {
  const [pr, setPr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prValue = parseInt(pr, 10);
    if (!isNaN(prValue) && prValue > 0) {
      onSave(prValue);
    }
  };

  return (
    <div className="w-full text-center p-4 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Welcome to Push-Up Pro</h1>
      <p className="text-gray-400 mb-8 text-lg">Let's start by finding your baseline.</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <label htmlFor="max-pr" className="text-xl font-bold text-gray-200">
          How many push-ups can you do in one go?
        </label>
        <input
          id="max-pr"
          type="number"
          value={pr}
          onChange={(e) => setPr(e.target.value)}
          placeholder="e.g., 20"
          className="w-48 text-center bg-gray-800 text-white text-3xl font-bold p-4 rounded-lg border-2 border-gray-700 focus:border-white focus:ring-0 outline-none transition"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <button
          type="submit"
          className="w-full max-w-xs bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10"
        >
          Generate My First Workout
        </button>
      </form>
    </div>
  );
};

export default InitialView;
