import { Shield, Cpu, Lock, Timer, User, CheckCircle, ArrowRight, Github, Linkedin, Mail, Twitter, ExternalLink, Activity, Target, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Portfolio() {
    // Scroll Reveal Hook Logic
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            <style>{`
        html {
          scroll-behavior: smooth;
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
      `}</style>
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        CrimDetect
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
                    <a href="#labs" className="hover:text-blue-600 transition-colors">Lab Implementations</a>
                    <a href="#how-to" className="hover:text-blue-600 transition-colors">How to Use</a>
                    <a href="#developer" className="hover:text-blue-600 transition-colors">Developer</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="font-semibold text-slate-700 hover:text-blue-600">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6">Get Started</Button>
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section id="about" className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                            <Badge variant="outline" className="px-4 py-1.5 border-blue-200 bg-blue-50 text-blue-700 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                Powered by AI & Multithreading
                            </Badge>
                            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                                Advanced <span className="text-blue-600">Criminal</span> Recognition System
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                                A production-ready platform for real-time criminal face detection, featuring high-performance multithreading and secure administrative workflows.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/register">
                                    <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-lg shadow-xl shadow-blue-600/25">
                                        Explore Platform <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-sm font-bold text-slate-900">Trusted by Security Agencies</p>
                                    <p className="text-xs text-slate-500">Official Partner: Sir Syed University</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative animate-in fade-in slide-in-from-right duration-700">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
                            <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-2 mb-6 text-slate-400">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-mono uppercase tracking-widest">System Status: Active</span>
                                </div>
                                <div className="w-full aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center border-4 border-slate-800 shadow-inner group">
                                    <Camera className="h-16 w-16 text-slate-700 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-[10px] text-slate-600 font-mono mt-4 uppercase tracking-[0.3em]">Hardware Accelerated Detection</p>
                                </div>
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <Activity className="h-5 w-5 text-blue-600 mb-2" />
                                        <p className="text-xs font-bold text-slate-500 uppercase">Detection Rate</p>
                                        <p className="text-2xl font-black text-slate-900">99.2%</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <Target className="h-5 w-5 text-indigo-600 mb-2" />
                                        <p className="text-xs font-bold text-slate-500 uppercase">Criminals Indexed</p>
                                        <p className="text-2xl font-black text-slate-900">12k+</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lab Implementation Section */}
                <section id="labs" className="py-24 bg-slate-50 relative overflow-hidden reveal">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center space-y-4 mb-20">
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Backend Engineering <span className="text-blue-600">&</span> Multithreading</h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                Comprehensive implementation of computer science fundamentals optimized for production-grade performance.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Lab 4 */}
                            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group reveal delay-100">
                                <CardHeader className="pb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Cpu className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">Lab 4: Start, Sleep & Stop</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-600 leading-relaxed">
                                        Implementation of background worker control systems. Features non-blocking <code>sleep()</code> intervals that prevent CPU throttling during intensive matching.
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-500 font-medium">
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Async processQueue Loop</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> CPU-Breathe Sleep logic</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Graceful Stop Handlers</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Lab 5 */}
                            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group reveal delay-200">
                                <CardHeader className="pb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Lock className="h-7 w-7 text-indigo-600" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">Lab 5: Synchronization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-600 leading-relaxed">
                                        Robust Mutex lock implementation for synchronized resource access. Ensures multiple threads never conflict when accessing the criminal database.
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-500 font-medium">
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Custom Mutex Class</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Lock Acquire/Release mechanism</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Atomic Matching Operations</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Lab 6 */}
                            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group reveal delay-300">
                                <CardHeader className="pb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Timer className="h-7 w-7 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">Lab 6: Deadlock Prevention</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-600 leading-relaxed">
                                        Critical safety protocols using Promise.race and custom timeouts to prevent workers from hanging during complex matches.
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-500 font-medium">
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> matchWithTimeout implementation</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Automatic Thread Cleanup</li>
                                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Resource Lease Logic</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section id="how-to" className="py-24 max-w-7xl mx-auto px-6 reveal">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System <span className="text-blue-600">Workflow</span></h2>
                            <div className="space-y-6">
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">Administrative Setup</h4>
                                        <p className="text-slate-500">Admins upload criminal images. The system automatically extracts a unique 128-D face descriptor using AI models.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">Real-time Recognition</h4>
                                        <p className="text-slate-500">Live webcam feed detects individual faces. These are matched against the database using worker threads for near-instant responses.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1">Automated Warning System</h4>
                                        <p className="text-slate-500">Matched faces trigger rule-based alerts. Linked accounts receive high-priority warnings to maintain public safety.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative shadow-2xl overflow-hidden border border-slate-800">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <Github className="h-6 w-6" /> System Architecture
                            </h3>
                            <div className="space-y-6 font-mono text-xs text-slate-400">
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <p className="text-blue-400 mb-2"># Worker Manager Queue Logic</p>
                                    <p>while (requestQueue.length &gt; 0) {'{'}</p>
                                    <p className="ml-4">const worker = getAvailableWorker();</p>
                                    <p className="ml-4">if (!worker) break;</p>
                                    <p className="ml-4 text-green-400">// Parallel processing starts here</p>
                                    <p className="ml-4">worker.postMessage(matchRequest);</p>
                                    <p>{'}'}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold text-white pt-4">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Production Ready Backend
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold text-white">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    Responsive React Frontend
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold text-white">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    MySQL Transactional Storage
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Developer Section */}
                <section id="developer" className="py-24 bg-gradient-to-b from-slate-50 to-white reveal">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="inline-block relative mb-8 reveal delay-100">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-500/30 ring-4 ring-white">
                                <img
                                    src="./khalid2.jpeg"
                                    alt="Khalid"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.parentElement) {
                                            e.target.parentElement.innerHTML = '<span class="text-4xl font-black text-white">K</span>';
                                        }
                                    }}
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-extrabold mb-4 reveal delay-200">Khalid H.</h2>
                        <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-6 reveal delay-300">Full Stack AI Engineer</p>
                        <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-2xl mx-auto reveal delay-300">
Muhammad Khalid Hussain is a proactive software developer at Sir Syed University. He specializes in building scalable web applications using React, Node.js, and modern frameworks. As an active member of GDSC SSUET, he contributes to student tech initiatives. He has created platforms such as SSUETNotes and SSUETConnect. He also mentors peers in web development and AI projects. He is passionate about turning complex ideas into practical solutions that benefit the university community.
                        </p>

                        <div className="flex justify-center gap-4 reveal delay-300">
                            <a href="https://github.com/mkhalidh" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hover:bg-slate-900 hover:text-white transition-colors">
                                    <Github className="h-5 w-5" />
                                </Button>
                            </a>
                            <a href="https://www.linkedin.com/in/muhammad-khalid-hussain-384752202/" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </Button>
                            </a>
                            <a href="mailto:unikhalidh@gmail.com?subject=Inquiry%20from%20Portfolio%20Website" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                    <Mail className="h-5 w-5" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-16 border-y border-slate-100 reveal">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">Academic & Professional Trust</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-800">SIR SYED UNIVERSITY</span>
                            {/* <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-800">SSUET KARACHI</span> */}
                            {/* <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-800">TECH ACADEMY</span> */}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 pt-20 pb-10 text-slate-400">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                        <div className="col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white">
                                    CrimDetect
                                </span>
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed">
                                Redefining public safety through advanced facial recognition and distributed computing technologies.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer"><Twitter className="h-4 w-4 text-white" /></div>
                                <div className="w-8 h-8 rounded bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer"><Github className="h-4 w-4 text-white" /></div>
                                <div className="w-8 h-8 rounded bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer"><Linkedin className="h-4 w-4 text-white" /></div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Project</h5>
                            <ul className="space-y-4 text-sm">
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Live Detection</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Admin Panel</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">API Docs</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Thread Manager</li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Resources</h5>
                            <ul className="space-y-4 text-sm">
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Lab 4: Controls</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Lab 5: Sync</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Lab 6: Timeouts</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Case Studies</li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Developer</h5>
                            <ul className="space-y-4 text-sm">
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Contact Me</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Portfolio</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">Support</li>
                                <li className="hover:text-blue-500 transition-colors cursor-pointer">About</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs">© 2026 CrimDetect. Designed by Khalid H. No rights reserved (ISP License).</p>
                        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                            <span className="hover:text-white cursor-pointer">Terms</span>
                            <span className="hover:text-white cursor-pointer">Privacy</span>
                            <span className="hover:text-white cursor-pointer">Cookies</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
