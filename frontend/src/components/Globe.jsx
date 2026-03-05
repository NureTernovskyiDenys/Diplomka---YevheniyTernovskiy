import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function GlobeComponent() {
    const canvasRef = useRef(null);

    useEffect(() => {
        let phi = 0;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 1000,
            height: 1000,
            phi: 0,
            theta: 0.2,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 24000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.12],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            },
        });

        return () => globe.destroy();
    }, []);

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-between py-32 px-8 max-w-7xl mx-auto bg-zinc-950 overflow-hidden relative ">
            <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none" />

            <div className="text-left mb-12 md:mb-0 z-10 relative md:w-1/2 md:pr-12">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight">Use it everywhere</h2>
                <p className="text-zinc-400 text-xl md:text-2xl font-light">Global edge network for zero-latency analysis.</p>
            </div>

            <div className="relative w-full md:w-1/2 aspect-square flex items-center justify-center scale-[1.2] md:scale-[1.4]">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                    style={{ width: '100%', maxWidth: '100%' }}
                />
                <div className="absolute inset-0 pointer-events-none" />
            </div>
        </div>
    );
}
