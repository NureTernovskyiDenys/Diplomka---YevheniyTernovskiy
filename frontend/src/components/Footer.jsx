import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-zinc-950 text-white font-sans border-t border-white/5">
            {/* Top Section - Links Grid */}
            <div className="max-w-7xl mx-auto px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                    {/* Column 1 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Explore</h4>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Playground</a>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Showcase</a>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Docs</a>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Studio</h4>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Experiments</a>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Prototypes</a>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Community</h4>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Discussion</a>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Events</a>
                        <a href="#" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">Hackathons</a>
                    </div>

                    {/* Column 4 */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-semibold tracking-wider text-zinc-500 uppercase mb-2">Connect</h4>
                        <a href="mailto:hello@gymanalysis.com" className="text-2xl md:text-xl font-bold hover:text-cyan-400 transition-colors">
                            hello@gymanalysis.com
                        </a>
                    </div>

                </div>
            </div>

            {/* Bottom Section - Copyright & Socials */}
            <div className="w-full bg-white text-zinc-900 py-6 md:py-8">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">

                    {/* Logo Area */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                            <span className="text-white font-black text-sm">G</span>
                        </div>
                        <span className="font-extrabold text-xl tracking-tight">GymAnalysis</span>
                    </div>

                    {/* Copyright Mobile First, Socials Right */}
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full md:w-auto">
                        <p className="text-sm font-medium text-zinc-500 text-center md:text-left">
                            © 2026 GymAnalysis Labs - All Rights Reserved
                        </p>

                        <div className="flex items-center gap-6">
                            <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                                <Linkedin size={20} strokeWidth={2.5} />
                            </a>
                            <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                                <Twitter size={20} strokeWidth={2.5} />
                            </a>
                            <a href="#" className="text-zinc-600 hover:text-zinc-900 transition-colors">
                                <Github size={20} strokeWidth={2.5} />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}
