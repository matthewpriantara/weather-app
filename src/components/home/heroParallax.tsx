"use client";

import { useRef } from "react";
import GetStartedButton from "./getStartedButton";
import { motion, useScroll, useTransform } from "framer-motion";

const HeroParallax = ({ children }: { children: React.ReactNode }) => {
    const targetRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    })

    const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1])
    const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(10px)"])
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]) //ini digunakan untuk memberi animasi atau efek text keatas
    const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]) //ini digunakan untuk memberi animasi atau efek text fade out
    const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.5])


    return (
        <section id="beranda" ref={targetRef}
            className="relative min-h-[120vh] overflow-hidden flex flex-col items-center justify-center"
        >
            <motion.div
                className="absolute inset-0 bg-cover bg-center origin-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    scale: scale,
                    filter: blur
                }}
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

            <motion.div
                className="relative z-10 text-center w-full flex flex-col -mt-32"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{
                    y: textY,
                    opacity: textOpacity,
                    scale: textScale
                }}
            >
                {children}
            </motion.div>

        </section>
    );
}

export default HeroParallax;