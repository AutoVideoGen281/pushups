import React, { useState, useEffect, useCallback } from 'react';
import { ProgressData, WorkoutSet, DailyLog, PRHistoryItem } from './types';
import { LOCAL_STORAGE_KEY } from './constants';
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

const generateWorkoutFromPR = (pr: number): WorkoutSet[] => {
    const percentages = [0.6, 0.7, 0.5, 0.5, 0.45];
    return percentages.map(p => ({
        targetReps: Math.max(1, Math.ceil(pr * p)),
        completedReps: 0,
    }));
};

const generateNextWorkout = (previousWorkout: WorkoutSet[]): WorkoutSet[] => {
    const newWorkout = previousWorkout.map(set => ({ ...set, completedReps: 0, targetReps: set.targetReps }));
    if (newWorkout.length === 0) return [];
    const randomIndex = Math.floor(Math.random() * newWorkout.length);
    newWorkout[randomIndex].targetReps += 1;
    return newWorkout;
};

export default function App() {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('loading');

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                let data: ProgressData = JSON.parse(savedData);

                // Migration for users without prHistory
                if (!data.prHistory) {
                    data.prHistory = data.maxPR > 0 ? [{ date: data.history[0]?.date || new Date().toISOString(), pr: data.maxPR }] : [];
                }
                
                const today = new Date();
                const lastWorkoutDate = data.lastWorkoutDate ? new Date(data.lastWorkoutDate) : null;
                
                // If it's a new day, generate the next workout
                if (lastWorkoutDate && !isSameDay(lastWorkoutDate, today)) {
                    let workout: WorkoutSet[];
                    let streak = data.streak;

                    if (isYesterday(lastWorkoutDate, today)) {
                        workout = generateNextWorkout(data.currentWorkout);
                    } else {
                        // Streak broken
                        workout = generateWorkoutFromPR(data.maxPR);
                        streak = 0;
                    }
                    const updatedData = { ...data, streak, currentWorkout: workout.map(s => ({...s, completedReps: 0})) };
                    setProgress(updatedData);
                } else {
                    setProgress(data);
                }
                
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

    const saveData = useCallback((data: ProgressData) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            setProgress(data);
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    }, []);

    const handleInitialPR = (pr: number) => {
        if (pr <= 0) return;
        const newWorkout = generateWorkoutFromPR(pr);
        const newData: ProgressData = {
            maxPR: pr,
            streak: 0,
            lastWorkoutDate: null,
            currentWorkout: newWorkout,
            history: [],
            prHistory: [{ date: new Date().toISOString(), pr: pr }],
        };
        saveData(newData);
        setViewMode('dashboard');
    };
    
    const handlePRTestComplete = (pr: number) => {
        if (!progress || pr <= 0) return;
        const updatedData: ProgressData = {
            ...progress,
            maxPR: Math.max(progress.maxPR, pr),
            prHistory: [...progress.prHistory, { date: new Date().toISOString(), pr }],
        };
        saveData(updatedData);
        setViewMode('dashboard');
    };

    const handleWorkoutComplete = (completedSets: WorkoutSet[]) => {
        if (!progress) return;
        const today = new Date();
        const newLog: DailyLog = { date: today.toISOString(), sets: completedSets };
        
        const updatedData: ProgressData = {
            ...progress,
            lastWorkoutDate: today.toISOString(),
            streak: progress.streak + 1,
            history: [...progress.history, newLog],
            currentWorkout: completedSets,
        };
        saveData(updatedData);
        setViewMode('dashboard');
    };
    
    const startWorkout = () => setViewMode('workout');
    const startPRTest = () => setViewMode('pr_test');

    const renderContent = () => {
        switch (viewMode) {
            case 'loading':
                return <div className="text-2xl font-bold">Loading...</div>;
            case 'initial':
                return <InitialView onSave={handleInitialPR} />;
            case 'workout':
                if (!progress) return <InitialView onSave={handleInitialPR} />;
                return (
                    <WorkoutTracker
                        key={progress.lastWorkoutDate} 
                        workout={progress.currentWorkout}
                        onComplete={handleWorkoutComplete}
                    />
                );
            case 'pr_test':
                 if (!progress) return <InitialView onSave={handleInitialPR} />;
                return (
                    <WorkoutTracker
                        mode="pr"
                        onComplete={(sets) => handlePRTestComplete(sets[0].completedReps)}
                    />
                );
            default:
                 return <div className="text-2xl font-bold">Loading...</div>;
        }
    };

    return (
        <main className="bg-black text-gray-100 min-h-screen w-full flex flex-col items-center p-4 sm:p-6 font-sans">
            <div className="w-full flex-grow">
                {viewMode === 'dashboard' && progress ? (
                    <Dashboard progress={progress} onStartWorkout={startWorkout} onStartPRTest={startPRTest} />
                ) : (
                    <div className="flex-grow flex items-center justify-center h-full max-w-md mx-auto">
                        {renderContent()}
                    </div>
                )}
            </div>
            <footer className="w-full text-center p-4 mt-auto shrink-0">
                <p className="text-gray-600 text-sm">Push-Up Pro &copy; {new Date().getFullYear()}</p>
            </footer>
        </main>
    );
}
