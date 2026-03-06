import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Calculator, Scale, Target } from 'lucide-react';

export default function CardNav() {
    const navigate = useNavigate();
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    return (
        <nav className="fixed top-6 w-full px-6 flex justify-center z-50">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center justify-between gap-12 px-8 py-4 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl max-w-5xl w-full"
            >
                <div
                    onClick={() => navigate('/')}
                    className="font-black text-white text-xl tracking-tighter cursor-pointer flex items-center gap-2"
                >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                    GymAnalysis
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
                    <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Workouts</button>

                    {/* Tools Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsToolsOpen(true)}
                        onMouseLeave={() => setIsToolsOpen(false)}
                    >
                        <button className="flex items-center gap-1 hover:text-white transition-colors py-2">
                            Tools <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isToolsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-2"
                                >
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors group">
                                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                            <Scale className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white text-sm">Calories Calc</div>
                                            <div className="text-zinc-500 text-xs">Find your daily burn</div>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors group">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                            <Calculator className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white text-sm">Macro Calculator</div>
                                            <div className="text-zinc-500 text-xs">Optimize your diet</div>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors group">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white text-sm">One Rep Max</div>
                                            <div className="text-zinc-500 text-xs">Calculate your PR</div>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="hover:text-white transition-colors">Blog</button>
                    <button className="hover:text-white transition-colors">My workouts</button>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="text-sm font-semibold text-white px-5 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors">
                        Sign In
                    </button>
                </div>
            </motion.div>
        </nav>
    );
}
