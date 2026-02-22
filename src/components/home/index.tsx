import GetStartedButton from "./getStartedButton";
import HeroParallax from "./heroParallax";
import WaveTransition from "./WaveTransition";

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
                <h2 className="text-4xl text-primary font-serif font-bold">Ini Section Ku ke-Dua!</h2>
                <p className="mt-5 text-gray-500">Coba kamu scroll ke atas pelan-pelan dan perhatiin gambar awannya :D</p>
            </section>
        </main>
    )
}

export default Home;