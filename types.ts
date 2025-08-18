export type WorkoutType = 'push-ups' | 'pull-ups' | 'planks';

export interface RepWorkoutSet {
  targetReps: number;
  completedReps: number;
}

export interface DurationWorkoutSet {
  targetDuration: number; // in seconds
  completedDuration: number; // in seconds
}

export type WorkoutSetUnion = RepWorkoutSet | DurationWorkoutSet;

export const isRepWorkoutSet = (set: WorkoutSetUnion): set is RepWorkoutSet =>
  (set as RepWorkoutSet).completedReps !== undefined;

export const isDurationWorkoutSet = (set: WorkoutSetUnion): set is DurationWorkoutSet =>
  (set as DurationWorkoutSet).completedDuration !== undefined;


export interface DailyLog {
  date: string; // ISO String for the date
  workoutType: WorkoutType;
  sets: WorkoutSetUnion[];
}

export interface PRHistoryItem {
  date: string; // ISO String
  pr: number; // Reps for push-ups/pull-ups, seconds for planks
}

export interface WorkoutProgress {
    maxPR: number;
    streak: number;
    lastWorkoutDate: string | null;
    currentWorkout: WorkoutSetUnion[];
    prHistory: PRHistoryItem[];
}

export interface AppData {
    'push-ups': WorkoutProgress;
    'pull-ups': WorkoutProgress;
    'planks': WorkoutProgress;
    history: DailyLog[]; // Combined history
}

// Keep old type for migration
export interface ProgressData {
  maxPR: number;
  streak: number;
  lastWorkoutDate: string | null;
  currentWorkout: RepWorkoutSet[];
  history: { date: string; sets: RepWorkoutSet[] }[];
  prHistory: PRHistoryItem[];
}
