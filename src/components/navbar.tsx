"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isScrolled, setIsScrolled] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    // detect event scroll
    useEffect(() => {
        const handleScroll = () => {
            // position scroll down up 50px, turn on state (true)
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                //  if want to back for top, turn off state (false)
                setIsScrolled(false);
            }
        };

        // add detection to window / browser
        window.addEventListener("scroll", handleScroll);

        // call 1x when first time load component
        handleScroll();

        // clear detection when component killed 
        return () => window.removeEventListener("scroll", handleScroll);
    }, [])

    const navLinks = [
        { name: "Beranda", href: "#beranda" },
        { name: "Maps", href: "#maps" }
    ];

    return (
        // Kalau isScrolled true, posisinya top-4. Kalau false agak turun dikit (top-6)
        <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ease-out px-4 md:px-8 lg:px-16 ${isScrolled ? "top-4" : "top-6"}`}>

            {/* 
              KOTAK ISI NAVBAR:
              - Pas Scroll Murni (Di Atas): Transparan, melebar (w-full max-w-7xl)
              - Saat Di-Scroll Turun: Background blur, menjadi kapsul (rounded-full max-w-[1200px]), ada bayangan (shadow)
             */}
            <div className={`relative mx-auto transition-all duration-800 ease-out py-3 border ${isScrolled
                ? "w-full max-w-full bg-background/90 backdrop-blur-md shadow-md drop-shadow-lg rounded-full px-8 border-white/20"
                : "w-full max-w-6xl bg-transparent border-transparent px-4"
                }`}>

                <div className="flex items-center justify-between w-full">

                    {/* BAGIAN KIRI: Logo & Menu */}
                    <div className="flex items-center gap-8 lg:gap-32">
                        {/* Logo Bintang/Teks */}
                        <Link
                            href="#beranda"
                            className="relative flex items-center h-full gap-2 text-2xl transition-all duration-300 font-serif md:text-3xl text-primary font-bold">
                            SkyCast
                        </Link>

                        {/* Menu Desktop (Sekarang pindah ke sebelah kiri Logo) */}
                        <div className="hidden lg:flex gap-8 items-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-foreground hover:text-primary transition-colors font-sans text-sm md:text-base">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {/* Search Bar Desktop */}
                    <div className="hidden lg:block relative w-full max-w-[280px]">
                        <input
                            type="text"
                            placeholder="Find location..."
                            className="w-full bg-white/40 border border-neutral-300/50 text-foreground text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all backdrop-blur-md placeholder:text-neutral-500"
                        />
                        {/* Ikon Pencarian */}
                        <svg
                            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Tombol Hamburger (Mobile) */}
                    <button
                        onClick={toggleMenu}
                        className="p-1.5 rounded-lg transition-colors relative flex aspect-square lg:hidden cursor-pointer text-foreground hover:bg-neutral-200/50"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                </div>
                {/* Dropdown Menu Mobile */}
                <div className={`lg:hidden absolute left-0 right-0 top-full mt-4 transition-all duration-500 ease-in-out overflow-hidden rounded-2xl shadow-xl drop-shadow-2xl bg-background/95 backdrop-blur-lg border border-white/20 ${isMobileMenuOpen ? "max-h-[400px] opacity-100 py-4 px-6" : "max-h-0 opacity-0"
                    }`}>
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary transition-colors font-sans font-medium text-lg block py-2 border-b border-foreground/10 last:border-0"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {/* Search Bar Mobile */}
                        <div className="relative w-full mt-2">
                            <input
                                type="text"
                                placeholder="Cari kota..."
                                className="w-full bg-white/40 border border-neutral-300/50 text-foreground text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all backdrop-blur-md placeholder:text-neutral-500"
                            />
                            <svg
                                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;