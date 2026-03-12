import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Dumbbell, PlayCircle, Edit2, Check, X, Sparkles, ShieldAlert, ShieldCheck, AlertCircle, Info } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CardNav from '../components/CardNav';
import { getUserObject } from '../utils/auth';

export default function WorkoutDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workout, setWorkout] = useState(null);
    const [hydratedExercises, setHydratedExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI Analysis
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const currentUser = getUserObject();
    const isOwner = workout && currentUser && workout.user === currentUser.sub;

    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({ sets: 0, reps: 0, weight: 0 });

    // Training Session
    const [activeSessionId, setActiveSessionId] = useState(() => sessionStorage.getItem('activeSessionId') || null);
    const [isTraining, setIsTraining] = useState(() => !!sessionStorage.getItem('activeSessionId'));

    const handleEditClick = (item) => {
        setEditingItem(item._id);
        setEditForm({ sets: item.sets, reps: item.reps, weight: item.weight });
    };

    const handleSaveEdit = async (item) => {
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const res = await fetch(`${baseUrl}/api/nest/workouts/${id}/exercises/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setHydratedExercises(prev => prev.map(pItem =>
                    pItem._id === item._id ? { ...pItem, ...editForm } : pItem
                ));
                setEditingItem(null);
            }
        } catch (err) {
            console.error("Failed to save changes", err);
        }
    };

    useEffect(() => {
        const fetchWorkoutData = async () => {
            setLoading(true);
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                // 1. Fetch the workout container
                const workoutRes = await fetch(`${baseUrl}/api/nest/workouts/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (!workoutRes.ok) {
                    throw new Error('Workout not found or access denied');
                }

                const workoutData = await workoutRes.json();
                setWorkout(workoutData);

                // 2. Fetch all nested exercise details in parallel via ExerciseDB proxy (by IDs)
                if (workoutData.exercises && workoutData.exercises.length > 0) {
                    const promises = workoutData.exercises.map(async (exItem) => {
                        const exRes = await fetch(`${baseUrl}/api/nest/exercises/${exItem.exerciseId}`);
                        if (!exRes.ok) return null;
                        const exDetails = await exRes.json();
                        // Combine sets/reps info from Workout Schema with the actual DB details
                        return {
                            ...exItem,
                            details: exDetails?.data || exDetails
                        };
                    });

                    const results = await Promise.all(promises);
                    setHydratedExercises(results.filter(Boolean));
                }
            } catch (err) {
                console.error("Failed to fetch workout details:", err);
                setError(err.message);
            } finally {
                // UI should stop locking the page now that the exercises are loaded
                setLoading(false);
            }

            // 3. Fetch AI Recommendation (Non-blocking)
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            setIsAiLoading(true);
            try {
                const aiRes = await fetch(`${baseUrl}/api/nest/workouts/${id}/recommendation`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    setAiAnalysis(aiData);
                }
            } catch (aiErr) {
                console.error("Failed to fetch AI Recommendation:", aiErr);
            } finally {
                setIsAiLoading(false);
            }
        };

        if (id) {
            fetchWorkoutData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col pt-32 items-center justify-center">
                <CardNav />
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-zinc-400 font-medium animate-pulse">Loading Workout Routine...</p>
            </div>
        );
    }

    if (error || !workout) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 flex flex-col items-center justify-center">
                <CardNav />
                <Dumbbell className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Routine Not Found</h2>
                <p className="text-zinc-500 mb-6 max-w-md text-center">We couldn't locate the details for this workout in our database.</p>
                <button
                    onClick={() => navigate('/workouts')}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
                >
                    Browse Workouts
                </button>
            </div>
        );
    }

    const startTraining = async () => {
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const res = await fetch(`${baseUrl}/api/nest/workouts/${id}/sessions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                const sessionData = await res.json();
                setActiveSessionId(sessionData._id);
                setIsTraining(true);
                sessionStorage.setItem('activeSessionId', sessionData._id);
            }
        } catch (err) {
            console.error("Failed to start training session:", err);
        }
    };

    const endTraining = async () => {
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            await fetch(`${baseUrl}/api/nest/workouts/sessions/${activeSessionId}/finish`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
        } catch (err) {
            console.error("Failed to end training:", err);
        } finally {
            setIsTraining(false);
            setActiveSessionId(null);
            sessionStorage.removeItem('activeSessionId');
            // Optionally redirect to profile here or show a summary modal later
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />
            <main className="pt-32 px-6 max-w-5xl mx-auto">

                <button
                    onClick={() => navigate('/workouts')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Community Workouts
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black capitalize tracking-tight mb-4">
                            {workout.name}
                        </h1>
                        <div className="flex items-center gap-4 text-zinc-400 font-medium">
                            <span className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                                {hydratedExercises.length} Exercises Built In
                            </span>
                            <span>Created on {new Date(workout.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {isOwner && hydratedExercises.length > 0 && (
                        <button
                            onClick={isTraining ? endTraining : startTraining}
                            className={`px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${isTraining
                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/20'
                                }`}
                        >
                            {isTraining ? 'END TRAINING' : 'TRAIN NOW'}
                        </button>
                    )}
                </motion.div>

                {/* AI Coach Analysis Panel */}
                {isOwner && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10 relative overflow-hidden rounded-2xl"
                    >
                        {/* Glow Background */}
                        <div className={`absolute inset-0 opacity-20 ${aiAnalysis ? (aiAnalysis.isSafe ? 'bg-emerald-500' : 'bg-red-500') : 'bg-cyan-500 animate-pulse'}`}></div>

                        <div className="relative p-6 md:p-8 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-zinc-950 rounded-xl">
                                    <Sparkles className={`w-6 h-6 ${aiAnalysis ? (aiAnalysis.isSafe ? 'text-emerald-400' : 'text-red-400') : 'text-cyan-400 animate-pulse'}`} />
                                </div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Gemini Coach Analysis</h2>
                            </div>

                            {isAiLoading ? (
                                <div className="flex items-center gap-3 text-zinc-400 py-4">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Cross-referencing your health profile and routine...</span>
                                </div>
                            ) : aiAnalysis ? (
                                <div className="space-y-6 mt-2">
                                    <p className="text-lg text-zinc-300 font-medium">{aiAnalysis.generalAdvice}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl border ${aiAnalysis.isSafe ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                {aiAnalysis.isSafe ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-red-500" />}
                                                <h3 className={`font-bold ${aiAnalysis.isSafe ? 'text-emerald-400' : 'text-red-500'}`}>Safety Warnings</h3>
                                            </div>
                                            {aiAnalysis.warnings?.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {aiAnalysis.warnings.map((warn, i) => (
                                                        <li key={i} className={`text-sm ${aiAnalysis.isSafe ? 'text-emerald-200/80' : 'text-red-200'} flex items-start gap-2`}>
                                                            <span className="mt-1 font-bold">•</span>
                                                            <span>{warn}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-emerald-200/80">No significant health contraindications detected.</p>
                                            )}
                                        </div>

                                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Check className="w-5 h-5 text-cyan-400" />
                                                <h3 className="font-bold text-cyan-400">Positive Feedback</h3>
                                            </div>
                                            <ul className="space-y-2">
                                                {aiAnalysis.positiveFeedback?.map((fb, i) => (
                                                    <li key={i} className="text-sm text-cyan-200/80 flex items-start gap-2">
                                                        <span className="mt-1 font-bold">•</span>
                                                        <span>{fb}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-zinc-500">Analysis unavailable at this time.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col gap-6">
                    {hydratedExercises.length > 0 ? (
                        hydratedExercises.map((item, index) => {
                            const ex = item.details;
                            if (!ex) return null;

                            return (
                                <motion.div
                                    key={`${item.exerciseId}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => navigate(`/exercise/${ex.exerciseId || ex.id}`)}
                                    className="group relative flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer hover:bg-zinc-800/80 transition-all shadow-lg"
                                >
                                    <div className="w-32 h-32 rounded-xl bg-zinc-950 flex-shrink-0 overflow-hidden border border-zinc-800 flex items-center justify-center p-2 relative">
                                        <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-zinc-950 font-black text-xs z-10">
                                            {index + 1}
                                        </div>
                                        {ex.gifUrl ? (
                                            <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-contain opacity-90 mix-blend-screen group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                        ) : (
                                            <PlayCircle className="w-8 h-8 text-zinc-700" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <h3 className="text-2xl font-bold text-white mb-2 capitalize truncate group-hover:text-cyan-400 transition-colors">
                                            {ex.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                                            <span className="text-sm font-semibold text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg capitalize">
                                                {ex.target || 'various'}
                                            </span>
                                            <span className="text-sm font-semibold text-zinc-500 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-lg capitalize">
                                                {ex.equipment || 'body weight'}
                                            </span>
                                        </div>

                                        {/* Prescribed Sets mapped from Workout Schema */}
                                        {editingItem === item._id ? (
                                            <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-cyan-500/30 w-fit" onClick={e => e.stopPropagation()}>
                                                <div className="flex flex-col w-16">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Sets</label>
                                                    <input type="number" min="1" value={editForm.sets} onChange={e => setEditForm({ ...editForm, sets: Number(e.target.value) })} className="bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white text-center font-bold focus:outline-none focus:border-cyan-500" />
                                                </div>
                                                <div className="text-zinc-600 font-black mt-4">x</div>
                                                <div className="flex flex-col w-16">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Reps</label>
                                                    <input type="number" min="1" value={editForm.reps} onChange={e => setEditForm({ ...editForm, reps: Number(e.target.value) })} className="bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white text-center font-bold focus:outline-none focus:border-cyan-500" />
                                                </div>
                                                <div className="flex flex-col w-20 ml-2 pl-4 border-l border-zinc-800">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Lbs</label>
                                                    <input type="number" min="0" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: Number(e.target.value) })} className="bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white text-center font-bold focus:outline-none focus:border-cyan-500" />
                                                </div>
                                                <div className="flex flex-col gap-1 ml-2">
                                                    <button onClick={() => handleSaveEdit(item)} className="bg-cyan-500 text-zinc-950 p-1.5 rounded-md hover:bg-cyan-400 transition-colors"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingItem(null)} className="bg-zinc-800 text-zinc-400 p-1.5 rounded-md hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center sm:justify-start gap-4 group/edit">
                                                <div className="flex flex-col items-center sm:items-start">
                                                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Planned Sets</span>
                                                    <span className="text-xl font-black text-white">{item.sets} <span className="text-zinc-500 text-sm font-normal">x {item.reps}</span></span>
                                                </div>
                                                {item.weight > 0 && (
                                                    <div className="flex flex-col items-center sm:items-start pl-4 border-l border-zinc-700">
                                                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Target Weight</span>
                                                        <span className="text-xl font-black text-white">{item.weight} <span className="text-zinc-500 text-sm font-normal">lbs</span></span>
                                                    </div>
                                                )}
                                                {isOwner && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                                        className="ml-2 opacity-0 group-hover/edit:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Assessment Badge */}
                                    {aiAnalysis?.exerciseAssessments?.some(a => String(a.exerciseId) === String(item.exerciseId) || String(a.exerciseId) === String({ ...item.exerciseId }._id)) && (() => {
                                        const assessment = aiAnalysis.exerciseAssessments.find(a => String(a.exerciseId) === String(item.exerciseId) || String(a.exerciseId) === String({ ...item.exerciseId }._id));
                                        if (!assessment) return null;
                                        const isRec = assessment.status === 'Recommended';
                                        const isNotRec = assessment.status === 'Not Recommended';
                                        const isDoc = assessment.status === 'Consult Doctor';

                                        return (
                                            <div className="flex flex-col items-center sm:items-end sm:ml-auto max-w-[200px] text-center sm:text-right mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-zinc-800 sm:border-0 pl-0 sm:pl-4 sm:border-l sm:border-t-0">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${isRec ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                    isNotRec ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                                        isDoc ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                                            'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                                    }`}>
                                                    {isRec && <ShieldCheck className="w-3.5 h-3.5" />}
                                                    {isNotRec && <ShieldAlert className="w-3.5 h-3.5" />}
                                                    {isDoc && <AlertCircle className="w-3.5 h-3.5" />}
                                                    {(!isRec && !isNotRec && !isDoc) && <Info className="w-3.5 h-3.5" />}
                                                    <span className="text-[10px] uppercase font-bold tracking-wider">{assessment.status}</span>
                                                </div>
                                                <p className="text-[11px] text-zinc-400 mt-2 leading-tight">{assessment.reason}</p>
                                            </div>
                                        );
                                    })()}

                                    {/* Start Workout Button (visible only in training mode) */}
                                    {isTraining && (
                                        <div className="sm:ml-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-zinc-800 sm:border-0 pl-0 sm:pl-4 sm:border-l sm:border-t-0 flex items-center justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/train/${activeSessionId}/exercise/${ex.exerciseId || ex.id}`);
                                                }}
                                                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto"
                                            >
                                                Start {ex.name}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })
                    ) : (
                        <div className="py-12 border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/30">
                            <Dumbbell className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-lg">This workout routine is currently empty.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
