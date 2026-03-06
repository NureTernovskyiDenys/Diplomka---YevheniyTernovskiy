import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Calculator, Scale, Target, LogOut, User } from 'lucide-react';
import { isAuthenticated, logout, getUserObject } from '../utils/auth';

export default function CardNav({ minimal = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const isAuth = isAuthenticated();

    useEffect(() => {
        if (isAuth) {
            setUser(getUserObject());
        }
    }, [isAuth, location.pathname]);

    const handleLogout = () => {
        logout();
    };

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
                {!minimal && (
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                        <button onClick={() => navigate('/')} className={`transition-colors ${location.pathname === '/' ? 'text-white' : 'hover:text-white'}`}>Home</button>
                        <button onClick={() => navigate('/dashboard')} className={`transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'hover:text-white'}`}>Workouts</button>

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
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isAuth ? (
                        <div
                            className="relative"
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                        >
                            <button className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors">
                                <User className="w-4 h-4" />
                                {user?.email ? user.email.split('@')[0] : 'Profile'}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-2"
                                    >
                                        <div className="px-4 py-2 border-b border-zinc-800/50 mb-1">
                                            <p className="text-xs text-zinc-500">Signed in as</p>
                                            <p className="text-sm text-zinc-300 font-medium truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/50 transition-colors text-zinc-300 text-sm"
                                        >
                                            <User className="w-4 h-4 text-zinc-400" />
                                            My Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 hover:text-red-400 transition-colors text-zinc-300 text-sm mt-1"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="text-sm font-semibold text-white px-5 py-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition-colors">
                            Sign In
                        </button>
                    )}
                </div>
            </motion.div>
        </nav>
    );
}
