import React from 'react';
import { motion } from 'framer-motion';

const AuroraBackground = ({ children, className = "" }) => {
    return (
        <div
            className={`relative flex flex-col h-[100vh] items-center justify-center bg-zinc-950 text-slate-200 transition-bg ${className}`}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className="absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 blur-[100px]" />
                    <motion.div
                        initial={{ "--x": "100%", scale: 1.5 }}
                        animate={{ "--x": "-10%" }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 10,
                            ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/20 to-transparent mix-blend-screen"
                        style={{
                            transform: "translateX(var(--x)) scale(1.5)",
                            willChange: "transform",
                        }}
                    />
                </div>
            </div>
            <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
};

export default AuroraBackground;
