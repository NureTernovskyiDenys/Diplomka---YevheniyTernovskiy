import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Text3DReveal = ({
    items = [],
    className = "",
    textClassName = "",
    scrollDistance = "1000svh",
    perspective = 1500,
    radiusOffset = 0.5,
    startRotation = -90,
    endRotation = 180,
    scrubSmoothing = 1,
    fontSize = "clamp(3rem, 9vw, 8rem)",
    fontWeight = 900,
    gap = 25,
}) => {
    const containerRef = useRef(null);
    const cylinderRef = useRef(null);

    useLayoutEffect(() => {
        if (!containerRef.current || !cylinderRef.current) return;

        let ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "center center",
                end: `+=${scrollDistance}`,
                pin: containerRef.current,
                scrub: scrubSmoothing,
                animation: gsap.fromTo(cylinderRef.current,
                    { rotateX: startRotation },
                    { rotateX: endRotation, ease: "none" }
                ),
            });
        }, containerRef);

        return () => ctx.revert();
    }, [scrollDistance, startRotation, endRotation, scrubSmoothing]);

    // Handle responsive radius calculation
    const radius = typeof window !== 'undefined' ? (Math.min(window.innerWidth, window.innerHeight) * radiusOffset) : 300;
    // Calculate spacing between items
    const spacing = 180 / items.length;

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden flex flex-col items-center justify-center bg-zinc-950 ${className}`}
            style={{ height: '50svh', perspective: `${perspective}px` }}
        >
            <div
                ref={cylinderRef}
                className="absolute w-full text-center will-change-transform"
                style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
            >
                {items.map((item, i) => {
                    // Codrops Math
                    const angle = (i * spacing * Math.PI) / 180;
                    const rotationAngle = i * -spacing;

                    const x = 0;
                    const y = Math.sin(angle) * radius;
                    const z = Math.cos(angle) * radius;

                    return (
                        <div
                            key={i}
                            className={`absolute top-1/2 left-1/2 w-full text-white text-center uppercase tracking-normal leading-none ${textClassName}`}
                            style={{
                                fontSize,
                                fontWeight,
                                transform: `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotationAngle}deg)`,
                                backfaceVisibility: "hidden"
                            }}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
            <div className="absolute inset-0  from-zinc-950 via-transparent to-zinc-950 pointer-events-none" />
        </div>
    );
};

export default Text3DReveal;
