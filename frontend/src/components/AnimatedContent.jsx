import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const AnimatedContent = ({
    children,
    distance = 100,
    direction = 'vertical',
    reverse = false,
    config = { tension: 50, friction: 25 },
    initialOpacity = 0,
    animateOpacity = 1,
    scale = 1,
    threshold = 0.1,
    delay = 0,
    className = ''
}) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: `-${threshold * 100}px` });

    const yValue = direction === 'vertical' ? (reverse ? -distance : distance) : 0;
    const xValue = direction === 'horizontal' ? (reverse ? -distance : distance) : 0;

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: initialOpacity,
                y: yValue,
                x: xValue,
                scale: scale
            }}
            animate={
                inView
                    ? { opacity: animateOpacity, y: 0, x: 0, scale: 1 }
                    : { opacity: initialOpacity, y: yValue, x: xValue, scale: scale }
            }
            transition={{
                type: 'spring',
                stiffness: config.tension,
                damping: config.friction,
                delay: delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedContent;
