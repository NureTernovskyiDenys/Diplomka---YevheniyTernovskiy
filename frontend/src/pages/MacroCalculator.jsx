import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Save, AlertCircle, Target, Check, Pickaxe } from 'lucide-react';
import CardNav from '../components/CardNav';
import { getUserObject } from '../utils/auth';

const PRESETS = [
    { name: 'Balanced', carbs: 50, protein: 20, fat: 30, desc: 'Standard healthy split' },
    { name: 'Bodybuilder', carbs: 40, protein: 40, fat: 20, desc: 'High protein for growth' },
    { name: 'Keto', carbs: 5, protein: 25, fat: 70, desc: 'Fat adapted state' },
    { name: 'Zone Diet', carbs: 40, protein: 30, fat: 30, desc: 'Steady hormone levels' },
    { name: 'Low Fat', carbs: 55, protein: 25, fat: 20, desc: 'Volume eating friendly' },
];

export default function MacroCalculator() {
    // Inputs
    const [targetCalories, setTargetCalories] = useState('');
    const [activePreset, setActivePreset] = useState('Balanced');

    // Percentage Sliders
    const [carbsPct, setCarbsPct] = useState(50);
    const [proteinPct, setProteinPct] = useState(20);
    const [fatPct, setFatPct] = useState(30);

    // Calculated Outputs (Grams)
    const [macros, setMacros] = useState({ protein: 0, carbs: 0, fat: 0 });

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Initial Fetch
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
                    if (data.profile?.targetCalories) {
                        setTargetCalories(data.profile.targetCalories.toString());
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

    // Re-calculate grams whenever sliders or calories change
    useEffect(() => {
        const cals = parseInt(targetCalories) || 0;
        if (cals > 0) {
            setMacros({
                carbs: Math.round((cals * (carbsPct / 100)) / 4),
                protein: Math.round((cals * (proteinPct / 100)) / 4),
                fat: Math.round((cals * (fatPct / 100)) / 9),
            });
        } else {
            setMacros({ protein: 0, carbs: 0, fat: 0 });
        }
    }, [targetCalories, carbsPct, proteinPct, fatPct]);

    // Slider Logic: Keep Total at 100%
    // If user slides Carbs, we adjust Fat/Protein proportionally to fill the remaining gap.
    const handleSliderChange = (type, newValue) => {
        newValue = Math.max(0, Math.min(100, newValue));
        setActivePreset('Custom'); // Break preset linkage

        if (type === 'carbs') {
            const diff = newValue - carbsPct;
            setCarbsPct(newValue);
            adjustOthers('protein', 'fat', proteinPct, fatPct, diff);
        } else if (type === 'protein') {
            const diff = newValue - proteinPct;
            setProteinPct(newValue);
            adjustOthers('carbs', 'fat', carbsPct, fatPct, diff);
        } else if (type === 'fat') {
            const diff = newValue - fatPct;
            setFatPct(newValue);
            adjustOthers('carbs', 'protein', carbsPct, proteinPct, diff);
        }
    };

    const adjustOthers = (key1, key2, val1, val2, diff) => {
        // If diff > 0, we need to subtract from the others
        // If diff < 0, we need to add to the others
        const totalOther = val1 + val2;

        // If the other two are empty but we need to subtract, it means the user dragged one slider to > 100 somehow (clamped earlier)
        if (totalOther === 0 && diff > 0) return;

        let adj1, adj2;
        if (totalOther === 0) {
            // Give equally if both are 0
            adj1 = -diff / 2;
            adj2 = -diff / 2;
        } else {
            // Distribute proportionally
            adj1 = -diff * (val1 / totalOther);
            adj2 = -diff * (val2 / totalOther);
        }

        let newVal1 = Math.max(0, val1 + adj1);
        let newVal2 = Math.max(0, val2 + adj2);

        // Fix rounding drift so they equal exactly 100 - newValue
        const remainder = 100 - (carbsPct + proteinPct + fatPct + diff) + (val1 + val2);
        // This is tricky state sync in React. Doing a hard correct:
        if (key1 === 'carbs') setCarbsPct(Math.round(val1 - (diff / 2)));
        if (key1 === 'protein') setProteinPct(Math.round(val1 - (diff / 2)));
        if (key1 === 'fat') setFatPct(Math.round(val1 - (diff / 2)));

        if (key2 === 'carbs') setCarbsPct(Math.round(val2 - (diff / 2)));
        if (key2 === 'protein') setProteinPct(Math.round(val2 - (diff / 2)));
        if (key2 === 'fat') setFatPct(Math.round(val2 - (diff / 2)));

        // Simpler hard-set logic to avoid infinite loops in vanilla JS sliders:
        // We just assign the values directly based on remaining %
        const targetValue = key1 === 'carbs'
            ? (carbsPct + diff)
            : key1 === 'protein' ? (proteinPct + diff) : (fatPct + diff);

        // For absolute robustness, just reset cleanly if it breaks 100:
    };

    // Robust 3-way slider constraint solver
    const handleRobustSlider = (changed, newValue) => {
        setActivePreset('Custom');
        newValue = parseInt(newValue) || 0;

        let remaining = 100 - newValue;

        let target1, target2, val1, val2;
        if (changed === 'carbs') { target1 = 'protein'; target2 = 'fat'; val1 = proteinPct; val2 = fatPct; setCarbsPct(newValue); }
        if (changed === 'protein') { target1 = 'carbs'; target2 = 'fat'; val1 = carbsPct; val2 = fatPct; setProteinPct(newValue); }
        if (changed === 'fat') { target1 = 'carbs'; target2 = 'protein'; val1 = carbsPct; val2 = proteinPct; setFatPct(newValue); }

        let totalOther = val1 + val2;
        let set1, set2;

        if (totalOther === 0) {
            set1 = Math.round(remaining / 2);
            set2 = remaining - set1;
        } else {
            set1 = Math.round(remaining * (val1 / totalOther));
            set2 = remaining - set1;
        }

        if (target1 === 'carbs') setCarbsPct(set1);
        if (target1 === 'protein') setProteinPct(set1);
        if (target1 === 'fat') setFatPct(set1);

        if (target2 === 'carbs') setCarbsPct(set2);
        if (target2 === 'protein') setProteinPct(set2);
        if (target2 === 'fat') setFatPct(set2);
    };


    const applyPreset = (preset) => {
        setActivePreset(preset.name);
        setCarbsPct(preset.carbs);
        setProteinPct(preset.protein);
        setFatPct(preset.fat);
    };

    const handleSaveToProfile = async () => {
        if (!targetCalories || macros.protein === 0) return;
        setSaving(true);
        setSaveStatus(null);

        try {
            const token = localStorage.getItem('token');
            const userObj = getUserObject();
            if (!token || !userObj?.sub) return;

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
                        targetCalories: parseInt(targetCalories),
                        targetProtein: macros.protein,
                        targetCarbs: macros.carbs,
                        targetFat: macros.fat,
                        macroDietName: activePreset !== 'Custom' ? activePreset : `${carbsPct}/${proteinPct}/${fatPct} Custom Split`
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
        <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20 md:pb-6 selection:bg-cyan-500/30 overflow-x-hidden">
            <CardNav />

            <main className="pt-28 md:pt-36 px-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Pickaxe className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Macro Splitter</h1>
                        <p className="text-zinc-400 text-sm mt-1">Design your perfect diet. Balance your percentages to hit your calorie goal.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT CONTROLS: 8 Columns */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Upper Input: Calories */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold">Target Calories</h2>
                                <p className="text-sm text-zinc-500 mt-1">Found in your Calorie Calculator</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <input
                                    type="number"
                                    value={targetCalories}
                                    onChange={(e) => setTargetCalories(e.target.value)}
                                    placeholder="2500"
                                    className="bg-zinc-950 border border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-2xl font-black tabular-nums w-full sm:w-40 text-center text-white outline-none transition-colors"
                                />
                                <span className="font-bold text-zinc-500">kcal</span>
                            </div>
                        </div>

                        {/* Middle: Presets Grid */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold mb-4">Diet Architectures</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {PRESETS.map((p) => {
                                    const isActive = activePreset === p.name;
                                    return (
                                        <button
                                            key={p.name}
                                            onClick={() => applyPreset(p)}
                                            className={`text-left p-4 rounded-2xl border transition-all ${isActive
                                                    ? 'bg-indigo-500/10 border-indigo-500 cursor-default'
                                                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-bold ${isActive ? 'text-indigo-400' : 'text-zinc-300'}`}>{p.name}</span>
                                                {isActive && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-wider">
                                                <span className="text-emerald-500">{p.carbs}% C</span> •
                                                <span className="text-indigo-500">{p.protein}% P</span> •
                                                <span className="text-amber-500">{p.fat}% F</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Lower: Percentage Sliders */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col gap-8">
                            <h2 className="text-lg font-bold flex items-center justify-between">
                                Custom Split Tuning
                                {activePreset === 'Custom' && (
                                    <span className="text-xs font-semibold bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full">Custom Mode</span>
                                )}
                            </h2>

                            {/* Carbs */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-emerald-400">Carbohydrates</span>
                                    <span className="tabular-nums text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">{carbsPct}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={carbsPct}
                                    onChange={(e) => handleRobustSlider('carbs', e.target.value)}
                                    className="w-full appearance-none bg-zinc-800 h-2 rounded-full outline-none accent-emerald-500"
                                />
                            </div>

                            {/* Protein */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-indigo-400">Protein</span>
                                    <span className="tabular-nums text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">{proteinPct}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={proteinPct}
                                    onChange={(e) => handleRobustSlider('protein', e.target.value)}
                                    className="w-full appearance-none bg-zinc-800 h-2 rounded-full outline-none accent-indigo-500"
                                />
                            </div>

                            {/* Fat */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-amber-400">Fats</span>
                                    <span className="tabular-nums text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">{fatPct}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={fatPct}
                                    onChange={(e) => handleRobustSlider('fat', e.target.value)}
                                    className="w-full appearance-none bg-zinc-800 h-2 rounded-full outline-none accent-amber-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT RESULTS: 4 Columns */}
                    <div className="lg:col-span-4 max-h-[600px] lg:sticky lg:top-32">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl h-full flex flex-col">

                            <div className="text-center pb-6 border-b border-zinc-800">
                                <h2 className="text-xl font-bold flex justify-center items-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-indigo-500" />
                                    Daily Targets
                                </h2>
                                <p className="text-zinc-500 text-sm">{activePreset === 'Custom' ? 'Custom Tuning' : activePreset}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 py-6">
                                {/* Protein Large */}
                                <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">Protein</div>
                                    <div className="text-4xl pr-8 font-bold tabular-nums text-white">
                                        {macros.protein}<span className="text-sm font-semibold text-zinc-500 ml-1 uppercase">g</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-2">{proteinPct}% of total</p>
                                </div>

                                {/* Carbs Large */}
                                <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">Carbohydrates</div>
                                    <div className="text-4xl pr-8 font-bold tabular-nums text-white">
                                        {macros.carbs}<span className="text-sm font-semibold text-zinc-500 ml-1 uppercase">g</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-2">{carbsPct}% of total</p>
                                </div>

                                {/* Fat Large */}
                                <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="text-amber-400 text-xs font-black uppercase tracking-wider mb-2">Fats</div>
                                    <div className="text-4xl pr-8 font-bold tabular-nums text-white">
                                        {macros.fat}<span className="text-sm font-semibold text-zinc-500 ml-1 uppercase">g</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-2">{fatPct}% of total</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <button
                                    onClick={handleSaveToProfile}
                                    disabled={saving || !targetCalories}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!targetCalories
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : saveStatus === 'success'
                                                ? 'bg-emerald-500 text-white'
                                                : saveStatus === 'error'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]'
                                        }`}
                                >
                                    {saving && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    {!saving && saveStatus === 'success' && <><Check className="w-5 h-5" /> Saved to Profile</>}
                                    {!saving && saveStatus === 'error' && <><AlertCircle className="w-5 h-5" /> Save Failed</>}
                                    {!saving && !saveStatus && <><Save className="w-5 h-5" /> Set as Primary Diet</>}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
