"use client";

import { motion } from "framer-motion";

const WaveTransition = () => {
    return (
        <div>
            <motion.div className="relative z-20 w-full pointer-events-none -mt-24 md:-mt-32 lg:-mt-48 leading-[0]"
                // initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <svg
                    className="w-full h-24 md:h-32 lg:h-48"
                    viewBox="0 0 1440 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 80L48 73C96 67 192 53 288 47C384 40 480 40 576 53C672 67 768 93 864 93C960 93 1056 67 1152 48C1248 29 1344 18 1392 13L1440 8L1440 320L1392 320C1344 320 1248 320 1152 320C1056 320 960 320 864 320C768 320 672 320 576 320C480 320 384 320 288 320C192 320 96 320 48 320H0Z"
                        style={{ fill: 'var(--background)' }}
                    />
                </svg>
            </motion.div>
        </div>
    )
}

export default WaveTransition;