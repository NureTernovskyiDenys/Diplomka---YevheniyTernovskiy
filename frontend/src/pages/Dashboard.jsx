import React, { useState, useEffect } from 'react';
import CardNav from '../components/CardNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Dumbbell, Activity, Target } from 'lucide-react';

const MUSCLE_GROUPS = [
    { id: 'chest', name: 'Chest', category: 'Upper Body' },
    { id: 'back', name: 'Back', category: 'Upper Body' },
    { id: 'shoulders', name: 'Shoulders', category: 'Upper Body' },
    { id: 'biceps', name: 'Biceps', category: 'Arms' },
    { id: 'triceps', name: 'Triceps', category: 'Arms' },
    { id: 'forearms', name: 'Forearms', category: 'Arms' },
    { id: 'core', name: 'Core / Abs', category: 'Core' },
    { id: 'quads', name: 'Quadriceps', category: 'Lower Body' },
    { id: 'hamstrings', name: 'Hamstrings', category: 'Lower Body' },
    { id: 'glutes', name: 'Glutes', category: 'Lower Body' },
    { id: 'calves', name: 'Calves', category: 'Lower Body' },
];

function CyberBodyMap({ activeMuscle, setActiveMuscle }) {
    // A stylized, glowing blocky representation of a body
    const parts = [
        { id: 'shoulders', label: 'Shoulders', classes: 'top-[15%] left-[25%] w-[50%] h-[10%]' },
        { id: 'chest', label: 'Chest', classes: 'top-[26%] left-[30%] w-[40%] h-[15%]' },
        { id: 'biceps', label: 'Biceps', classes: 'top-[30%] left-[15%] w-[12%] h-[15%]', mirror: 'left-[73%]' },
        { id: 'core', label: 'Core', classes: 'top-[42%] left-[35%] w-[30%] h-[15%]' },
        { id: 'forearms', label: 'Forearms', classes: 'top-[48%] left-[10%] w-[10%] h-[15%]', mirror: 'left-[80%]' },
        { id: 'quads', label: 'Quads', classes: 'top-[60%] left-[30%] w-[18%] h-[20%]', mirror: 'left-[52%]' },
        { id: 'calves', label: 'Calves', classes: 'top-[82%] left-[32%] w-[14%] h-[15%]', mirror: 'left-[54%]' },
    ];

    return (
        <div className="relative w-full max-w-sm aspect-[1/2] mx-auto bg-zinc-900/40 rounded-3xl border border-zinc-800/50 p-4 shadow-2xl backdrop-blur-sm overflow-hidden flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-indigo-500/5 z-0" />

            {/* The "Body" container */}
            <div className="relative w-full h-full z-10">
                {/* Head (Non-interactive) */}
                <div className="absolute top-[2%] left-[40%] w-[20%] h-[12%] bg-zinc-800 rounded-full border border-zinc-700" />

                {parts.map(part => (
                    <React.Fragment key={part.id}>
                        <motion.button
                            onClick={() => setActiveMuscle(part.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`absolute rounded-xl border transition-all duration-300 flex items-center justify-center ${part.classes} ${activeMuscle === part.id
                                ? 'bg-cyan-500/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20'
                                : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 z-10'
                                }`}
                        >
                            <span className="text-[10px] font-bold text-white/50 opacity-0 md:opacity-100">{part.label}</span>
                        </motion.button>

                        {/* Mirrored part for symmetry (arms, legs) */}
                        {part.mirror && (
                            <motion.button
                                onClick={() => setActiveMuscle(part.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`absolute rounded-xl border transition-all duration-300 flex items-center justify-center ${part.classes.replace(/left-\[\d+%\]/, part.mirror)} ${activeMuscle === part.id
                                    ? 'bg-cyan-500/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20'
                                    : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 z-10'
                                    }`}
                            >
                                <span className="text-[10px] font-bold text-white/50 opacity-0 md:opacity-100">{part.label}</span>
                            </motion.button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDAsMCwwLDApIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiAvPgo8L3N2Zz4=')] opacity-50 z-30" />
        </div>
    );
}

export default function Dashboard() {
    const [activeMuscle, setActiveMuscle] = useState(null);
    const [view, setView] = useState('front'); // 'front' | 'back'
    const [gender, setGender] = useState('male');

    // Exercise Data State
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [availableEquipment, setAvailableEquipment] = useState([]);

    useEffect(() => {
        if (!activeMuscle) return;

        const fetchExercises = async () => {
            setLoading(true);
            setExercises([]);
            setSelectedEquipment(null);
            try {
                // Determine base URL dynamically depending on dev or prod
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
                const response = await fetch(`${baseUrl}/api/nest/exercises/filter?muscles=${activeMuscle}`);
                if (!response.ok) throw new Error('Failed to fetch exercises');

                const data = await response.json();
                setExercises(data);

                // Extract all unique equipments from the returned exercises
                const equipments = new Set();
                data.forEach(ex => {
                    if (ex.equipments && Array.isArray(ex.equipments)) {
                        ex.equipments.forEach(eq => equipments.add(eq));
                    }
                });
                setAvailableEquipment(Array.from(equipments).sort());

            } catch (error) {
                console.error("Error fetching exercises:", error);
                setExercises([]);
                setAvailableEquipment([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [activeMuscle]);

    // Local filter for selected equipment
    const filteredExercises = selectedEquipment
        ? exercises.filter(ex => ex.equipments?.includes(selectedEquipment))
        : exercises;

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />

            {/* Main Content Area */}
            <main className="pt-32 px-6 max-w-7xl mx-auto">

                <div className="mb-12 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
                    >
                        Select a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Muscle</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg max-w-2xl"
                    >
                        Click on the interactive map or select from the list below to explore targeted exercises, analysis, and optimal form guidance.
                    </motion.p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Panel: Filters & List */}
                    <div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-6">

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-cyan-400" />
                                Controls
                            </h3>
                            <div className="flex bg-zinc-900 rounded-lg p-1 mb-4 border border-zinc-800">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${gender === 'male' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Male
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${gender === 'female' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Female
                                </button>
                            </div>
                            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                <button
                                    onClick={() => setView('front')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'front' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setView('back')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'back' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm overflow-hidden flex flex-col max-h-[500px]">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-indigo-400" />
                                Muscle Directory
                            </h3>
                            <div className="overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                                {MUSCLE_GROUPS.map((muscle) => (
                                    <button
                                        key={muscle.id}
                                        onClick={() => setActiveMuscle(muscle.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeMuscle === muscle.id
                                            ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-50'
                                            : 'bg-zinc-800/40 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold">{muscle.name}</span>
                                            <span className="text-xs opacity-60">{muscle.category}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${activeMuscle === muscle.id ? 'translate-x-1 text-cyan-400' : 'opacity-30'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Center Panel: Interactive Map */}
                    <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center">
                        <CyberBodyMap activeMuscle={activeMuscle} setActiveMuscle={setActiveMuscle} />
                    </div>

                    {/* Right Panel: Selected Muscle Info */}
                    <div className="lg:col-span-4 order-3 flex flex-col gap-6">
                        <AnimatePresence mode="popLayout">
                            {activeMuscle ? (
                                <motion.div
                                    key={activeMuscle}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-zinc-900/50 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.05)] backdrop-blur-md"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-black mb-1 capitalize text-white">
                                                {MUSCLE_GROUPS.find(m => m.id === activeMuscle)?.name || activeMuscle}
                                            </h2>
                                            <p className="text-cyan-400 text-sm font-medium mb-4">
                                                {MUSCLE_GROUPS.find(m => m.id === activeMuscle)?.category || 'General'} Group
                                            </p>

                                            {/* Equipment Filters */}
                                            {availableEquipment.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <button
                                                        onClick={() => setSelectedEquipment(null)}
                                                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${selectedEquipment === null
                                                                ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                                                : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                                            }`}
                                                    >
                                                        All
                                                    </button>
                                                    {availableEquipment.map(eq => (
                                                        <button
                                                            key={eq}
                                                            onClick={() => setSelectedEquipment(eq)}
                                                            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all capitalize ${selectedEquipment === eq
                                                                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                                                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                                                }`}
                                                        >
                                                            {eq}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 min-h-[300px] flex flex-col">
                                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                                    {selectedEquipment ? `${selectedEquipment} Exercises` : 'All Exercises'}
                                                </h4>
                                                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">{filteredExercises.length}</span>
                                            </div>

                                            {/* Scrollable Exercise List */}
                                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 relative">
                                                {loading ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 gap-3">
                                                        <Loader2 className="w-8 h-8 animate-spin" />
                                                        <span className="text-sm font-medium animate-pulse">Syncing Database...</span>
                                                    </div>
                                                ) : filteredExercises.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {filteredExercises.map(ex => (
                                                            <div key={ex.exerciseId} className="group relative flex gap-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer overflow-hidden">
                                                                <div className="w-20 h-20 rounded-lg bg-zinc-950 flex-shrink-0 overflow-hidden border border-zinc-800/50">
                                                                    {ex.gifUrl ? (
                                                                        <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" loading="lazy" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><Dumbbell className="w-6 h-6" /></div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                                                    <h5 className="font-bold text-zinc-100 capitalize truncate group-hover:text-cyan-400 transition-colors mb-1">
                                                                        {ex.name}
                                                                    </h5>
                                                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                                                        {ex.equipments?.slice(0, 2).map((eq, i) => (
                                                                            <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50 capitalize whitespace-nowrap">
                                                                                {eq}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-center px-4">
                                                        <Dumbbell className="w-10 h-10 opacity-20 mb-3" />
                                                        <p className="text-sm">No exercises found for this combination.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="w-full py-3 bg-transparent text-cyan-400 font-semibold rounded-xl border border-cyan-900/50 hover:bg-cyan-950/30 transition-colors flex items-center justify-center gap-2">
                                            Start Live AI Analysis
                                            <Activity className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center gap-4 text-zinc-500"
                                >
                                    <Target className="w-12 h-12 opacity-50 mb-2" />
                                    <h3 className="text-xl font-semibold text-zinc-400">No Muscle Selected</h3>
                                    <p className="text-sm max-w-[250px]">
                                        Click a muscle group on the interactive tech map or choose from the directory to start building your workout.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>

            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(39, 39, 42, 0.2); 
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(82, 82, 91, 0.5); 
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(113, 113, 122, 0.8); 
                }
            `}</style>
        </div>
    );
}
