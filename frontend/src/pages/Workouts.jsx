import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, List as ListIcon, Loader2, Dumbbell, User } from 'lucide-react';
import CardNav from '../components/CardNav';
import { jwtDecode } from 'jwt-decode';

export default function Workouts() {
    const navigate = useNavigate();

    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMine, setFilterMine] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Get current user ID from token to handle "Created by me"
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.sub);
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
    }, []);

    // Debounced fetch
    useEffect(() => {
        const fetchWorkouts = async () => {
            setLoading(true);
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                // Build query params
                const params = new URLSearchParams();
                if (searchTerm.trim()) {
                    params.append('search', searchTerm.trim());
                }
                if (filterMine && currentUserId) {
                    params.append('author', currentUserId);
                }

                const res = await fetch(`${baseUrl}/api/nest/workouts?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setWorkouts(data);
                }
            } catch (error) {
                console.error("Failed to fetch workouts:", error);
                setWorkouts([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchWorkouts();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterMine, currentUserId]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />
            <main className="pt-32 px-6 max-w-7xl mx-auto">
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black capitalize tracking-tight mb-4"
                    >
                        Community Workouts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-lg max-w-2xl"
                    >
                        Discover routines built by other athletes, or browse your own custom training plans.
                    </motion.p>
                </div>

                {/* Filters & Search */}
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 md:p-6 mb-8 shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search workout plans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer self-start md:self-auto group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={filterMine}
                                onChange={() => setFilterMine(!filterMine)}
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors ${filterMine ? 'bg-cyan-500' : 'bg-zinc-800'}`}></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${filterMine ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <span className={`font-semibold transition-colors ${filterMine ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-300'}`}>Created by me</span>
                    </label>
                </div>

                {/* Workout Grid */}
                <div className="relative min-h-[400px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium animate-pulse">Scanning Data...</span>
                        </div>
                    ) : workouts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {workouts.map((workout, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={workout._id}
                                        onClick={() => navigate(`/workout/${workout._id}`)}
                                        className="group relative flex flex-col p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer overflow-hidden shadow-xl"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                                <ListIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-mono bg-zinc-950 text-zinc-500 px-2 py-1 rounded-md border border-zinc-800">
                                                {new Date(workout.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                                            {workout.name}
                                        </h3>

                                        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                                            <User className="w-4 h-4" />
                                            {workout.user?.firstName ? `${workout.user.firstName} ${workout.user.lastName}`.trim() : 'Anonymous'}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                                <Dumbbell className="w-4 h-4" />
                                                {workout.exercises?.length || 0} Exercises
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-center px-4">
                            <ListIcon className="w-16 h-16 opacity-20 mb-4" />
                            <h3 className="text-xl font-bold text-zinc-400 mb-2">No Workouts Found</h3>
                            <p className="text-md max-w-sm">
                                {filterMine ? "You haven't created any workouts yet. Head over to the Exercises page to build one!" : "No community workouts match your search."}
                            </p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
