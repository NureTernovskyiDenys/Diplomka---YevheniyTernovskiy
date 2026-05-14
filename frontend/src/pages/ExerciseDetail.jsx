import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Target, List, PlayCircle, Plus, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardNav from '../components/CardNav';

export default function ExerciseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Workout Modal State
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [myWorkouts, setMyWorkouts] = useState([]);
    const [loadingWorkouts, setLoadingWorkouts] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [savingToWorkout, setSavingToWorkout] = useState(null); // track saving state by workout ID

    // Fetch user workouts when modal opens
    useEffect(() => {
        if (showWorkoutModal) {
            fetchMyWorkouts();
        }
    }, [showWorkoutModal]);

    const fetchMyWorkouts = async () => {
        setLoadingWorkouts(true);
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const res = await fetch(`${baseUrl}/api/nest/workouts`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyWorkouts(data);
            }
        } catch (err) {
            console.error("Failed to fetch workouts", err);
        } finally {
            setLoadingWorkouts(false);
        }
    };

    const handleAddToWorkout = async (workoutId) => {
        setSavingToWorkout(workoutId);
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const res = await fetch(`${baseUrl}/api/nest/workouts/${workoutId}/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ exerciseId: exercise.exerciseId || exercise.id })
            });

            if (res.ok) {
                // Success styling or toast could go here. 
                // For now, let's close the modal and maybe refresh the list if needed.
                setTimeout(() => setShowWorkoutModal(false), 500);
            }
        } catch (err) {
            console.error("Failed to add exercise to workout", err);
        } finally {
            setSavingToWorkout(null);
        }
    };

    const handleCreateWorkoutAndAdd = async () => {
        if (!newWorkoutName.trim()) return;
        setSavingToWorkout('new');
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            // 1. Create Workout
            const createRes = await fetch(`${baseUrl}/api/nest/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: newWorkoutName })
            });

            if (createRes.ok) {
                const newWorkout = await createRes.json();

                // 2. Add this exercise to it using our new endpoint
                await fetch(`${baseUrl}/api/nest/workouts/${newWorkout._id}/exercises`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ exerciseId: exercise.exerciseId || exercise.id })
                });

                setNewWorkoutName('');
                fetchMyWorkouts(); // Refresh list to show the new one
                setTimeout(() => setShowWorkoutModal(false), 500);
            }
        } catch (err) {
            console.error("Failed to create and add", err);
        } finally {
            setSavingToWorkout(null);
        }
    };

    useEffect(() => {
        const fetchExercise = async () => {
            setLoading(true);
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
                const response = await fetch(`${baseUrl}/api/nest/exercises/${id}`);

                if (!response.ok) {
                    throw new Error('Exercise not found');
                }

                const data = await response.json();
                // If API nests under data, handle it
                setExercise(data?.data || data);
            } catch (err) {
                console.error("Failed to fetch exercise details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchExercise();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col pt-32 items-center justify-center">
                <CardNav />
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-zinc-400 font-medium animate-pulse">Loading Exercise Details...</p>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 flex flex-col items-center justify-center">
                <CardNav />
                <Target className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Exercise Not Found</h2>
                <p className="text-zinc-500 mb-6 max-w-md text-center">We couldn't locate the details for this exercise in our database.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Prepare lists
    const targetMuscles = exercise.targetMuscles || (exercise.target ? [exercise.target] : []);
    const secondaryMuscles = exercise.secondaryMuscles || [];
    const bodyParts = exercise.bodyParts || (exercise.bodyPart ? [exercise.bodyPart] : []);
    const equipments = exercise.equipments || (exercise.equipment ? [exercise.equipment] : []);
    const instructions = exercise.instructions || [];

    const formatInstruction = (text) => {
        // removes 'Step:1 ', 'Step: 1', etc. if present for cleaner display
        return text.replace(/^Step:\s*\d+\s*/i, '');
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />
            <main className="pt-32 px-6 max-w-7xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Media */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-4 aspect-square"
                        >
                            {exercise.gifUrl ? (
                                <img
                                    src={exercise.gifUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-contain mix-blend-screen opacity-90"
                                />
                            ) : (
                                <div className="text-zinc-700 flex flex-col items-center gap-4">
                                    <PlayCircle className="w-16 h-16 opacity-50" />
                                    <span>No Preview Available</span>
                                </div>
                            )}

                        </motion.div>

                        {/* Quick Tags underneath Media */}
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex flex-col gap-4">
                            {equipments.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Equipment</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {equipments.map(eq => (
                                            <span key={eq} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg capitalize border border-zinc-700">
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bodyParts.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-2">Body Part</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bodyParts.map(bp => (
                                            <span key={bp} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-sm font-medium rounded-lg capitalize border border-indigo-500/20">
                                                {bp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details & Instructions */}
                    <div className="lg:col-span-7 flex flex-col">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 mt-2">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black capitalize tracking-tight leading-tight flex-1">
                                    {exercise.name}
                                </h1>
                                <button
                                    onClick={() => setShowWorkoutModal(true)}
                                    className="w-full xl:w-auto bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-lg px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] shrink-0"
                                >
                                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                    Add to Collection
                                </button>
                            </div>

                            {/* Muscles Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                <div className="bg-zinc-900/60 border border-cyan-500/20 rounded-2xl p-5">
                                    <h3 className="flex items-center gap-2 text-cyan-400 font-bold mb-3">
                                        <Target className="w-5 h-5" />
                                        Target Muscle
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {targetMuscles.length > 0 ? targetMuscles.map(m => (
                                            <span key={m} className="text-lg font-semibold text-white capitalize">{m}</span>
                                        )) : <span className="text-zinc-500 italic">Unknown</span>}
                                    </div>
                                </div>

                                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
                                    <h3 className="flex items-center gap-2 text-zinc-400 font-bold mb-3">
                                        <List className="w-5 h-5" />
                                        Secondary Muscles
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {secondaryMuscles.length > 0 ? secondaryMuscles.map(m => (
                                            <span key={m} className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-lg text-sm font-medium capitalize border border-zinc-700">{m}</span>
                                        )) : <span className="text-zinc-600 italic text-sm">None specified</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            {instructions.length > 0 && (
                                <div className="mt-4">
                                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                        Execution Guide
                                    </h2>
                                    <div className="space-y-4">
                                        {instructions.map((step, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                                                    {index + 1}
                                                </div>
                                                <p className="text-zinc-300 leading-relaxed pt-1">
                                                    {formatInstruction(step)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </div>

                </div>

                {/* Workout Selection Modal */}
                <AnimatePresence>
                    {showWorkoutModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowWorkoutModal(false)}
                                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh]"
                            >
                                <button
                                    onClick={() => setShowWorkoutModal(false)}
                                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Target className="text-cyan-500 w-6 h-6" />
                                    Add to Workout
                                </h3>

                                <div className="flex-1 overflow-y-auto min-h-0 mb-6 custom-scrollbar pr-2 space-y-3">
                                    {loadingWorkouts ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                                        </div>
                                    ) : myWorkouts.length > 0 ? (
                                        myWorkouts.map(workout => (
                                            <button
                                                key={workout._id}
                                                onClick={() => handleAddToWorkout(workout._id)}
                                                disabled={savingToWorkout !== null}
                                                className="w-full text-left bg-zinc-950/50 border border-zinc-800 hover:border-cyan-500/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">{workout.name}</h4>
                                                    <p className="text-xs text-zinc-500 mt-1">{workout.exercises?.length || 0} exercises listed</p>
                                                </div>
                                                {savingToWorkout === workout._id ? (
                                                    <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
                                                ) : (
                                                    <Plus className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-zinc-500 bg-zinc-950/30 rounded-xl border border-dashed border-zinc-800">
                                            No workouts created yet.
                                        </div>
                                    )}
                                </div>

                                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Create New Routine</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newWorkoutName}
                                            onChange={(e) => setNewWorkoutName(e.target.value)}
                                            placeholder="e.g. Back Destroyer"
                                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                        />
                                        <button
                                            onClick={handleCreateWorkoutAndAdd}
                                            disabled={!newWorkoutName.trim() || savingToWorkout === 'new'}
                                            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-zinc-950 font-bold px-4 rounded-lg transition-colors flex items-center justify-center min-w-[3rem]"
                                        >
                                            {savingToWorkout === 'new' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
