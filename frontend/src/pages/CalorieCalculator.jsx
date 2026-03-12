import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Save, AlertCircle, Activity, Target, Flame, ChevronDown, Check } from 'lucide-react';
import CardNav from '../components/CardNav';
import { getUserObject } from '../utils/auth';

export default function CalorieCalculator() {
    // Inputs
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('Moderately Active');
    const [goal, setGoal] = useState('Maintain');

    // Outputs
    const [tdee, setTdee] = useState(null);
    const [targetCalories, setTargetCalories] = useState(null);
    const [macros, setMacros] = useState(null);

    // Form states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const userObj = getUserObject();

            if (!token || !userObj?.sub) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/nest/users/${userObj.sub}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.profile) {
                        if (data.profile.age) setAge(data.profile.age);
                        if (data.profile.weight) setWeight(data.profile.weight);
                        if (data.profile.height) setHeight(data.profile.height);
                        if (data.profile.gender) setGender(data.profile.gender);
                        if (data.profile.tdee) setTdee(data.profile.tdee);
                        if (data.profile.targetCalories) setTargetCalories(data.profile.targetCalories);
                        if (data.profile.targetProtein && data.profile.targetCarbs && data.profile.targetFat) {
                            setMacros({
                                protein: data.profile.targetProtein,
                                carbs: data.profile.targetCarbs,
                                fat: data.profile.targetFat
                            });
                        }

                        // Try to infer goal from fitnessGoals text loosely
                        if (data.profile.fitnessGoals) {
                            const fg = data.profile.fitnessGoals.toLowerCase();
                            if (fg.includes('lose') || fg.includes('cut')) setGoal('Cut');
                            else if (fg.includes('build') || fg.includes('gain') || fg.includes('bulk')) setGoal('Bulk');
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load user profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleCalculate = () => {
        if (!weight || !height || !age || !gender || !activityLevel || !goal) return;

        const w = parseFloat(weight);
        const h = parseFloat(height);
        const a = parseInt(age);

        // Mifflin-St Jeor Equation
        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        bmr += gender === 'Male' ? 5 : -161;

        let multiplier = 1.2;
        switch (activityLevel) {
            case 'Sedentary': multiplier = 1.2; break;
            case 'Lightly Active': multiplier = 1.375; break;
            case 'Moderately Active': multiplier = 1.55; break;
            case 'Very Active': multiplier = 1.725; break;
            case 'Extra Active': multiplier = 1.9; break;
            default: multiplier = 1.2; break;
        }

        const calculatedTdee = Math.round(bmr * multiplier);

        let targetCals = calculatedTdee;
        if (goal === 'Cut') targetCals -= 500; // 500 deficit
        if (goal === 'Bulk') targetCals += 300; // 300 surplus for leaner bulk

        // Calculate Macros (Proteins, Fats, Carbs)
        // Protein: ~2.2g per kg of body weight
        const proteinGrams = Math.round(w * 2.2);
        // Fat: ~1g per kg of body weight
        const fatGrams = Math.round(w * 1);

        const proteinCals = proteinGrams * 4;
        const fatCals = fatGrams * 9;
        const carbCals = targetCals - proteinCals - fatCals;

        // Ensure carbs don't go negative on extreme cuts
        const finalCarbCals = Math.max(0, carbCals);
        const carbGrams = Math.round(finalCarbCals / 4);

        setTdee(calculatedTdee);
        setTargetCalories(targetCals);
        setMacros({ protein: proteinGrams, carbs: carbGrams, fat: fatGrams });
    };

    const handleSaveToProfile = async () => {
        if (!tdee || !targetCalories || !macros) return;
        setSaving(true);
        setSaveStatus(null);

        try {
            const token = localStorage.getItem('token');
            const userObj = getUserObject();
            if (!token || !userObj?.sub) return;

            // First, get the current user so we don't overwrite other profile fields completely
            const getRes = await fetch(`http://localhost:3000/api/nest/users/${userObj.sub}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await getRes.json();
            const existingProfile = userData.profile || {};

            const response = await fetch(`http://localhost:3000/api/nest/users/${userObj.sub}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    profile: {
                        ...existingProfile,
                        age: parseInt(age),
                        gender,
                        weight: parseFloat(weight),
                        height: parseFloat(height),
                        tdee,
                        targetCalories,
                        targetProtein: macros.protein,
                        targetCarbs: macros.carbs,
                        targetFat: macros.fat
                    }
                })
            });

            if (response.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20 md:pb-6 selection:bg-cyan-500/30">
            <CardNav />

            <main className="pt-28 md:pt-36 px-4 max-w-5xl mx-auto flex flex-col xl:flex-row gap-8">

                {/* LEFT: input Form */}
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Macro Calculator</h1>
                                <p className="text-zinc-400 text-sm">Based on the Mifflin-St Jeor equation</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Age (Years)</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                    placeholder="25"
                                />
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Gender</label>
                                <div className="relative">
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                    placeholder="80"
                                />
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                    placeholder="180"
                                />
                            </div>

                            {/* Activity Level */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Activity Level</label>
                                <div className="relative">
                                    <select
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                                    >
                                        <option value="Sedentary">Sedentary (Office job, no exercise)</option>
                                        <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                                        <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                                        <option value="Very Active">Very Active (6-7 days/week)</option>
                                        <option value="Extra Active">Extra Active (Manual labor or 2x training)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Goal */}
                            <div className="space-y-2 sm:col-span-2 border-t border-zinc-800 pt-6 mt-2">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Primary Goal</label>
                                <div className="flex gap-4">
                                    {['Cut', 'Maintain', 'Bulk'].map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => setGoal(g)}
                                            className={`flex-1 py-3 rounded-xl border font-medium transition-all ${goal === g
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={!weight || !height || !age || !gender}
                            className={`w-full mt-8 py-4 rounded-xl font-bold transition-all ${(!weight || !height || !age || !gender)
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]'
                                }`}
                        >
                            Calculate Macros
                        </button>
                    </motion.div>
                </div>

                {/* RIGHT: Results Display */}
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Target className="w-5 h-5 text-cyan-500" />
                                    Your Targets
                                </h2>
                                <p className="text-zinc-500 text-sm mt-1">Calculated specifically for your body</p>
                            </div>

                            {tdee ? (
                                <button
                                    onClick={handleSaveToProfile}
                                    disabled={saving}
                                    className="flex items-center gap-2 p-2 px-4 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
                                >
                                    {saving ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                                    {saveStatus === 'success' ? 'Saved!' : 'Save to Profile'}
                                </button>
                            ) : null}
                        </div>

                        {!tdee ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-300">Ready to calculate</h3>
                                <p className="text-zinc-500 text-sm max-w-[250px] mt-2">Enter your statistics on the left to reveal your daily targets.</p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col"
                            >
                                {/* Calories */}
                                <div className="mb-10 text-center">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-950 border-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-4">
                                        <Flame className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    <div className="text-5xl font-black tabular-nums tracking-tighter text-white">
                                        {targetCalories} <span className="text-lg text-zinc-500 font-semibold tracking-normal uppercase">kcal</span>
                                    </div>
                                    <p className="text-zinc-400 text-sm mt-2 font-medium">
                                        {goal === 'Cut' ? 'Deficit' : goal === 'Bulk' ? 'Surplus' : 'Maintenance'} Target
                                    </p>
                                    <div className="text-xs text-zinc-600 mt-1">Base TDEE: {tdee} kcal</div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-3 gap-4 mt-auto">
                                    {/* Protein Tracker */}
                                    <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">Protein</div>
                                        <div className="text-2xl font-bold tabular-nums text-white group-hover:text-indigo-100 transition-colors">
                                            {macros.protein}<span className="text-xs text-zinc-500 ml-1">g</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">4 cals / gram</p>
                                    </div>

                                    {/* Carbs Tracker */}
                                    <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">Carbs</div>
                                        <div className="text-2xl font-bold tabular-nums text-white group-hover:text-emerald-100 transition-colors">
                                            {macros.carbs}<span className="text-xs text-zinc-500 ml-1">g</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">4 cals / gram</p>
                                    </div>

                                    {/* Fat Tracker */}
                                    <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="text-amber-400 text-xs font-black uppercase tracking-wider mb-1">Fat</div>
                                        <div className="text-2xl font-bold tabular-nums text-white group-hover:text-amber-100 transition-colors">
                                            {macros.fat}<span className="text-xs text-zinc-500 ml-1">g</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-1">9 cals / gram</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {saveStatus === 'error' && (
                            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">Failed to save profile. Make sure you are logged in.</p>
                            </div>
                        )}
                        {saveStatus === 'success' && (
                            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-emerald-400">Successfully synced calorie targets to your profile.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
