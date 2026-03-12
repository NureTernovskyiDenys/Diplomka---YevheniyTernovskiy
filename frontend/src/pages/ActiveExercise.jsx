import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Dumbbell, PlayCircle, Check, Timer, Camera, Video, XCircle, ActivitySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserObject } from '../utils/auth';

export default function ActiveExercise() {
    const { sessionId, exerciseId } = useParams();
    const navigate = useNavigate();

    const [exerciseDetails, setExerciseDetails] = useState(null);
    const [plannedSets, setPlannedSets] = useState(0);
    const [plannedReps, setPlannedReps] = useState(0);
    const [plannedWeight, setPlannedWeight] = useState(0);

    const [currentSet, setCurrentSet] = useState(1);
    const [completedSets, setCompletedSets] = useState([]);
    const [isResting, setIsResting] = useState(false);
    const [restTime, setRestTime] = useState(0);
    const [loading, setLoading] = useState(true);

    const [setStartTime, setSetStartTime] = useState(Date.now());

    // Fallback states for inputs
    const [inputReps, setInputReps] = useState(0);
    const [inputWeight, setInputWeight] = useState(0);

    // --- AI Live Analysis States ---
    const videoRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const isLiveRef = React.useRef(false);
    const chunksRef = React.useRef([]);
    const [isLive, setIsLive] = useState(false);
    const [hasPremium, setHasPremium] = useState(false);
    const [aiReps, setAiReps] = useState(0);
    const [aiFeedback, setAiFeedback] = useState('Waiting for movement...');
    const [premiumChecked, setPremiumChecked] = useState(false);
    const [cameraError, setCameraError] = useState('');

    useEffect(() => {
        // Find existing workout template info or just rely on the API
        const loadExercise = async () => {
            setLoading(true);
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                // 1. Fetch exercise definition from proxy DB
                const exRes = await fetch(`${baseUrl}/api/nest/exercises/${exerciseId}`);
                if (!exRes.ok) throw new Error('Failed to load exercise');
                const exData = await exRes.json();
                setExerciseDetails(exData.data || exData);

                // Note: In a complete implementation, we'd also fetch the original Workout
                // to know *how many sets* we were supposed to do. For now, we'll
                // default to letting the user just input what they do.
                setPlannedSets(3);
                setPlannedReps(10);
                setPlannedWeight(0);
                setInputReps(10);
                setInputWeight(0);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setSetStartTime(Date.now());
            }
        };

        const checkPremiumStatus = async () => {
            const userObj = getUserObject();
            if (!userObj?.sub) return;
            try {
                const token = localStorage.getItem('token');
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                // Fetch User
                const userRes = await fetch(`${baseUrl}/api/nest/users/${userObj.sub}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userRes.ok) return;
                const userData = await userRes.json();

                if (userData.subscription?.planId && userData.subscription?.active !== false) {
                    // Fetch plan to check if it's premium
                    const planRes = await fetch(`${baseUrl}/api/nest/subscriptions/${userData.subscription.planId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (planRes.ok) {
                        const planData = await planRes.json();
                        if (planData.name?.toLowerCase().includes('premium')) {
                            setHasPremium(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to check premium status:", err);
            } finally {
                setPremiumChecked(true);
            }
        };

        loadExercise();
        checkPremiumStatus();
    }, [exerciseId]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isResting && restTime > 0) {
            interval = setInterval(() => {
                setRestTime(prev => prev - 1);
            }, 1000);
        } else if (isResting && restTime <= 0) {
            setIsResting(false);
            setSetStartTime(Date.now()); // Restart clock for next set
        }
        return () => clearInterval(interval);
    }, [isResting, restTime]);

    const finishSet = async () => {
        const setDuration = Math.round((Date.now() - setStartTime) / 1000);

        // Record it to the backend session
        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            await fetch(`${baseUrl}/api/nest/workouts/sessions/${sessionId}/exercises/${exerciseId}/sets`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: exerciseDetails?.name,
                    target: exerciseDetails?.targetMuscles?.[0] || exerciseDetails?.bodyParts?.[0] || exerciseDetails?.target || exerciseDetails?.bodyPart || 'Unknown',
                    reps: inputReps,
                    weight: inputWeight,
                    duration: setDuration
                })
            });

            // Update local state
            setCompletedSets(prev => [...prev, { reps: inputReps, weight: inputWeight, duration: setDuration }]);
            setCurrentSet(prev => prev + 1);

            // Start rest period
            setRestTime(60);
            setIsResting(true);

        } catch (err) {
            console.error('Failed to log set:', err);
        }
    };

    // --- Webcam & MediaRecorder Logic ---
    const startCamera = async () => {
        if (!hasPremium) {
            alert("This feature requires a Premium Subscription. Please upgrade in your Profile.");
            return;
        }

        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { frameRate: { ideal: 60, max: 60 } },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            isLiveRef.current = true;
            setIsLive(true);

            const captureStandaloneChunk = () => {
                if (!isLiveRef.current || !videoRef.current?.srcObject) return;

                let options = { mimeType: 'video/webm' };
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    options = { mimeType: 'video/webm;codecs=vp8' };
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                    options = { mimeType: 'video/webm;codecs=vp9' };
                }
                const mr = new MediaRecorder(stream, options);
                mediaRecorderRef.current = mr;

                mr.ondataavailable = async (e) => {
                    if (e.data && e.data.size > 0 && isLiveRef.current) {
                        await sendChunkToAI(e.data);
                    }
                };

                mr.start();

                setTimeout(() => {
                    if (mr.state === 'recording') {
                        mr.stop(); // Flushes data triggering ondataavailable with valid EBML
                    }
                    // Loop continuously
                    if (isLiveRef.current) {
                        captureStandaloneChunk();
                    }
                }, 5000);
            };

            captureStandaloneChunk();

        } catch (err) {
            console.error("Camera access denied:", err);
            setCameraError("Camera access was denied or is unavailable.");
        }
    };

    const stopCamera = () => {
        isLiveRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsLive(false);
        setAiReps(0);
        setAiFeedback('Waiting for movement...');
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (isLive) stopCamera();
        };
    }, [isLive]);

    const sendChunkToAI = async (blob) => {
        try {
            const formData = new FormData();
            formData.append('video_chunk', blob, `chunk-${Date.now()}.webm`);

            // Calls the separated Python FastAPI (Local or Render.com)
            const baseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:8000'
                : (import.meta.env.VITE_AI_API_URL || 'https://YOUR_RENDER_APP_URL.onrender.com');
            const response = await fetch(`${baseUrl}/live/analyze/chunk`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log("AI Data:", data);
                if (data.reps_detected_in_chunk > 0) {
                    setAiReps(prev => prev + data.reps_detected_in_chunk);
                    // Also mirror AI reps to input reps for easy saving
                    setInputReps(prev => prev + data.reps_detected_in_chunk);
                }
                if (data.feedback) {
                    setAiFeedback(data.feedback);
                }
            }
        } catch (err) {
            console.error('Failed to send chunk to AI:', err);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                <p className="text-zinc-400">Preparing exercise...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 border-white/5 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)} // Go back to WorkoutDetail
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Routine
                    </button>
                    <div className="font-black text-cyan-500 text-sm uppercase tracking-[0.2em]">
                        Active Training
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">

                    {/* Top Row: Details & AI Camera */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Visual & Title */}
                        <div className="flex flex-col items-center md:items-start gap-8 bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800">
                            <div className="w-full h-48 bg-zinc-950 rounded-2xl border border-zinc-800 flex-shrink-0 flex items-center justify-center p-4 overflow-hidden relative">
                                {exerciseDetails?.gifUrl ? (
                                    <img src={exerciseDetails.gifUrl} alt={exerciseDetails.name} className="w-full h-full object-contain mix-blend-screen" />
                                ) : (
                                    <Dumbbell className="w-12 h-12 text-zinc-700" />
                                )}
                            </div>
                            <div className="text-center md:text-left flex-1 w-full">
                                <h1 className="text-3xl md:text-4xl font-black capitalize mb-3 text-white">
                                    {exerciseDetails?.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                                    {(exerciseDetails?.targetMuscles?.[0] || exerciseDetails?.target) && (
                                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-lg text-sm font-semibold capitalize">
                                            {exerciseDetails.targetMuscles?.[0] || exerciseDetails.target}
                                        </span>
                                    )}
                                    {(exerciseDetails?.equipments?.[0] || exerciseDetails?.equipment) && (
                                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-lg text-sm font-semibold capitalize">
                                            {exerciseDetails.equipments?.[0] || exerciseDetails.equipment}
                                        </span>
                                    )}
                                </div>

                                {/* Set Tracker Visual */}
                                <div className="flex items-center gap-2 justify-center md:justify-start mb-6">
                                    {[...Array(Math.max(plannedSets, currentSet))].map((_, i) => (
                                        <div key={i} className={`w-3 h-3 rounded-full ${i < completedSets.length ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' :
                                            i === currentSet - 1 ? 'bg-zinc-600 animate-pulse' : 'bg-zinc-800 border border-zinc-700'
                                            }`} />
                                    ))}
                                </div>

                                {/* Instructions Box */}
                                {exerciseDetails?.instructions && exerciseDetails.instructions.length > 0 && (
                                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-left">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">How To Do It</h3>
                                        <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-300">
                                            {exerciseDetails.instructions.map((step, idx) => (
                                                <li key={idx} className="pl-1">
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Right Side: AI Live Analysis Camera Panel */}
                        <div className="bg-zinc-900/60 p-6 rounded-3xl border border-zinc-800 flex flex-col h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <ActivitySquare className="w-5 h-5 text-blue-400" />
                                    Live AI Analysis
                                </h3>
                                {premiumChecked && !hasPremium && (
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-bold uppercase">
                                        Premium Only
                                    </span>
                                )}
                                {isLive && (
                                    <span className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        Recording
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                                {cameraError && (
                                    <div className="absolute inset-0 bg-zinc-950/90 z-20 flex flex-col items-center justify-center text-center p-6">
                                        <XCircle className="w-8 h-8 text-red-500 mb-2" />
                                        <p className="text-sm font-medium text-red-400">{cameraError}</p>
                                    </div>
                                )}

                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`absolute inset-0 w-full h-full object-cover ${!isLive ? 'hidden' : ''}`}
                                />

                                {!isLive ? (
                                    <div className="flex flex-col items-center justify-center text-zinc-500 p-6 text-center z-10">
                                        <Camera className="w-12 h-12 mb-4 opacity-50" />
                                        {hasPremium ? (
                                            <>
                                                <p className="mb-6 text-sm">Activate your webcam to get real-time rep counting and technique analysis.</p>
                                                <button
                                                    onClick={startCamera}
                                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-2 active:scale-95"
                                                >
                                                    <Video className="w-5 h-5" />
                                                    Go Live
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="mb-6 text-sm">Upgrade to Premium to unlock real-time Computer Vision analysis.</p>
                                                <button
                                                    onClick={() => navigate('/subscriptions')}
                                                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all border border-zinc-700"
                                                >
                                                    View Plans
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 flex items-end justify-between">
                                        <div>
                                            <div className="text-4xl font-black text-white drop-shadow-md tabular-nums">{aiReps}</div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 drop-shadow-md">AI Reps</div>
                                        </div>
                                        <button
                                            onClick={stopCamera}
                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isLive && (
                                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <p className="text-xs font-medium text-blue-400 capitalize">{aiFeedback}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Set Controls */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 relative overflow-hidden">
                        {isResting ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8"
                            >
                                <Timer className="w-16 h-16 text-cyan-500 mb-6 animate-pulse" />
                                <h2 className="text-2xl font-bold text-zinc-400 mb-2">Rest Period</h2>
                                <div className="text-7xl font-black text-white mb-8 tracking-tighter tabular-nums text-shadow-glow">
                                    {formatTime(restTime)}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setRestTime(0)}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => setRestTime(prev => prev + 15)}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-bold rounded-xl transition-colors border border-cyan-500/20"
                                    >
                                        +15s
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-zinc-500 font-black tracking-widest uppercase mb-8">
                                    Set {currentSet}
                                </div>

                                <div className="flex items-center gap-6 mb-10 w-full max-w-sm">
                                    <div className="flex-1 flex flex-col items-center">
                                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Reps</label>
                                        <input
                                            type="number"
                                            value={inputReps}
                                            onChange={(e) => setInputReps(Number(e.target.value))}
                                            className="w-24 h-24 text-center bg-zinc-950 border border-zinc-700 rounded-2xl text-4xl font-black text-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all active:scale-95"
                                        />
                                    </div>
                                    <div className="text-4xl font-black text-zinc-800 flex items-center justify-center mt-6">
                                        ×
                                    </div>
                                    <div className="flex-1 flex flex-col items-center">
                                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Lbs</label>
                                        <input
                                            type="number"
                                            value={inputWeight}
                                            onChange={(e) => setInputWeight(Number(e.target.value))}
                                            className="w-24 h-24 text-center bg-zinc-950 border border-zinc-700 rounded-2xl text-4xl font-black text-white focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all active:scale-95"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={finishSet}
                                    className="w-full max-w-sm bg-cyan-500 hover:bg-cyan-400 text-zinc-950 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <Check className="w-6 h-6" />
                                    FINISH SET
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Completion Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-4 text-zinc-500 hover:text-white font-bold transition-colors border border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl"
                    >
                        Finish Exercise & Return
                    </button>
                </motion.div>
            </main>
        </div >
    );
}
