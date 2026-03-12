import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardNav from '../components/CardNav';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target } from 'lucide-react';
import Model from 'react-body-highlighter';

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

const MUSCLE_MAPPING = {
    'chest': 'pectorals',
    'abs': 'abs',
    'obliques': 'abs',
    'front-deltoids': 'delts',
    'back-deltoids': 'delts',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'forearm': 'forearms',
    'upper-back': 'upper back',
    'lower-back': 'spine',
    'trapezius': 'traps',
    'gluteal': 'glutes',
    'quadriceps': 'quads',
    'hamstring': 'hamstrings',
    'adductor': 'adductors',
    'abductors': 'abductors',
    'calves': 'calves',
    'head': 'neck',
    'neck': 'neck'
};

const BODYPART_MAPPING = {
    'chest': 'chest',
    'abs': 'waist',
    'obliques': 'waist',
    'front-deltoids': 'shoulders',
    'back-deltoids': 'shoulders',
    'biceps': 'upper arms',
    'triceps': 'upper arms',
    'forearm': 'lower arms',
    'upper-back': 'back',
    'lower-back': 'back',
    'trapezius': 'back',
    'gluteal': 'upper legs',
    'quadriceps': 'upper legs',
    'hamstring': 'upper legs',
    'adductor': 'upper legs',
    'abductors': 'upper legs',
    'calves': 'lower legs',
    'head': 'neck',
    'neck': 'neck'
};

function DualBodyMap({ activeMuscles, setActiveMuscles, mode, gender }) {
    const getHighlightedMuscles = () => {
        if (!activeMuscles || activeMuscles.length === 0) return [];
        const map = mode === 'full' ? MUSCLE_MAPPING : BODYPART_MAPPING;
        const slugs = Object.keys(map).filter(k => activeMuscles.includes(map[k]));
        return slugs;
    };

    const highlighted = getHighlightedMuscles();
    const data = highlighted.length > 0 ? [{ name: 'Targets', muscles: highlighted }] : [];

    const handleClick = ({ muscle }) => {
        const map = mode === 'full' ? MUSCLE_MAPPING : BODYPART_MAPPING;
        const apiTarget = map[muscle];

        if (apiTarget) {
            setActiveMuscles(prev => {
                if (prev.includes(apiTarget)) {
                    return prev.filter(t => t !== apiTarget);
                } else {
                    return [...prev, apiTarget];
                }
            });
        }
    };

    return (
        <div className="flex flex-row items-center justify-center gap-6 w-full h-[650px]">
            <div className="h-full bg-zinc-900/40 rounded-3xl border border-zinc-800/60 p-6 drop-shadow-2xl overflow-hidden flex items-center justify-center transition-all hover:border-cyan-500/30">
                <Model
                    type="anterior"
                    gender={gender}
                    data={data}
                    style={{ height: '600px', cursor: 'pointer' }}
                    onClick={handleClick}
                    highlightedColors={['#06b6d4']}
                    bodyColor="#27272a"
                />
            </div>
            <div className="h-full bg-zinc-900/40 rounded-3xl border border-zinc-800/60 p-6 drop-shadow-2xl overflow-hidden flex items-center justify-center transition-all hover:border-cyan-500/30">
                <Model
                    type="posterior"
                    gender={gender}
                    data={data}
                    style={{ height: '600px', cursor: 'pointer' }}
                    onClick={handleClick}
                    highlightedColors={['#06b6d4']}
                    bodyColor="#27272a"
                />
            </div>
        </div>
    );
}

export default function Home() {
    const [activeMuscles, setActiveMuscles] = useState([]);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (activeMuscles.length > 0) {
            const query = activeMuscles.join('+');
            navigate(`/exercises?q=${encodeURIComponent(query)}`);
        }
    };

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

                    {/* Center Panel: Interactive Map */}
                    <div className="lg:col-span-7 order-1 lg:order-1 flex flex-col items-center">
                        <DualBodyMap activeMuscles={activeMuscles} setActiveMuscles={setActiveMuscles} mode="full" gender="male" />
                    </div>

                    {/* Right Panel: Selected Muscle Info */}
                    <div className="lg:col-span-5 order-2 lg:order-2 flex flex-col gap-6">
                        <AnimatePresence mode="popLayout">
                            {activeMuscles.length > 0 ? (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-zinc-900/20 border border-cyan-500/30 border-dashed rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center gap-6 text-zinc-500"
                                >
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {activeMuscles.map(m => (
                                            <span key={m} className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold capitalize border border-indigo-500/50">
                                                {m}
                                            </span>
                                        ))}
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
        </div>
    );
}
