'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Lock, Zap } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="px-6 lg:px-10 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/80 fixed w-full z-50">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                        <Zap className="h-5 w-5" />
                    </div>
                    <span>TrackWise</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/signup">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 pt-16">
                <section className="w-full py-24 md:py-32 lg:py-40 flex flex-col items-center text-center px-4 md:px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter max-w-3xl mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Smart Expense Tracking for Modern Teams
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-[700px] mb-10 leading-relaxed">
                        Take control of your finances with powerful analytics, seamless group splitting, and intuitive budget management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center">
                        <Link href="/signup">
                            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                                Start for Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-20 bg-muted/50">
                    <div className="px-4 md:px-6 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border transition-shadow hover:shadow-md">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                                    <BarChart3 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">Deep Analytics</h3>
                                <p className="text-muted-foreground">
                                    Visualize your spending habits with detailed charts and actionable insights.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border transition-shadow hover:shadow-md">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                                    <Zap className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">Fast & Intuitive</h3>
                                <p className="text-muted-foreground">
                                    Add expenses in seconds. Designed for speed and ease of use on any device.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border transition-shadow hover:shadow-md">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600">
                                    <Lock className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold">Secure & Private</h3>
                                <p className="text-muted-foreground">
                                    Your financial data is encrypted and secure. We prioritize your privacy.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full py-6 px-6 border-t flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
                <p>© 2026 TrackWise Inc. All rights reserved.</p>
                <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
                    <Link href="#" className="hover:underline underline-offset-4">Terms</Link>
                    <Link href="#" className="hover:underline underline-offset-4">Privacy</Link>
                </nav>
            </footer>
        </div>
    );
}
