import React, { useState, useEffect, useCallback } from 'react';
import { AppData, WorkoutProgress, WorkoutSetUnion, DailyLog, PRHistoryItem, ProgressData, WorkoutType, RepWorkoutSet } from './types';
import { LOCAL_STORAGE_KEY, WORKOUT_CONFIG, WORKOUT_TYPES } from './constants';
import InitialView from './components/InitialView';
import WorkoutTracker from './components/WorkoutTracker';
import Dashboard from './components/Dashboard';

type ViewMode = 'loading' | 'initial' | 'dashboard' | 'workout' | 'pr_test';

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
};

const isYesterday = (date1: Date, today: Date): boolean => {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return date1.toDateString() === yesterday.toDateString();
};

const generateWorkoutFromPR = (pr: number, type: WorkoutType): WorkoutSetUnion[] => {
    const config = WORKOUT_CONFIG[type];
    return config.percentages.map(p => {
        const value = Math.max(1, Math.ceil(pr * p));
        if (config.unit === 'reps') {
            return { targetReps: value, completedReps: 0 };
        }
        return { targetDuration: value, completedDuration: 0 };
    });
};

const generateNextWorkout = (previousWorkout: WorkoutSetUnion[], type: WorkoutType): WorkoutSetUnion[] => {
    const config = WORKOUT_CONFIG[type];
    const newWorkout: WorkoutSetUnion[] = previousWorkout.map(set => {
        if ('targetReps' in set) {
            return { ...set, completedReps: 0 };
        }
        if ('targetDuration' in set) {
            return { ...set, completedDuration: 0 };
        }
        return set;
    });

    if (newWorkout.length === 0) return [];
    
    const randomIndex = Math.floor(Math.random() * newWorkout.length);
    const setToUpdate = newWorkout[randomIndex];

    if ('targetReps' in setToUpdate) {
        setToUpdate.targetReps += 1;
    } else if ('targetDuration' in setToUpdate) {
        setToUpdate.targetDuration += Math.floor(Math.random() * 3) + 1; // Increase duration by 1-3 seconds
    }
    
    return newWorkout;
};

const createInitialProgress = (pr: number, type: WorkoutType): WorkoutProgress => ({
    maxPR: pr,
    streak: 0,
    lastWorkoutDate: null,
    currentWorkout: pr > 0 ? generateWorkoutFromPR(pr, type) : [],
    prHistory: pr > 0 ? [{ date: new Date().toISOString(), pr }] : [],
});

const migrateData = (oldData: ProgressData): AppData => {
    const history: DailyLog[] = oldData.history.map(log => ({ ...log, workoutType: 'push-ups'}));

    return {
        'push-ups': {
            maxPR: oldData.maxPR,
            streak: oldData.streak,
            lastWorkoutDate: oldData.lastWorkoutDate,
            currentWorkout: oldData.currentWorkout,
            prHistory: oldData.prHistory || (oldData.maxPR > 0 ? [{ date: oldData.history[0]?.date || new Date().toISOString(), pr: oldData.maxPR }] : []),
        },
        'pull-ups': createInitialProgress(0, 'pull-ups'),
        'planks': createInitialProgress(0, 'planks'),
        history,
    };
};


export default function App() {
    const [appData, setAppData] = useState<AppData | null>(null);
    const [activeWorkoutType, setActiveWorkoutType] = useState<WorkoutType>('push-ups');
    const [viewMode, setViewMode] = useState<ViewMode>('loading');

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                let data: AppData | ProgressData = JSON.parse(savedData);

                // Check if it's old data format and migrate
                if (!('push-ups' in data)) {
                    data = migrateData(data as ProgressData);
                }

                let migratedData = data as AppData;
                const today = new Date();
                
                // Update each workout type for the new day
                WORKOUT_TYPES.forEach(type => {
                    const progress = migratedData[type];
                    const lastWorkoutDate = progress.lastWorkoutDate ? new Date(progress.lastWorkoutDate) : null;

                    if (lastWorkoutDate && !isSameDay(lastWorkoutDate, today)) {
                        let workout: WorkoutSetUnion[];
                        let streak = progress.streak;

                        if (isYesterday(lastWorkoutDate, today)) {
                            workout = generateNextWorkout(progress.currentWorkout, type);
                        } else {
                            workout = generateWorkoutFromPR(progress.maxPR, type);
                            streak = 0; // Streak broken
                        }
                        migratedData[type] = { ...progress, streak, currentWorkout: workout };
                    }
                });
                
                setAppData(migratedData);
                setViewMode('dashboard');
            } else {
                setViewMode('initial');
            }
        } catch (error) {
            console.error("Failed to load or process data:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setViewMode('initial');
        }
    }, []);

    const saveData = useCallback((data: AppData) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            setAppData(data);
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    }, []);

    const handleInitialPRs = (prs: Record<WorkoutType, number>) => {
        const newData: AppData = {
            'push-ups': createInitialProgress(prs['push-ups'], 'push-ups'),
            'pull-ups': createInitialProgress(prs['pull-ups'], 'pull-ups'),
            'planks': createInitialProgress(prs['planks'], 'planks'),
            history: [],
        };
        saveData(newData);
        setViewMode('dashboard');
    };
    
    const handlePRTestComplete = (pr: number) => {
        if (!appData || pr <= 0) return;
        const progress = appData[activeWorkoutType];
        
        const updatedProgress: WorkoutProgress = {
            ...progress,
            maxPR: Math.max(progress.maxPR, pr),
            prHistory: [...progress.prHistory, { date: new Date().toISOString(), pr }],
            // Generate a new workout based on the new PR
            currentWorkout: generateWorkoutFromPR(Math.max(progress.maxPR, pr), activeWorkoutType),
        };
        
        saveData({ ...appData, [activeWorkoutType]: updatedProgress });
        setViewMode('dashboard');
    };

    const handleWorkoutComplete = (completedSets: WorkoutSetUnion[]) => {
        if (!appData) return;
        const today = new Date();
        const progress = appData[activeWorkoutType];
        const newLog: DailyLog = { date: today.toISOString(), sets: completedSets, workoutType: activeWorkoutType };
        
        const updatedProgress: WorkoutProgress = {
            ...progress,
            lastWorkoutDate: today.toISOString(),
            streak: progress.streak + 1,
            currentWorkout: completedSets,
        };
        
        const updatedData: AppData = {
            ...appData,
            [activeWorkoutType]: updatedProgress,
            history: [...appData.history, newLog],
        };
        saveData(updatedData);
        setViewMode('dashboard');
    };
    
    const startWorkout = () => setViewMode('workout');
    const startPRTest = () => setViewMode('pr_test');

    const renderContent = () => {
        if (!appData) return <div className="text-2xl font-bold">Loading...</div>;
        const workoutProgress = appData[activeWorkoutType];

        switch (viewMode) {
            case 'workout':
                return (
                    <WorkoutTracker
                        key={`${activeWorkoutType}-${workoutProgress.lastWorkoutDate}`} 
                        workout={workoutProgress.currentWorkout}
                        workoutType={activeWorkoutType}
                        onComplete={handleWorkoutComplete}
                    />
                );
            case 'pr_test':
                return (
                    <WorkoutTracker
                        mode="pr"
                        workoutType={activeWorkoutType}
                        onComplete={(sets) => {
                             const prValue = 'completedReps' in sets[0] ? sets[0].completedReps : sets[0].completedDuration;
                             handlePRTestComplete(prValue);
                        }}
                    />
                );
            default:
                 return <div className="text-2xl font-bold">Loading...</div>;
        }
    };

    return (
        <main className="bg-black text-gray-100 min-h-screen w-full flex flex-col items-center p-4 sm:p-6 font-sans">
            <div className="w-full flex-grow max-w-3xl mx-auto">
                {viewMode === 'dashboard' && appData ? (
                    <Dashboard
                        progress={appData[activeWorkoutType]}
                        fullHistory={appData.history}
                        activeWorkoutType={activeWorkoutType}
                        setActiveWorkoutType={setActiveWorkoutType}
                        onStartWorkout={startWorkout}
                        onStartPRTest={startPRTest}
                    />
                ) : viewMode === 'initial' ? (
                     <div className="flex-grow flex items-center justify-center h-full">
                        <InitialView onSave={handleInitialPRs} />
                     </div>
                ) : (
                    <div className="flex-grow flex items-center justify-center h-full max-w-md mx-auto">
                        {renderContent()}
                    </div>
                )}
            </div>
            {viewMode !== 'workout' && viewMode !== 'pr_test' && (
                <footer className="w-full text-center p-4 mt-auto shrink-0">
                    <p className="text-gray-600 text-sm">Push-Up Pro &copy; {new Date().getFullYear()}</p>
                </footer>
            )}
        </main>
    );
}
