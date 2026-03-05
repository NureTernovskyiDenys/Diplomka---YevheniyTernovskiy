import React from 'react';
import { motion } from 'framer-motion';

export default function CardNav() {
    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-6 px-6 py-3 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
            >
                <div className="font-black text-white text-xl tracking-tighter">GymAnalysis</div>
                {/* <div className="flex gap-6 text-sm font-medium text-zinc-400">
                    <a href="#" className="hover:text-white transition-colors">Home</a>
                    <a href="#" className="hover:text-white transition-colors">Analysis</a>
                    <a href="#" className="hover:text-white transition-colors">Tools</a>
                    <a href="#" className="hover:text-white transition-colors">Blog</a>
                </div> */}
            </motion.div>
        </nav>
    );
}
