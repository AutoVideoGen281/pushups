import { WorkoutType } from './types';

export const LOCAL_STORAGE_KEY = 'pushUpProData';

export const WORKOUT_TYPES: Readonly<Array<WorkoutType>> = ['push-ups', 'pull-ups', 'planks'];

type WorkoutConfig = {
    [key in WorkoutType]: {
        name: string;
        unit: 'reps' | 'seconds';
        sets: number;
        percentages: number[];
    }
}

export const WORKOUT_CONFIG: WorkoutConfig = {
    'push-ups': { name: 'Push-ups', unit: 'reps', sets: 5, percentages: [0.6, 0.7, 0.5, 0.5, 0.45] },
    'pull-ups': { name: 'Pull-ups', unit: 'reps', sets: 5, percentages: [0.6, 0.5, 0.4, 0.4, 0.3] },
    'planks': { name: 'Planks', unit: 'seconds', sets: 3, percentages: [0.7, 0.8, 0.6] },
};
