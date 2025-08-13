import React from 'react';
import { ProgressData } from '../types';
import { FireIcon, TrophyIcon } from './icons';

interface StatusHeaderProps {
  progress: ProgressData;
  onPRTestClick: () => void;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ progress, onPRTestClick }) => {
  return (
    <header className="w-full flex justify-between items-center p-2 rounded-xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white">
          <FireIcon className="w-6 h-6 text-orange-400" />
          <span className="text-xl font-bold">{progress.streak}</span>
          <span className="text-sm text-gray-400 hidden sm:inline">Streak</span>
        </div>
        <div className="w-px h-6 bg-gray-700"></div>
        <div className="flex items-center gap-2 text-white">
          <TrophyIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-bold">{progress.maxPR}</span>
          <span className="text-sm text-gray-400 hidden sm:inline">Max PR</span>
        </div>
      </div>
      <button 
        onClick={onPRTestClick}
        className="text-sm font-semibold bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
      >
        Test PR
      </button>
    </header>
  );
};

export default StatusHeader;
