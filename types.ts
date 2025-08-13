export interface WorkoutSet {
  targetReps: number;
  completedReps: number;
}

export interface DailyLog {
  date: string; // ISO String for the date
  sets: WorkoutSet[];
}

export interface PRHistoryItem {
  date: string; // ISO String
  pr: number;
}

export interface ProgressData {
  maxPR: number;
  streak: number;
  lastWorkoutDate: string | null;
  currentWorkout: WorkoutSet[];
  history: DailyLog[];
  prHistory: PRHistoryItem[];
}
