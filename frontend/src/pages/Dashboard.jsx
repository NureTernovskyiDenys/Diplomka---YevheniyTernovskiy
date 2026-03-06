import React, { useState, useEffect } from 'react';
import CardNav from '../components/CardNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Dumbbell, Activity, Target, Loader2 } from 'lucide-react';

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
    const [allEquipments, setAllEquipments] = useState([]);
    const [ownedEquipments, setOwnedEquipments] = useState([]);
    const [targetMode, setTargetMode] = useState('simplified');
    const [targetOptions, setTargetOptions] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setShowResults(false);
    }, [activeMuscle, ownedEquipments]);

    useEffect(() => {
        const fetchTargets = async () => {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const endpoint = targetMode === 'simplified' ? '/api/nest/exercises/bodyparts' : '/api/nest/exercises/muscles';
            try {
                const response = await fetch(`${baseUrl}${endpoint}`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) setTargetOptions(data);
                    else if (data && Array.isArray(data.data)) setTargetOptions(data.data);
                }
            } catch (e) {
                console.error("Error fetching targets:", e);
            }
        };
        fetchTargets();
    }, [targetMode]);

    const handleSearch = async () => {
        setLoading(true);
        setShowResults(true);
        setExercises([]);
        setSelectedEquipment(null);

        const terms = [];
        if (activeMuscle) terms.push(activeMuscle);
        if (ownedEquipments.length > 0) terms.push(...ownedEquipments);

        const qVal = terms.join('+');

        try {
            const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
            const response = await fetch(`${baseUrl}/api/nest/exercises/search?q=${encodeURIComponent(qVal)}&limit=50`);
            if (!response.ok) throw new Error('Failed to fetch exercises');

            const data = await response.json();
            const results = Array.isArray(data) ? data : (data?.data || []);
            setExercises(results);

            const equipments = new Set();
            results.forEach(ex => {
                if (ex.equipments && Array.isArray(ex.equipments)) {
                    ex.equipments.forEach(eq => equipments.add(eq));
                } else if (ex.equipment && typeof ex.equipment === 'string') {
                    equipments.add(ex.equipment);
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

    // Fetch all available equipments on mount
    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
                const response = await fetch(`${baseUrl}/api/nest/exercises/equipments`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setAllEquipments(data);
                    } else if (data && Array.isArray(data.data)) {
                        setAllEquipments(data.data);
                    } else {
                        console.error("Equipments API returned non-array data:", data);
                        setAllEquipments([]);
                    }
                } else {
                    console.error("Equipments API failed with status:", response.status);
                    setAllEquipments([]);
                }
            } catch (error) {
                console.error("Error fetching available equipments:", error);
            }
        };
        fetchEquipments();
    }, []);

    // Local filter for selected equipment and globally owned equipment
    const filteredExercises = exercises.filter(ex => {
        const eqs = ex.equipments || (ex.equipment ? [ex.equipment] : []);

        // filter by globally owned equipment (from the left panel directory)
        if (ownedEquipments.length > 0) {
            const hasOwned = eqs.some(eq => ownedEquipments.includes(eq));
            if (!hasOwned && eqs.length > 0) return false;
        }

        // filter by the selected chip in the right panel
        if (selectedEquipment) {
            if (!eqs.includes(selectedEquipment)) return false;
        }

        return true;
    });

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

                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm overflow-hidden flex flex-col max-h-[500px]">
                            <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Dumbbell className="w-5 h-5 text-indigo-400" />
                                    My Equipment
                                </div>
                                {ownedEquipments.length > 0 && (
                                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md">
                                        {ownedEquipments.length} selected
                                    </span>
                                )}
                            </h3>
                            <div className="overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2 relative min-h-[100px]">
                                {allEquipments.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                                        <span className="text-xs">Loading items...</span>
                                    </div>
                                ) : Array.isArray(allEquipments) ? (
                                    allEquipments.map((eq) => {
                                        // Ensure eq is a primitive string to avoid React rendering errors with Objects
                                        const eqName = typeof eq === 'string' ? eq : (eq?.name || 'Unknown');
                                        return (
                                            <button
                                                key={eqName}
                                                onClick={() => {
                                                    if (ownedEquipments.includes(eqName)) {
                                                        setOwnedEquipments(ownedEquipments.filter(e => e !== eqName));
                                                    } else {
                                                        setOwnedEquipments([...ownedEquipments, eqName]);
                                                    }
                                                }}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${ownedEquipments.includes(eqName)
                                                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-50'
                                                    : 'bg-zinc-800/40 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                                                    }`}
                                            >
                                                <span className="font-semibold capitalize text-sm">{eqName}</span>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${ownedEquipments.includes(eqName) ? 'border-cyan-400 bg-cyan-400' : 'border-zinc-600'}`}>
                                                    {ownedEquipments.includes(eqName) && <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                                                </div>
                                            </button>
                                        )
                                    })
                                ) : null}
                            </div>
                        </div>

                    </div>

                    {/* Center Panel: Interactive Map */}
                    <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center">
                        {/* Mode Switch */}
                        <div className="w-full max-w-sm bg-zinc-900/40 rounded-2xl border border-zinc-800/50 p-2 mb-6 flex relative">
                            <div className={`absolute inset-y-2 w-[calc(50%-8px)] bg-zinc-800 rounded-xl transition-all duration-300 ease-out z-0 ${targetMode === 'simplified' ? 'left-2' : 'left-[calc(50%+4px)]'}`} />
                            <button
                                onClick={() => setTargetMode('simplified')}
                                className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors ${targetMode === 'simplified' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Simplified
                            </button>
                            <button
                                onClick={() => setTargetMode('full')}
                                className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors ${targetMode === 'full' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Full
                            </button>
                        </div>

                        <CyberBodyMap activeMuscle={activeMuscle} setActiveMuscle={setActiveMuscle} />

                        {/* Body Parts / Muscles List */}
                        <div className="w-full mt-6 flex flex-wrap gap-2 justify-center max-h-[180px] overflow-y-auto custom-scrollbar p-2">
                            {targetOptions.map(opt => {
                                const optName = typeof opt === 'string' ? opt : (opt?.name || 'Unknown');
                                return (
                                    <button
                                        key={optName}
                                        onClick={() => setActiveMuscle(activeMuscle === optName ? null : optName)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all capitalize ${activeMuscle === optName ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                                    >
                                        {optName}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Selected Muscle Info */}
                    <div className="lg:col-span-4 order-3 flex flex-col gap-6">
                        <AnimatePresence mode="popLayout">
                            {showResults ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-zinc-900/50 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.05)] backdrop-blur-md"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-black mb-1 capitalize text-white">
                                                {MUSCLE_GROUPS.find(m => m.id === activeMuscle)?.name || activeMuscle || 'Custom Search'}
                                            </h2>
                                            <p className="text-cyan-400 text-sm font-medium mb-4">
                                                {activeMuscle ? (MUSCLE_GROUPS.find(m => m.id === activeMuscle)?.category || 'Targeted') : 'Equipment Based'}
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
                                                                        {(() => {
                                                                            const eqs = ex.equipments || (ex.equipment ? [ex.equipment] : []);
                                                                            return eqs.slice(0, 2).map((eq, i) => (
                                                                                <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50 capitalize whitespace-nowrap">
                                                                                    {eq}
                                                                                </span>
                                                                            ));
                                                                        })()}
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
                            ) : (activeMuscle || ownedEquipments.length > 0) ? (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-zinc-900/20 border border-cyan-500/30 border-dashed rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center gap-6 text-zinc-500"
                                >
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {activeMuscle && <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold capitalize border border-indigo-500/50">Target: {activeMuscle}</span>}
                                        {ownedEquipments.length > 0 && <span className="px-4 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-semibold border border-cyan-500/50">Equipments: {ownedEquipments.length}</span>}
                                    </div>
                                    <h3 className="text-2xl font-black text-white">Ready to Search</h3>
                                    <p className="text-sm max-w-[300px] text-zinc-400">
                                        Click below to find exercises matching your selected constraints.
                                    </p>
                                    <button
                                        onClick={handleSearch}
                                        className="mt-4 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-3"
                                    >
                                        Find Workouts <ChevronRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center gap-4 text-zinc-500"
                                >
                                    <Target className="w-12 h-12 opacity-50 mb-2" />
                                    <h3 className="text-xl font-semibold text-zinc-400">No Target Selected</h3>
                                    <p className="text-sm max-w-[250px]">
                                        Click a muscle group, choose a body part, or select equipment to start building your workout.
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
