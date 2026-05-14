import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Loader2, User, Save, CheckCircle2, AlertCircle, Activity, Scale, Ruler, Target, Flame } from 'lucide-react';
import CardNav from '../components/CardNav';
import { getUserObject } from '../utils/auth';
import Model from 'react-body-highlighter';

// Reverse mapping to map ExerciseDB targets to BodyMap slugs
const DB_TO_BODYMAP = {
    'pectorals': ['chest'],
    'abs': ['abs'],
    'delts': ['front-deltoids', 'back-deltoids'],
    'biceps': ['biceps'],
    'triceps': ['triceps'],
    'forearms': ['forearm'],
    'upper back': ['upper-back'],
    'spine': ['lower-back'],
    'traps': ['trapezius'],
    'glutes': ['gluteal'],
    'quads': ['quadriceps'],
    'hamstrings': ['hamstring'],
    'adductors': ['adductor'],
    'abductors': ['abductors'],
    'calves': ['calves'],
    'neck': ['neck'],
    'levator scapulae': ['neck'],
    'lats': ['upper-back'],
    'serratus anterior': ['chest'],
    'chest': ['chest'],
    'waist': ['abs', 'obliques'],
    'shoulders': ['front-deltoids', 'back-deltoids'],
    'upper arms': ['biceps', 'triceps'],
    'lower arms': ['forearm'],
    'back': ['upper-back', 'lower-back', 'trapezius'],
    'upper legs': ['quadriceps', 'hamstring', 'gluteal'],
    'lower legs': ['calves']
};

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    // Profile Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [illnesses, setIllnesses] = useState('');
    const [fitnessGoals, setFitnessGoals] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');

    // Nutrition Targets
    const [nutritionTargets, setNutritionTargets] = useState(null);

    // Planogram Data
    const [recentSessions, setRecentSessions] = useState([]);
    const [volumeTiers, setVolumeTiers] = useState({
        extreme: [],
        high: [],
        moderate: [],
        light: []
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const userObj = getUserObject();
            if (!userObj?.sub) {
                setLoading(false);
                return;
            }
            setUser(userObj);

            try {
                // Fetch fresh data from backend
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/nest/users/${userObj.sub}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    if (data.profile) {
                        setWeight(data.profile.weight || '');
                        setHeight(data.profile.height || '');
                        setAge(data.profile.age || '');
                        setGender(data.profile.gender || 'Male');
                        setIllnesses(data.profile.illnesses || '');
                        setFitnessGoals(data.profile.fitnessGoals || '');

                        if (data.profile.targetCalories) {
                            setNutritionTargets({
                                calories: data.profile.targetCalories,
                                protein: data.profile.targetProtein,
                                carbs: data.profile.targetCarbs,
                                fat: data.profile.targetFat,
                                dietName: data.profile.macroDietName // Add diet name
                            });
                        }
                    }
                }

                // Fetch session history for the planogram
                const sessionRes = await fetch(`http://localhost:3000/api/nest/workouts/history/sessions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (sessionRes.ok) {
                    const sessions = await sessionRes.json();
                    setRecentSessions(sessions);
                    analyzeSessionVolume(sessions);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const analyzeSessionVolume = (sessions) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const muscleVolume = {};

        sessions.forEach(session => {
            const sessionDate = new Date(session.startTime);
            if (sessionDate >= sevenDaysAgo) {
                session.exercises.forEach(ex => {
                    const targetStr = (ex.target || 'Unknown').toLowerCase();

                    let exerciseVolume = 0;
                    ex.sets.forEach(set => {
                        const reps = Number(set.reps) || 0;
                        const weight = Number(set.weight) || 0;

                        // Volume = reps * weight. If weight is 0 (like bodyweight), count each rep as 1 unit
                        const weightToUse = weight > 0 ? weight : 1;
                        exerciseVolume += (reps * weightToUse);
                    });

                    if (targetStr !== 'unknown') {
                        muscleVolume[targetStr] = (muscleVolume[targetStr] || 0) + exerciseVolume;
                    }
                });
            }
        });

        console.log("Calculated Volume Map:", muscleVolume);

        const tiers = {
            extreme: [],  // > 1000kg
            high: [],     // 500 - 1000kg
            moderate: [], // 200 - 500kg
            light: []     // < 200kg
        };

        Object.keys(muscleVolume).forEach(target => {
            const volume = muscleVolume[target];
            const slugs = DB_TO_BODYMAP[target] || [];

            slugs.forEach(slug => {
                if (volume >= 1000) {
                    if (!tiers.extreme.includes(slug)) tiers.extreme.push(slug);
                } else if (volume >= 500) {
                    if (!tiers.high.includes(slug)) tiers.high.push(slug);
                } else if (volume >= 200) {
                    if (!tiers.moderate.includes(slug)) tiers.moderate.push(slug);
                } else if (volume > 0) {
                    if (!tiers.light.includes(slug)) tiers.light.push(slug);
                }
            });
        });

        console.log("Calculated Tiers:", tiers);
        setVolumeTiers(tiers);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/nest/users/${user?.sub}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    profile: {
                        weight: weight ? parseFloat(weight) : null,
                        height: height ? parseFloat(height) : null,
                        age: age ? parseInt(age) : null,
                        gender: gender,
                        illnesses: illnesses,
                        fitnessGoals: fitnessGoals,
                        ...(nutritionTargets ? {
                            targetCalories: nutritionTargets.calories,
                            targetProtein: nutritionTargets.protein,
                            targetCarbs: nutritionTargets.carbs,
                            targetFat: nutritionTargets.fat,
                            macroDietName: nutritionTargets.dietName
                        } : {})
                    }
                })
            });

            if (response.ok) {
                setSaveStatus('success');
                // Auto-hide success message after 3 seconds
                setTimeout(() => setSaveStatus(null), 3000);

                // Note: To fully sync `CardNav` it needs to fetch fresh data, or we update localStorage.
                // Re-setting JWT claims requires backend returning a new token, but patching local data is easier for now:
                const sessionUserStr = localStorage.getItem('user');
                if (sessionUserStr) {
                    try {
                        const sessionUser = JSON.parse(sessionUserStr);
                        if (sessionUser) {
                            sessionUser.firstName = firstName;
                            sessionUser.lastName = lastName;
                            localStorage.setItem('user', JSON.stringify(sessionUser));
                            // Dispatch custom event to tell CardNav to re-read localStorage
                            window.dispatchEvent(new Event('auth-change'));
                        }
                    } catch (e) {
                        console.error('Failed to parse user from localStorage', e);
                    }
                }
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white font-sans flex items-center justify-center">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans pb-20 md:pb-6">
            <CardNav />

            <main className="pt-24 md:pt-32 px-4 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 md:p-10 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Health Profile</h1>
                            <p className="text-neutral-400">Manage your metrics for personalized AI analysis</p>
                        </div>
                    </div>

                    {saveStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3 mb-6"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <p>Profile saved successfully!</p>
                        </motion.div>
                    )}

                    {saveStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6"
                        >
                            <AlertCircle className="w-5 h-5" />
                            <p>Failed to save profile. Please try again.</p>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                        {/* Weekly Planogram */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl col-span-1 xl:col-span-2">
                            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4 flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-cyan-500" />
                                        7-Day Muscle Volume
                                    </h2>
                                    <p className="text-zinc-500 text-sm mt-1">Total weight (kg) lifted per muscle group</p>
                                </div>
                                <div className="flex flex-row md:flex-col gap-x-4 gap-y-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider flex-wrap">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <div className="w-3 h-3 rounded-sm bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div> +1000 kg Extreme
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div className="w-3 h-3 rounded-sm bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.4)]"></div> 500-1000 kg High
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <div className="w-3 h-3 rounded-sm bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]"></div> 200-500 kg Mod
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <div className="w-3 h-3 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]"></div> {"<"}200 kg Light
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 w-full h-[400px]">
                                {[
                                    { type: 'anterior', label: 'Front' },
                                    { type: 'posterior', label: 'Back' }
                                ].map(({ type, label }) => {
                                    // React-body-highlighter maps colors by *frequency* (how many times a muscle appears).
                                    // Index 0 = frequency 1, Index 1 = frequency 2, etc.
                                    // To get our 4 tiers, we "stack" the data so higher tiers appear multiple times.
                                    const frequencyData = [
                                        { name: 'Base', muscles: [...volumeTiers.extreme, ...volumeTiers.high, ...volumeTiers.moderate, ...volumeTiers.light] }, // Freq 1: Green
                                        { name: 'Level 2', muscles: [...volumeTiers.extreme, ...volumeTiers.high, ...volumeTiers.moderate] }, // Freq 2: Orange
                                        { name: 'Level 3', muscles: [...volumeTiers.extreme, ...volumeTiers.high] }, // Freq 3: Pink
                                        { name: 'Level 4', muscles: [...volumeTiers.extreme] } // Freq 4: Red
                                    ];

                                    return (
                                        <div key={type} className="h-full bg-zinc-950/50 border border-zinc-800/60 rounded-2xl p-4 flex flex-col items-center flex-1 w-full max-w-[300px]">
                                            <div className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">{label}</div>
                                            <Model
                                                type={type}
                                                data={frequencyData}
                                                highlightedColors={['#10b981', '#fb923c', '#fb7185', '#e11d48']} // Green, Orange, Pink, Red
                                                style={{ height: '100%', width: '100%' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {nutritionTargets && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-10">
                            <div className="mb-6 border-b border-zinc-800 pb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    Goal Daily Targets
                                </h2>
                                {nutritionTargets.dietName && (
                                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg">
                                        {nutritionTargets.dietName}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-4 lg:px-12">
                                <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-full border-4 border-zinc-800 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                                    <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{nutritionTargets.calories} <span className="text-sm text-zinc-500 font-semibold tracking-normal uppercase">kcal</span></div>
                                </div>

                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition-colors rounded-2xl p-4 text-center group">
                                        <div className="text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-1">Protein</div>
                                        <div className="text-2xl font-bold text-white tabular-nums group-hover:text-indigo-100">{nutritionTargets.protein}<span className="text-xs text-zinc-500 ml-1">g</span></div>
                                    </div>
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-colors rounded-2xl p-4 text-center group">
                                        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">Carbs</div>
                                        <div className="text-2xl font-bold text-white tabular-nums group-hover:text-emerald-100">{nutritionTargets.carbs}<span className="text-xs text-zinc-500 ml-1">g</span></div>
                                    </div>
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-colors rounded-2xl p-4 text-center group">
                                        <div className="text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">Fat</div>
                                        <div className="text-2xl font-bold text-white tabular-nums group-hover:text-amber-100">{nutritionTargets.fat}<span className="text-xs text-zinc-500 ml-1">g</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-neutral-200 border-b border-neutral-700 pb-2">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Physical Metrics */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-neutral-200 border-b border-neutral-700 pb-2">Physical Metrics for AI</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                        <Scale className="w-4 h-4" /> Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="e.g. 75.5"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                        <Ruler className="w-4 h-4" /> Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="e.g. 180"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Age
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="e.g. 25"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Health Conditions */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-neutral-200 border-b border-neutral-700 pb-2">Health Context</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rose-400" /> Illnesses & Injuries
                                </label>
                                <textarea
                                    value={illnesses}
                                    onChange={(e) => setIllnesses(e.target.value)}
                                    placeholder="e.g. Asthma, slipped disc in lower back, high blood pressure. (Leave blank if none)"
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                                ></textarea>
                                <p className="text-xs text-neutral-500">The AI coach will analyze your workouts and warn you if an exercise might aggravate these conditions.</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-400" /> Primary Fitness Goals
                                </label>
                                <textarea
                                    value={fitnessGoals}
                                    onChange={(e) => setFitnessGoals(e.target.value)}
                                    placeholder="e.g. I want to lose body fat while maintaining muscle mass."
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px] resize-y"
                                ></textarea>
                                <p className="text-xs text-neutral-500">The AI coach will evaluate if your workout volume and exercise selection align with these goals.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
