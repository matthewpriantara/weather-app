"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { use, useState } from "react";
import { number } from "framer-motion";
import { p } from "framer-motion/client";

// mengatasi bug icon dari leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface WeatherData {
    cityName: string;
    temp: number;
    condition: string;
    iconUrl: string;
}

// component detection when user clik on the map
function LocationMarker() {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // get API from .env
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    useMapEvents({
        click: async (e) => {
            // get position lat and lng from click event
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            setIsLoading(true);

            // fetch to openweather api use lat & lng value
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
                const data = await response.json();
                console.log(data);

                if (response.ok) {
                    // if success, save data to state map
                    setWeatherData({
                        cityName: data.name || "Unknown Location",
                        temp: Math.round(data.main.temp),
                        condition: data.weather[0].description,
                        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    });
                }
            } catch (error) {
                console.log("Ada error bos: ", error);
            } finally {
                setIsLoading(false);
            }
        }
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>
                <div className="flex flex-col items-center justify-center p-2 text-center w-[150px]">
                    {isLoading ? (
                        <p>Find Weather...</p>
                    ) : weatherData ? (
                        <>
                            <h3 className="font-bold text-lg">{weatherData.cityName}</h3>
                            <img
                                src={weatherData.iconUrl}
                                alt={weatherData.condition}
                                className="w-16 h-16 drop-shadow-sm"
                            />
                            <p className="text-2xl font-bold text-sky-600">{weatherData.temp} °C</p>
                            <p className="capitalize text-sm text-gray-500">{weatherData.condition} </p>
                        </>
                    ) : (
                        <p>Failed to load weather data</p>
                    )}
                </div>
            </Popup>
        </Marker>
    )
}

const MapComponent = () => {
    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={[-6.200000, 106.816666]} // Tengahnya di-set di Jakarta
                zoom={5}
                scrollWheelZoom={true}
                className="w-full h-full rounded-2xl shadow-lg border border-gray-200"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
            </MapContainer>
        </div>
    );
}

export default MapComponent