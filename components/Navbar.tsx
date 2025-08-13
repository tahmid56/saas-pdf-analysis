"use client";

import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }
    const closeMenu =() =>{
        setIsOpen(false);
    }
    return (
        <nav className="border-b border-purple-300/5 shadow-[0_4px_20px_-10px] shadow-purple-200/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="text-2xl font-bold text-white">
                        SaaS PDF Analysis
                    </Link>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/dashboard" className="text-white/70 hover:text-white px-4 py-2 transition-all duration-300 hover:shadow-[0_2px_8px_0] hover:shadow-purple-400/40 hover:rounded-md">
                            Dashboard
                        </Link>
                        <Link href="/pricing" className="text-white/70 hover:text-white px-4 py-2 transition-all duration-300 hover:shadow-[0_2px_8px_0] hover:shadow-purple-400/40 hover:rounded-md">
                            Pricing
                        </Link>
                    </div>
                    <SignedIn>
                        <SignOutButton>
                            <button className="text-white/70 hover:text-white px-4 py-2 transition-all duration-300 hover:shadow-[0_2px_8px_0] hover:shadow-purple-400/40 hover:rounded-md">
                                Signout
                            </button>
                        </SignOutButton>
                    </SignedIn>

                    <SignedOut>
                        <div className="flex items-center">
                            <Link href="/sign-in" className="group relative inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white transition-all hover:bg-white/5">
                                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF1E56] via-[#FF00FF] to-[#00FFFF] opacity-70 blur-sm transition-all group-hover:opacity-100"></span>
                                <span className="absolute inset-0.5"></span>
                                <span className="relative font-medium">Sign In</span>
                            </Link>
                        </div>
                    </SignedOut>
                    {/* Toggle Mobile menu */}
                    <div className="md:hidden z-50">
                        <button  onClick={toggleMenu} className="p-2">
                            {isOpen ? (<X className="h-6 w-6 text-white"/>): (<Menu className="h-6 w-6 text-white"/>)}
                        </button>
                    </div>
                    {/* Mobile menu */}
                    <div className={`md:hidden absolute top-20 right-0 bg-white shadow-lg rounded-md overflow-hidden ${isOpen ? 'block' : 'hidden'}`}>
                        <Link href="/dashboard" className="block px-4 py-2 text-black">
                            Dashboard
                        </Link>
                        <Link href="/pricing" className="block px-4 py-2 text-black">
                            Pricing
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;