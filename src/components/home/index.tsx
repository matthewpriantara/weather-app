"use client";

import GetStartedButton from "./getStartedButton";
import HeroParallax from "./heroParallax";
import WaveTransition from "./WaveTransition";
import dynamic from "next/dynamic";

// import map component without ssr
const InteractiveMap = dynamic(() => import("./mapComponent"), {
    ssr: false,
    loading: () => <p className="text-center font-bold">Memuat Peta...</p>,
});


const Home = () => {
    return (
        <main>
            <HeroParallax>
                <div className="flex flex-col items-center justify-center px-8 text-white relative z-10">
                    <h1 className="font-serif text-sky-200 text-8xl font-bold mb-5 drop-shadow-lg">
                        SkyCast
                    </h1>
                    <p className="text-lg drop-shadow-md">Real-time weather updates with clean insights and accurate forecasts.</p>
                    <p className="text-lg drop-shadow-md">Search any city and get instant climate information in a simple, modern interface.</p>

                    <GetStartedButton />
                </div>
            </HeroParallax>

            <WaveTransition />

            <section className="min-h-screen bg-background text-black flex flex-col items-center pt-10 px-20 pb-20 z-20 relative">
                <h2 className="text-4xl text-primary font-serif font-bold mb-10">Peta Cuaca Interaktif</h2>

                {/* WADAH PETA Wajib dikasih height dan width! */}
                <div className="w-full h-[500px] border border-gray-300 rounded-xl overflow-hidden z-0">
                    <InteractiveMap />
                </div>
            </section>
        </main>
    )
}

export default Home;