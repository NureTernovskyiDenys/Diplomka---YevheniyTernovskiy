import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CardNav from '../components/CardNav';
import Footer from '../components/Footer';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Note: In Vercel, /api/nest/ routes to the NestJS backend
            const response = await axios.post('/api/nest/auth/login', {
                email,
                password
            });

            // Save JWT token
            localStorage.setItem('token', response.data.access_token);

            // Redirect to a secure area (we can build this next)
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen font-sans selection:bg-cyan-500/30 flex flex-col">
            <CardNav />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-cyan-500/20 blur-[60px] pointer-events-none rounded-full" />

                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-zinc-400 mb-8 font-light">Access your premium analysis dashboard.</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 hover:border-zinc-700 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-300">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 hover:border-zinc-700 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-zinc-950 font-bold px-4 py-3 rounded-xl mt-4 hover:bg-zinc-200 transition-colors relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 group-hover:text-zinc-900 transition-colors">
                                    {loading ? 'Authenticating...' : 'Sign In'}
                                </span>
                            </button>
                        </form>

                        <p className="text-zinc-500 text-sm text-center mt-6">
                            Don't have an account? <a href="#" className="text-white font-semibold hover:text-cyan-400 transition-colors">Sign up</a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
