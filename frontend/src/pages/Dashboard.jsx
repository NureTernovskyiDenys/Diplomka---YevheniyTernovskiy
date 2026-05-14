import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardNav from '../components/CardNav';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Calendar } from 'lucide-react';
import { getUserObject } from '../utils/auth';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = getUserObject();

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />

            <main className="pt-32 px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                        Welcome back, <span className="text-cyan-400">{user?.firstName || 'Athlete'}</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Ready to crush your goals today? Let's get to work.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Access Workouts Panel */}
                    <div
                        onClick={() => navigate('/workouts')}
                        className="group relative overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 rounded-3xl p-8 cursor-pointer transition-all shadow-xl hover:bg-zinc-800/80"
                    >
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                            <Dumbbell className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">My Workouts</h2>
                        <p className="text-zinc-500">Access your saved routines or explore the community collection.</p>

                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Dumbbell className="w-32 h-32 rotate-12" />
                        </div>
                    </div>

                    {/* Explore Exercises Panel */}
                    <div
                        onClick={() => navigate('/exercises')}
                        className="group relative overflow-hidden bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/50 rounded-3xl p-8 cursor-pointer transition-all shadow-xl hover:bg-zinc-800/80"
                    >
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Exercise Library</h2>
                        <p className="text-zinc-500">Search globally across hundreds of exercises by target, body part, or equipment.</p>

                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Activity className="w-32 h-32 rotate-12" />
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="mt-12">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-500" />
                        Recent Activity
                    </h3>
                    <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
                        <p>No recent activity tracked yet. Time to log a session!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
