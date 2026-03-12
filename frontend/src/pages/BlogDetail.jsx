import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Clock, Tag, User } from 'lucide-react';
import CardNav from '../components/CardNav';

export default function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogId = async () => {
            try {
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
                const response = await fetch(`${baseUrl}/api/nest/blog/${id}`);

                if (!response.ok) throw new Error('Article not found or expired from cache.');
                const data = await response.json();
                setBlog(data);
            } catch (err) {
                console.error(err);
                setError('This article could not be located. It may have been rotated out by the AI editor.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogId();
    }, [id]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 pb-32">
            <CardNav />
            <main className="pt-32 px-6 max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Articles
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-cyan-500 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <span className="text-xl font-bold animate-pulse">Retrieving Text...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
                        {error}
                    </div>
                ) : blog ? (
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-invert prose-cyan max-w-none"
                    >
                        <header className="mb-16 border-b border-zinc-800 pb-12">
                            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                                    <User className="w-4 h-4 text-cyan-400" /> {blog.author}
                                </span>
                                <span className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                                    <Clock className="w-4 h-4 text-cyan-400" /> {blog.readTime}
                                </span>
                                <span className="text-zinc-600 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                                    {blog.date}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8">
                                {blog.title}
                            </h1>

                            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed border-l-4 border-cyan-500 pl-6 space-y-0">
                                {blog.excerpt}
                            </p>
                        </header>

                        <div className="space-y-8 text-lg md:text-xl text-zinc-300 leading-[1.8] font-light">
                            {blog.content_paragraphs?.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        <footer className="mt-20 pt-12 border-t border-zinc-800">
                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Tags</h4>
                            <div className="flex flex-wrap gap-3">
                                {blog.tags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-2 text-sm font-semibold bg-zinc-900/80 px-4 py-2 rounded-xl border border-zinc-800/80 hover:border-cyan-500/50 transition-colors text-zinc-300">
                                        <Tag className="w-4 h-4 text-cyan-500" /> {tag}
                                    </span>
                                ))}
                            </div>
                        </footer>
                    </motion.article>
                ) : null}
            </main>
        </div>
    );
}
