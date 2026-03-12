import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Crown, Loader2 } from 'lucide-react';
import CardNav from '../components/CardNav';
import { getUserObject } from '../utils/auth';

export default function Subscriptions() {
    const [plans, setPlans] = useState([]);
    const [userPlanId, setUserPlanId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token');
            const userObj = getUserObject();

            if (!token || !userObj?.sub) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch available plans
                const plansRes = await fetch('http://localhost:3000/api/nest/subscriptions', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (plansRes.ok) {
                    const data = await plansRes.json();
                    setPlans(data);
                }

                // 2. Fetch User's current plan
                const userRes = await fetch(`http://localhost:3000/api/nest/users/${userObj.sub}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserPlanId(userData.subscription?.planId || null);
                }

            } catch (err) {
                console.error('Error fetching subscription data:', err);
                setError('Failed to load subscription data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleSubscribe = async (planId) => {
        if (planId === userPlanId) return; // Already subscribed

        setProcessingId(planId);
        setError(null);
        const token = localStorage.getItem('token');

        try {
            // "Instant grant" checkout bypass per user request
            const res = await fetch(`http://localhost:3000/api/nest/subscriptions/${planId}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Success! The backend updated their `user.subscription` field.
                setUserPlanId(planId);
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to update subscription.');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            setError('An error occurred while processing your request.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20 md:pb-6 selection:bg-blue-500/30">
            <CardNav />

            <main className="pt-28 md:pt-36 px-4 max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            Level Up Your Training
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Get access to AI-powered motion analysis, unlimited workouts, and advanced insights. Choose the plan that fits your goals.
                        </p>
                    </motion.div>
                </div>

                {error && (
                    <div className="max-w-xl mx-auto mb-8 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center font-medium shadow-lg shadow-red-500/5">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, idx) => {
                        const isPremium = plan.price > 0 || plan.name.toLowerCase().includes('premium');
                        const isCurrentPlan = userPlanId === plan._id;
                        const isProcessing = processingId === plan._id;

                        // Give premium a delayed animation
                        return (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.5 }}
                                className={`relative rounded-3xl p-1 sm:p-px transition-transform duration-300 hover:-translate-y-2 ${isPremium
                                    ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.2)]'
                                    : 'bg-zinc-800'
                                    }`}
                            >
                                {/* Glow Effect for Premium */}
                                {isPremium && (
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                )}

                                <div className="bg-zinc-900 rounded-[23px] h-full flex flex-col p-8 sm:p-10 relative overflow-hidden">
                                    {isPremium && (
                                        <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Most Popular
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                            {isPremium ? <Sparkles className="w-6 h-6 text-blue-400" /> : <Shield className="w-6 h-6 text-zinc-400" />}
                                            {plan.name}
                                        </h2>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black tabular-nums tracking-tighter shadow-sm">
                                                ${plan.price}
                                            </span>
                                            <span className="text-zinc-500 font-medium">/ month</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-8">
                                        {plan.features?.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 text-zinc-300">
                                                <div className={`mt-1 rounded-full p-1 ${isPremium ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                    {isPremium ? <Zap className="w-3 h-3" /> : <Check className="w-3 h-3 text-emerald-500" />}
                                                </div>
                                                <span className="text-sm font-medium leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(plan._id)}
                                        disabled={isCurrentPlan || isProcessing}
                                        className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isCurrentPlan
                                            ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                                            : isPremium
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
                                                : 'bg-zinc-100 hover:bg-white text-zinc-900 active:scale-[0.98]'
                                            }`}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isCurrentPlan ? (
                                            <>Current Plan</>
                                        ) : (
                                            <>Select {plan.name}</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
