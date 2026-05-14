import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Activity, Zap } from 'lucide-react';
import CardNav from '../components/CardNav';

export default function OneRepMax() {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [unit, setUnit] = useState('kg');

    const result = useMemo(() => {
        const w = parseFloat(weight);
        const r = parseInt(reps);

        if (!w || !r || w <= 0 || r <= 0) return null;
        if (r === 1) return { max: w, formula: 'Actual' };

        // Epley Formula
        const epley = w * (1 + 0.0333 * r);
        // Brzycki Formula
        const brzycki = w * (36 / (37 - r));

        // Average for a balanced result
        const average = r < 10 ? (epley + brzycki) / 2 : epley;

        return {
            max: Math.round(average * 10) / 10,
            epley: Math.round(epley * 10) / 10,
            brzycki: Math.round(brzycki * 10) / 10
        };

    }, [weight, reps]);

    // Standard percentage breakdowns for training zones
    const percentages = useMemo(() => {
        if (!result) return [];
        const max = result.max;
        return [
            { pct: 100, reps: 1, label: 'Absolute Max', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { pct: 95, reps: 2, label: 'Heavy Double', color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { pct: 90, reps: 4, label: 'Strength', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { pct: 85, reps: 6, label: 'Power/Hypertrophy', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { pct: 80, reps: 8, label: 'Hypertrophy', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            { pct: 75, reps: 10, label: 'Volume', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { pct: 70, reps: 12, label: 'Endurance', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        ].map(item => ({
            ...item,
            weight: Math.round((max * (item.pct / 100)) * 10) / 10
        }));
    }, [result]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20 md:pb-6 selection:bg-rose-500/30 overflow-x-hidden">
            <CardNav />

            <main className="pt-28 md:pt-36 px-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <Dumbbell className="w-7 h-7 text-rose-400 transform -rotate-45" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">1 Rep Max</h1>
                        <p className="text-zinc-400 text-sm mt-1">Calculate your absolute lifting limit and training zones.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Side: Input & Primary Result */}
                    <div className="space-y-8">
                        {/* Input Card */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Your Recent Lift
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-zinc-400">Weight Lifted</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder="100"
                                            className="w-full bg-zinc-950 border border-zinc-700 focus:border-rose-500 rounded-xl px-4 py-4 text-2xl font-black tabular-nums text-white outline-none transition-colors pr-16"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <button
                                                onClick={() => setUnit('kg')}
                                                className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${unit === 'kg' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                onClick={() => setUnit('lbs')}
                                                className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${unit === 'lbs' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                            >
                                                lbs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-zinc-400">Reps Completed</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={reps}
                                            onChange={(e) => setReps(e.target.value)}
                                            placeholder="5"
                                            min="1"
                                            max="30"
                                            className="w-full bg-zinc-950 border border-zinc-700 focus:border-rose-500 rounded-xl px-4 py-4 text-2xl font-black tabular-nums text-white outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                                            reps
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result Big Display */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-zinc-900 border-2 border-rose-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                    <div className="text-center">
                                        <h3 className="text-rose-400 font-black uppercase tracking-widest text-sm mb-4">Estimated 1 Rep Max</h3>
                                        <div className="flex justify-center items-baseline gap-2 mb-2">
                                            <span className="text-6xl md:text-8xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
                                                {result.max}
                                            </span>
                                            <span className="text-xl md:text-2xl font-bold text-zinc-500 uppercase">{unit}</span>
                                        </div>
                                        {reps > 1 && (
                                            <p className="text-zinc-400 text-sm mt-4">
                                                Based on {weight} {unit} for {reps} reps
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Side: Training Zones */}
                    <div className="h-full">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl h-full flex flex-col">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                                <Target className="w-5 h-5 text-emerald-400" />
                                Training Zones
                            </h2>

                            {!result ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4 min-h-[300px]">
                                    <Activity className="w-12 h-12 text-zinc-800" />
                                    <p>Enter your lift data to see training zones.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {percentages.map((zone) => (
                                        <motion.div
                                            key={zone.pct}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-center justify-between p-4 rounded-2xl border border-zinc-800/50 ${zone.bg}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 text-right text-lg font-black ${zone.color}`}>
                                                    {zone.pct}%
                                                </div>
                                                <div className="hidden sm:block w-px h-8 bg-zinc-800/50"></div>
                                                <div>
                                                    <div className="text-white font-bold">{zone.weight} {unit}</div>
                                                    <div className="text-xs text-zinc-400">{zone.label}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-zinc-300">~{zone.reps}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Reps</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
