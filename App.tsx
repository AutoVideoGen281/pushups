import React, { useState, useEffect, useCallback } from 'react';
import { ProgressData, WorkoutSet } from './types';
import { LOCAL_STORAGE_KEY } from './constants';
import InitialView from './components/InitialView';
import WorkoutTracker from './components/WorkoutTracker';
import CompletedScreen from './components/CompletedScreen';
import StatusHeader from './components/StatusHeader';
import StartDayView from './components/StartDayView';

type ViewMode = 'loading' | 'initial' | 'start_day' | 'workout' | 'pr_test' | 'completed';

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
    const newWorkout = previousWorkout.map(set => ({ ...set, targetReps: set.targetReps, completedReps: 0 }));
    if (newWorkout.length === 0) return [];
    // Increase target reps on a random set
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
                const data: ProgressData = JSON.parse(savedData);
                const today = new Date();
                const lastWorkoutDate = data.lastWorkoutDate ? new Date(data.lastWorkoutDate) : null;

                if (lastWorkoutDate && isSameDay(lastWorkoutDate, today)) {
                    // Already trained today
                    setProgress(data);
                    setViewMode('completed');
                } else { 
                    // New day, show start screen before workout
                    const streakShouldContinue = lastWorkoutDate && isYesterday(lastWorkoutDate, today);
                    const newStreak = streakShouldContinue ? data.streak : 0;
                    
                    const lastWorkoutPlan = data.currentWorkout;

                    const nextWorkout = streakShouldContinue 
                        ? generateNextWorkout(lastWorkoutPlan)
                        : generateWorkoutFromPR(data.maxPR);
                    
                    const updatedData = { ...data, streak: newStreak, currentWorkout: nextWorkout };
                    setProgress(updatedData);
                    setViewMode('start_day');
                }
            } else {
                // First time user
                setViewMode('initial');
            }
        } catch (error) {
            console.error("Failed to load or process data:", error);
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
        };
        saveData(newData);
        setViewMode('start_day');
    };
    
    const handlePRTestComplete = (pr: number) => {
        if (!progress || pr <= 0) return;
        const newWorkout = generateWorkoutFromPR(pr);
        const updatedData: ProgressData = {
            ...progress,
            maxPR: pr,
            currentWorkout: newWorkout,
        };
        saveData(updatedData);
        setViewMode('workout');
    };

    const handleWorkoutComplete = (completedSets: WorkoutSet[]) => {
        if (!progress) return;
        const today = new Date();
        const newLog: any = { date: today.toISOString(), sets: completedSets };
        
        const updatedData: ProgressData = {
            ...progress,
            lastWorkoutDate: today.toISOString(),
            streak: progress.streak + 1,
            history: [...progress.history, newLog],
            currentWorkout: completedSets
        };
        saveData(updatedData);
        setViewMode('completed');
    };
    
    const handleStartWorkout = () => {
        setViewMode('workout');
    };

    const startPRTest = () => setViewMode('pr_test');

    const renderContent = () => {
        switch (viewMode) {
            case 'loading':
                return <div className="text-2xl font-bold">Loading...</div>;
            case 'initial':
                return <InitialView onSave={handleInitialPR} />;
            case 'start_day':
                 if (!progress) return <InitialView onSave={handleInitialPR} />;
                 return <StartDayView workout={progress.currentWorkout} onStart={handleStartWorkout} />;
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
            case 'completed':
                if (!progress) return <InitialView onSave={handleInitialPR} />;
                return <CompletedScreen progress={progress} />;
            default:
                return <div>Error</div>;
        }
    };

    return (
        <main className="bg-black text-gray-100 min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 font-sans">
             <div className="w-full max-w-md">
                {viewMode !== 'initial' && progress && <StatusHeader progress={progress} onPRTestClick={startPRTest} />}
            </div>
            <div className="flex-grow flex items-center justify-center w-full max-w-md">
                {renderContent()}
            </div>
            <footer className="w-full text-center p-4">
                <p className="text-gray-600 text-sm">Push-Up Pro &copy; {new Date().getFullYear()}</p>
            </footer>
        </main>
    );
}