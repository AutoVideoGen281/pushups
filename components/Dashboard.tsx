import React from 'react';
import { WorkoutProgress, DailyLog, WorkoutType, isRepWorkoutSet, isDurationWorkoutSet } from '../types';
import { FireIcon, TrophyIcon, ChartBarIcon, CalendarDaysIcon } from './icons';
import { WORKOUT_TYPES, WORKOUT_CONFIG } from '../constants';
import LineGraph from './LineGraph';

interface DashboardProps {
  progress: WorkoutProgress;
  fullHistory: DailyLog[];
  activeWorkoutType: WorkoutType;
  setActiveWorkoutType: (type: WorkoutType) => void;
  onStartWorkout: () => void;
  onStartPRTest: () => void;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
};

const calculateStats = (history: DailyLog[], type: WorkoutType) => {
    const typeHistory = history.filter(log => log.workoutType === type);
    const config = WORKOUT_CONFIG[type];

    const totalValue = typeHistory.reduce((acc, log) => {
        return acc + log.sets.reduce((setAcc, set) => {
            if (isRepWorkoutSet(set)) return setAcc + set.completedReps;
            if (isDurationWorkoutSet(set)) return setAcc + set.completedDuration;
            return setAcc;
        }, 0);
    }, 0);

    const workoutDays = typeHistory.length;
    const avgValuePerDay = workoutDays > 0 ? Math.round(totalValue / workoutDays) : 0;
  
    const now = new Date();
    const valueThisMonth = typeHistory
        .filter(log => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() === now.getMonth();
        })
        .reduce((acc, log) => acc + log.sets.reduce((setAcc, set) => {
            if (isRepWorkoutSet(set)) return setAcc + set.completedReps;
            if (isDurationWorkoutSet(set)) return setAcc + set.completedDuration;
            return setAcc;
        }, 0), 0);
    
    const totalLabel = config.unit === 'reps' ? 'Total Reps' : 'Total Time (sec)';
    const avgLabel = config.unit === 'reps' ? 'Avg Reps / Day' : 'Avg Time / Day';
    const monthLabel = config.unit === 'reps' ? 'Reps This Month' : 'Time This Month';

  return { totalValue, avgValuePerDay, valueThisMonth, totalLabel, avgLabel, monthLabel };
};

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/80">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <p className="text-gray-400 font-medium text-sm">{label}</p>
    </div>
    <p className="text-4xl font-extrabold text-white">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ progress, fullHistory, activeWorkoutType, setActiveWorkoutType, onStartWorkout, onStartPRTest }) => {
  const { totalValue, avgValuePerDay, valueThisMonth, totalLabel, avgLabel, monthLabel } = calculateStats(fullHistory, activeWorkoutType);
  
  const today = new Date();
  const lastWorkoutDate = progress.lastWorkoutDate ? new Date(progress.lastWorkoutDate) : null;
  const workoutCompletedToday = lastWorkoutDate && isSameDay(lastWorkoutDate, today);
  const config = WORKOUT_CONFIG[activeWorkoutType];

  return (
    <div className="w-full mx-auto animate-fade-in space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Your Dashboard</h1>
          <p className="text-lg text-gray-400">Ready to get stronger today?</p>
        </div>
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/50 border border-gray-800">
           <div className="flex items-center gap-2 text-white" title="Current Streak">
              <FireIcon className="w-6 h-6 text-orange-400" />
              <span className="text-xl font-bold">{progress.streak}</span>
           </div>
           <div className="w-px h-6 bg-gray-700"></div>
           <div className="flex items-center gap-2 text-white" title="Max PR">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold">{progress.maxPR}</span>
           </div>
        </div>
      </header>
      
      <div className="bg-gray-900/30 p-1 rounded-xl border border-gray-800 flex flex-wrap gap-1">
          {WORKOUT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveWorkoutType(type)}
                className={`flex-1 capitalize text-sm font-bold py-3 px-2 rounded-lg transition-colors ${activeWorkoutType === type ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                  {WORKOUT_CONFIG[type].name}
              </button>
          ))}
      </div>

      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-4">Today's {config.name} Workout</h2>
        {workoutCompletedToday ? (
          <div className="text-center py-8 bg-gray-800/50 rounded-lg">
            <h3 className="text-2xl font-bold text-green-400">All done for today!</h3>
            <p className="text-gray-400 mt-1">Great job. Come back tomorrow for the next challenge.</p>
          </div>
        ) : progress.currentWorkout.length > 0 ? (
          <div>
            <div className="mb-6 space-y-3">
              {progress.currentWorkout.map((set, index) => (
                <div key={index} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Set {index + 1}</span>
                  {isRepWorkoutSet(set) && <span className="text-2xl font-bold text-white">{set.targetReps} reps</span>}
                  {isDurationWorkoutSet(set) && <span className="text-2xl font-bold text-white">{set.targetDuration}s</span>}
                </div>
              ))}
            </div>
            <button
              onClick={onStartWorkout}
              className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 text-lg shadow-lg shadow-white/10"
            >
              Start Workout
            </button>
          </div>
        ) : (
            <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-400">No PR set!</h3>
                <p className="text-gray-400 mt-2 mb-4">Set your first PR for {config.name} to generate a workout.</p>
                <button onClick={onStartPRTest} className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg">Test PR Now</button>
            </div>
        )}
      </div>

      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-4">{config.name} Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatItem icon={<TrophyIcon className="w-6 h-6 text-purple-400" />} label={totalLabel} value={totalValue} />
          <StatItem icon={<ChartBarIcon className="w-6 h-6 text-sky-400" />} label={avgLabel} value={avgValuePerDay} />
          <StatItem icon={<CalendarDaysIcon className="w-6 h-6 text-rose-400" />} label={monthLabel} value={valueThisMonth} />
        </div>
      </div>
      
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-white">PR Progression</h2>
          <button 
            onClick={onStartPRTest}
            className="text-sm font-semibold bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Test New PR
          </button>
        </div>
        <LineGraph data={progress.prHistory} />
      </div>
    </div>
  );
};

export default Dashboard;
