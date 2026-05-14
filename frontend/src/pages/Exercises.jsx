import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Dumbbell, ArrowLeft, Loader2, LayoutGrid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import CardNav from '../components/CardNav';

export default function Exercises() {
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [presentation, setPresentation] = useState('grid'); // 'grid' | 'table'

    // Global Explorer States
    const [searchInput, setSearchInput] = useState(urlQuery.split('+').join(' ')); // human readable
    const [activeQuery, setActiveQuery] = useState(urlQuery); // actual fetch target
    const [offset, setOffset] = useState(0);
    const limit = 30; // 30 items per page

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            if (searchInput) {
                // convert spaces to + for multi-query support if needed, or just leave as is for backend search
                setActiveQuery(searchInput);
            } else {
                setActiveQuery('');
            }
            // Reset offset when typing new search
            setOffset(0);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(true);
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

                if (activeQuery) {
                    // Split by + to retain Multi-Muscle Map targeting logic
                    const queries = activeQuery.split('+');
                    const promises = queries.map(async (q) => {
                        // We apply limit/offset even to search to keep UI performant
                        const response = await fetch(`${baseUrl}/api/nest/exercises/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`);
                        if (!response.ok) throw new Error(`Failed to fetch exercises for ${q}`);
                        const data = await response.json();
                        return Array.isArray(data) ? data : (data?.data || []);
                    });

                    const responses = await Promise.all(promises);
                    const allResults = responses.flat();

                    const uniqueExercises = [];
                    const seenIds = new Set();
                    allResults.forEach(ex => {
                        const id = ex.exerciseId || ex.id;
                        if (id && !seenIds.has(id)) {
                            seenIds.add(id);
                            uniqueExercises.push(ex);
                        }
                    });

                    setExercises(uniqueExercises);
                } else {
                    // Global Fetch (No Search)
                    const response = await fetch(`${baseUrl}/api/nest/exercises?limit=${limit}&offset=${offset}`);
                    if (!response.ok) throw new Error('Failed to fetch global list');
                    const data = await response.json();

                    const exerciseList = Array.isArray(data) ? data : (data?.data || []);
                    setExercises(exerciseList);
                }

                // Hydrate the equipments filter
            } catch (error) {
                console.error("Error fetching exercises:", error);
                setExercises([]);
                setAvailableEquipment([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [activeQuery, offset]);

    // Recalculate equipment facets based on current chunk of exercises
    useEffect(() => {
        const equipments = new Set();
        exercises.forEach(ex => {
            if (ex.equipments && Array.isArray(ex.equipments)) {
                ex.equipments.forEach(eq => equipments.add(eq));
            } else if (ex.equipment && typeof ex.equipment === 'string') {
                equipments.add(ex.equipment);
            }
        });
        setAvailableEquipment(Array.from(equipments).sort());
    }, [exercises]);

    const filteredExercises = exercises.filter(ex => {
        if (!selectedEquipment) return true;
        const eqs = ex.equipments || (ex.equipment ? [ex.equipment] : []);
        return eqs.includes(selectedEquipment);
    });

    const handlePrevPage = () => setOffset(prev => Math.max(0, prev - limit));
    const handleNextPage = () => setOffset(prev => prev + limit);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-20">
            <CardNav />
            <main className="pt-32 px-6 max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Body Map
                </button>

                {/* Hero & Global Search Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black capitalize tracking-tight mb-2"
                        >
                            Exercise Library
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-400 text-lg"
                        >
                            Search and explore our entire database of movements.
                        </motion.p>
                    </div>

                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by muscle, name, or target..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-cyan-500/50 shadow-inner"
                        />
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.05)] backdrop-blur-md">
                    {/* Equipment Filters */}
                    {availableEquipment.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setSelectedEquipment(null)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${selectedEquipment === null
                                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                    }`}
                            >
                                All Matches
                            </button>
                            {availableEquipment.map(eq => (
                                <button
                                    key={eq}
                                    onClick={() => setSelectedEquipment(eq)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all capitalize ${selectedEquipment === eq
                                        ? 'bg-cyan-500 text-zinc-950 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                        : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                                        }`}
                                >
                                    {eq}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="bg-zinc-950/50 rounded-xl p-4 md:p-6 border border-zinc-800/50 min-h-[400px] flex flex-col relative">
                        {/* Control Bar */}
                        <div className="flex items-center justify-between mb-6 flex-shrink-0 flex-wrap gap-4">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                {selectedEquipment ? `${selectedEquipment} Exercises` : 'Global Directory'}
                                {activeQuery && ` • "${activeQuery.split('+').join(', ')}"`}
                            </h4>

                            <div className="flex items-center gap-4 ml-auto">
                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2 bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={offset === 0}
                                        className="p-1.5 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-bold text-zinc-500 px-2 select-none">
                                        {offset} - {offset + limit}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={exercises.length < limit}
                                        className="p-1.5 rounded-md text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="hidden sm:flex bg-zinc-900/80 rounded-lg p-1 border border-zinc-800">
                                    <button
                                        onClick={() => setPresentation('grid')}
                                        className={`p-1.5 rounded-md transition-colors ${presentation === 'grid' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPresentation('table')}
                                        className={`p-1.5 rounded-md transition-colors ${presentation === 'table' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Frame */}
                        <div className="flex-1 relative">
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-500 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm font-medium animate-pulse">Syncing Database...</span>
                                </div>
                            ) : filteredExercises.length > 0 ? (
                                <div className={presentation === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                                    {filteredExercises.map(ex => (
                                        <div
                                            key={ex.exerciseId || ex.id}
                                            onClick={() => navigate(`/exercise/${ex.exerciseId || ex.id}`)}
                                            className={`group relative flex ${presentation === 'grid' ? 'p-4 gap-4' : 'p-3 gap-6 items-center'} rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer overflow-hidden`}
                                        >
                                            <div className={`${presentation === 'grid' ? 'w-24 h-24' : 'w-16 h-16'} rounded-lg bg-zinc-950 flex-shrink-0 overflow-hidden border border-zinc-800/50`}>
                                                {ex.gifUrl ? (
                                                    <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-700"><Dumbbell className="w-8 h-8" /></div>
                                                )}
                                            </div>
                                            <div className={`flex ${presentation === 'grid' ? 'flex-col justify-center' : 'flex-row items-center justify-between'} min-w-0 flex-1`}>
                                                <h5 className={`font-bold text-zinc-100 capitalize truncate group-hover:text-cyan-400 transition-colors ${presentation === 'grid' ? 'mb-2 text-lg' : 'text-md w-1/3'}`}>
                                                    {ex.name}
                                                </h5>

                                                {presentation === 'table' && (
                                                    <div className="flex-1 px-4 truncate text-zinc-500 text-sm capitalize">
                                                        {ex.target}
                                                    </div>
                                                )}

                                                <div className={`flex flex-wrap gap-1.5 ${presentation === 'grid' ? 'mt-auto' : 'justify-end'}`}>
                                                    {(() => {
                                                        const eqs = ex.equipments || (ex.equipment ? [ex.equipment] : []);
                                                        return eqs.slice(0, 2).map((eq, i) => (
                                                            <span key={i} className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700/50 capitalize whitespace-nowrap">
                                                                {eq}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 text-center px-4">
                                    <Dumbbell className="w-12 h-12 opacity-20 mb-4" />
                                    <p className="text-lg">No exercises found for this page chunk.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
