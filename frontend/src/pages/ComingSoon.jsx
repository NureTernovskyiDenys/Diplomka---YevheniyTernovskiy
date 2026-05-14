import React from 'react';
import CardNav from '../components/CardNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-950 min-h-screen font-sans selection:bg-cyan-500/30 flex flex-col">
            <CardNav />

            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                {/* Background ambient lighting */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                        Working on it.
                    </h1>

                    <p className="text-xl text-zinc-400 font-light mb-12 max-w-lg mx-auto leading-relaxed">
                        This experiment is currently in development in the lab. Check back soon for updates.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-zinc-900/40 text-white font-medium rounded-full border border-zinc-700/50 backdrop-blur-sm transition-colors hover:bg-white/10 hover:border-white/20"
                    >
                        ← Return Home
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
