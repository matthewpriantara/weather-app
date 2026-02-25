"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// mengatasi bug icon dari leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface WeatherData {
    // Main Info
    cityName: string;
    temp: number;
    condition: string;
    iconUrl: string;

    // Group air & temp info (from data.main)
    feelsLike: number;
    tempMin: number;
    temptMax: number;
    humidity: number;
    pressure: number;

    // Wind & Condition Group (from data.wind, data.clouds, data.visibility)
    windSpeed: number;
    windDeg: number;
    cloudCover: number;
    visibility: number;

    // Sun & Time Group (from data.sys & data.timezone)
    sunrise: number; // value nya berupa angka UNIX Timestamp
    sunset: number;
    timezone: number;
}

interface locationMarkerProps {
    setWeatherData: (data: WeatherData | null) => void;

    // read weatherdata if want to display popup
    weatherData: WeatherData | null;
}

const getWeatherGradient = (condition: string): string => {
    const cond = condition.toLowerCase();

    if (cond.includes('clear')) return "bg-gradient-to-br from-yellow-100 to-orange-200";
    if (cond.includes('cloud')) return "bg-gradient-to-br from-gray-100 to-gray-300";
    if (cond.includes('rain') || cond.includes('drizzle')) return "bg-gradient-to-br from-blue-100 to-slate-300";
    if (cond.includes('snow')) return "bg-gradient-to-br from-blue-50 to-white";
    if (cond.includes('thunderstorm')) return "bg-gradient-to-br from-slate-400 to-gray-600 text-white";

    return "bg-gradient-to-br from-primary/5 to-primary/10"; // for default background
}

// component detection when user clik on the map
function LocationMarker({ setWeatherData, weatherData }: locationMarkerProps) {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // get API from .env
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    // 1. Pindahkan logika Fetch API ke fungsi terpisah agar bisa dipanggil berkali-kali
    const fetchWeatherData = async (lat: number, lng: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                // jika sukses, simpan data ke state map
                setWeatherData({
                    cityName: data.name || "Unknown Location",
                    temp: Math.round(data.main.temp),
                    condition: data.weather[0].description,
                    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,

                    feelsLike: Math.round(data.main.feels_like),
                    tempMin: Math.round(data.main.temp_min),
                    temptMax: Math.round(data.main.temp_max),
                    humidity: data.main.humidity,
                    pressure: data.main.pressure,
                    windSpeed: data.wind.speed,
                    windDeg: data.wind.deg,
                    cloudCover: data.clouds.all,
                    visibility: data.visibility,
                    sunrise: data.sys.sunrise,
                    sunset: data.sys.sunset,
                    timezone: data.timezone,
                });
            }
        } catch (error) {
            console.log("Ada error bos: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Map Event Listeners
    const map = useMapEvents({
        click: (e) => {
            // Jalankan saat pengguna klik titik lain di peta secara manual
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            fetchWeatherData(lat, lng);
        },
        locationfound: (e) => {
            // Jalankan SAAT LOKASI PENGGUNA BERHASIL DITEMUKAN dari browser
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            map.flyTo(e.latlng, map.getZoom()); // pindahkan kamera map ke arah lokasi user
            fetchWeatherData(lat, lng);
        },
        locationerror: (e) => {
            // Jalankan saat pengguna menolak akses atau terjadi error lokasi
            console.log("Gagal mengakses lokasi user: ", e.message);
        }
    });

    // 3. Effect saat dirender pertama kali
    useEffect(() => {
        // Meminta akses lokasi user seketika saat peta di-load
        map.locate();
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup className="custom-popup">
                <div className="flex flex-col items-center justify-center p-3 text-center min-w-[160px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-primary">Mencari Cuaca...</p>
                        </div>
                    ) : weatherData ? (
                        <>
                            <h3 className="font-serif font-bold text-xl text-primary mb-1">{weatherData.cityName}</h3>
                            <img
                                src={weatherData.iconUrl}
                                alt={weatherData.condition}
                                className="w-24 h-24 drop-shadow-md -my-3"
                            />
                            <p className="text-4xl font-bold text-accent tracking-tighter">{weatherData.temp}°</p>
                            <p className="capitalize font-medium text-sm text-foreground/80 mt-1">{weatherData.condition}</p>
                        </>
                    ) : (
                        <p className="text-red-500 text-sm">Gagal memuat cuaca</p>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}

const MapComponent = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isCelcius, setIsCelcius] = useState(true); // for temperature unit
    const [activeLayer, setActiveLayer] = useState<string>('none')

    // convertion celcius to fahrenheit dinamis
    const formatTemp = (celcius: number) => {
        if (isCelcius) return `${celcius}°C`;
        return `${Math.round(celcius * 9 / 5 + 32)}°F`;
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* maps section */}
            <div className="w-full h-[550px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative z-0 ring-1 ring-secondary/40">
                {/* Floating Map Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-white/70 backdrop-blur-md p-2 rounded-xl border border-white/60 shadow-lg">
                    <p className="text-xs font-bold text-slate-600 mb-1 px-2 text-center">Lapisan Peta</p>
                    <button
                        onClick={() => setActiveLayer('none')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeLayer === 'none' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/50 text-slate-600'}`}
                    >
                        🗺️ Standar
                    </button>
                    <button
                        onClick={() => setActiveLayer('precipitation_new')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeLayer === 'precipitation_new' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-white/50 text-slate-600'}`}
                    >
                        ☔ Curah Hujan
                    </button>
                    <button
                        onClick={() => setActiveLayer('temp_new')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeLayer === 'temp_new' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-white/50 text-slate-600'}`}
                    >
                        🌡️ Suhu
                    </button>
                </div>
                <MapContainer
                    center={[-7.801372, 110.364749]} // Tengahnya di-set di Yogyakarta
                    zoom={10}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <LocationMarker
                        setWeatherData={setWeatherData}
                        weatherData={weatherData}
                    />
                </MapContainer>
            </div>

            {/* dashboard statistic */}
            {weatherData && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-6 sm:p-8 mt-4"
                >
                    {/* banner alert if weather is extreme */}
                    {(weatherData.windSpeed > 10 || weatherData.temp > 35) && (
                        <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-center gap-3 animate-pulse">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-bold">Peringatan Cuaca Ekstrem</h3>
                                <p className="text-sm">Kondisi cuaca di lokasi ini sedang kurang bersahabat. Perhatikan keselamatan Anda.</p>
                            </div>
                        </div>
                    )}

                    {/* toggle celcius/fahrenheit */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsCelcius(!isCelcius)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-4 rounded-full transition-colors text-sm border border-primary/20 shadow-sm flex gap-2 items-center"
                        >
                            Ubah Satuan <span>{isCelcius ? "➡️ °F" : "➡️ °C"}</span>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
                        {/* summary card - dinamic background */}
                        <div className={`w-full lg:w-1/4 flex flex-col items-center justify-center rounded-2xl p-6 border border-white/40 shadow-inner text-center relative overflow-hidden group ${getWeatherGradient(weatherData.condition)}`}>
                            {/* Dekorasi blur gradient */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>

                            <h3 className="font-serif font-bold text-3xl text-primary z-10">{weatherData.cityName}</h3>
                            <p className="capitalize font-medium text-lg text-foreground/80 mt-1 z-10">{weatherData.condition}</p>
                            <img
                                src={weatherData.iconUrl}
                                alt={weatherData.condition}
                                className="w-32 h-32 drop-shadow-xl my-2 z-10 group-hover:scale-110 transition-transform duration-300"
                            />
                            <h1 className="text-6xl font-bold text-primary tracking-tighter z-10">{formatTemp(weatherData.temp)}</h1>
                        </div>

                        {/* detail grid */}
                        <div className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {/* Card 1: Suhu & Udara */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary/30 hover:shadow-md transition-all hover:-translate-y-1 duration-300 group">
                                <h4 className="font-serif font-semibold text-accent text-xl mb-4 border-b border-secondary/20 pb-3 flex items-center gap-2">
                                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">🌡️</span> Suhu & Udara
                                </h4>
                                <div className="space-y-4 text-foreground/80 text-sm">
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Terasa Seperti</span>
                                        <span className="font-semibold text-primary text-base">{formatTemp(weatherData.feelsLike)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Suhu Min/Max</span>
                                        <span className="font-bold text-primary text-base">{formatTemp(weatherData.tempMin)} / {formatTemp(weatherData.temptMax)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Kelembapan</span>
                                        <span className="font-semibold text-primary text-base">{weatherData.humidity}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Tekanan</span>
                                        <span className="font-semibold text-primary text-base">{weatherData.pressure} hPa</span>
                                    </div>
                                </div>
                            </div>

                            {/* card 2: wind & cloud (not change) */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary/30 hover:shadow-md transition-all hover:-translate-y-1 duration-300 group">
                                <h4 className="font-serif font-semibold text-accent text-xl mb-4 border-b border-secondary/20 pb-3 flex items-center gap-2">
                                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">💨</span> Angin & Awan
                                </h4>
                                <div className="space-y-4 text-foreground/80 text-sm">
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Kecepatan</span>
                                        <span className="font-semibold text-primary text-base">{weatherData.windSpeed} m/s</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Arah</span>
                                        <span className="font-semibold text-primary text-base">{weatherData.windDeg}°</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Tutupan Awan</span>
                                        <span className="font-semibold text-primary text-base">{weatherData.cloudCover}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Jarak Pandang</span>
                                        <span className="font-semibold text-primary text-base">{(weatherData.visibility / 1000).toFixed(1)} km</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Sun $ Time */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-secondary/30 hover:shadow-md transition-all hover:-translate-y-1 duration-300 group ">
                                <h4 className="font-serif font-semibold text-accent text-xl mb-4 border-b border-secondary/20 pb-3 flex items-center gap-2">
                                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">☀️</span> Matahari & Waktu
                                </h4>
                                <div className="space-y-4 text-foreground/80 text-sm">
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Matahari Terbit</span>
                                        <span className="font-semibold text-primary text-base">{new Date(weatherData.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Matahari Terbenam</span>
                                        <span className="font-semibold text-primary text-base">{new Date(weatherData.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/60 p-2.5 rounded-lg border border-secondary/10">
                                        <span>Zona Waktu</span>
                                        <span className="font-semibold text-primary text-base">UTC {weatherData.timezone / 3600 > 0 ? '+' : ''}{weatherData.timezone / 3600}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default MapComponent