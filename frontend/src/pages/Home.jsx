import React from 'react';
import AuroraBackground from '../components/AuroraBackground';
import AnimatedContent from '../components/AnimatedContent';
import SplitText from '../components/SplitText';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import CardNav from '../components/CardNav';
import Text3DReveal from '../components/Text3DReveal';
import MagicBento from '../components/MagicBento';
import GlobeComponent from '../components/Globe';
import Footer from '../components/Footer';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-950 min-h-screen font-sans selection:bg-cyan-500/30">
            <CardNav />

            <AuroraBackground>
                <div className="flex flex-col items-center justify-center min-h-[100vh] p-4 text-center">

                    {/* Hero Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-tight max-w-5xl mx-auto">
                        <SplitText text="Master Your" delay={30} className="block" />
                        <span className="block bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                            <SplitText text="Technique" delay={40} />
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <AnimatedContent distance={30} direction="vertical" delay={0.6} initialOpacity={0}>
                        <p className="max-w-2xl mx-auto mb-12 text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
                            AI-powered form analysis in your browser. Upload video chunks and get instant,
                            intelligent feedback on your repetitions—no hardware required.
                        </p>
                    </AnimatedContent>

                    {/* Call to Actions */}
                    <AnimatedContent distance={20} direction="vertical" delay={0.8} initialOpacity={0}>
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <motion.button
                                onClick={() => navigate('/login')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-zinc-950 font-bold rounded-full overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 transition-colors group-hover:text-zinc-900">Start Training</span>
                            </motion.button>

                            <motion.button
                                onClick={() => navigate('/demo')}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-zinc-900/40 text-white font-medium rounded-full border border-zinc-700/50 backdrop-blur-sm transition-colors cursor-pointer"
                            >
                                Watch Demo
                            </motion.button>
                        </div>
                    </AnimatedContent>

                </div>
            </AuroraBackground>

            <Text3DReveal
                items={["Analyze", "Every", "Single", "Move", "You", "Make"]}
                textClassName="font-black"
            />

            <MagicBento />

            <GlobeComponent />

            <Footer />
        </div>
    );
}

export default Home;
