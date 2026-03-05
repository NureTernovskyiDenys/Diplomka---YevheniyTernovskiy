import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Video, TrendingUp, Shield } from 'lucide-react';

export default function MagicBento() {
    const cards = [
        { title: "Live Tracking", icon: <Video className="w-6 h-6 text-cyan-400" />, colSpan: "md:col-span-2", rowSpan: "md:row-span-1", content: "Instant bodily tracking directly from your webcam." },
        { title: "Metrics Analysis", icon: <Activity className="w-6 h-6 text-blue-400" />, colSpan: "md:col-span-1", rowSpan: "md:row-span-2", content: "Detailed breakdown of your kinematic forms." },
        { title: "Progress Dashboard", icon: <TrendingUp className="w-6 h-6 text-indigo-400" />, colSpan: "md:col-span-1", rowSpan: "md:row-span-1", content: "Visualize your improvements week over week." },
        { title: "Secure Data", icon: <Shield className="w-6 h-6 text-emerald-400" />, colSpan: "md:col-span-1", rowSpan: "md:row-span-1", content: "End-to-end encryption for your workout streams." },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-32 px-4 bg-zinc-950">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">Magic Bento</h2>
                <p className="text-zinc-400 text-xl font-light">Everything you need, beautifully arranged.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className={`relative overflow-hidden p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 backdrop-blur-md group flex flex-col justify-between ${card.colSpan} ${card.rowSpan} hover:bg-zinc-800/40 transition-colors duration-500`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="mb-4 bg-zinc-950/50 p-4 rounded-2xl border border-white/5 inline-block shadow-inner">
                                {card.icon}
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">{card.title}</h3>
                        </div>
                        <p className="text-zinc-400 relative z-10">{card.content}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
