'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminJokesPage() {
    const router = useRouter();
    const [jokes, setJokes] = useState([]);
    const [form, setForm] = useState({ setup: '', punchline: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const fetchJokes = useCallback(async (search = '') => {
        const url = search ? `/api/jokes?search=${encodeURIComponent(search)}` : '/api/jokes';
        const res = await fetch(url);
        if (res.status === 401) { router.push('/admin/login'); return; }
        if (res.ok) setJokes(await res.json());
    }, [router]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch('/api/jokes');
            if (res.status === 401) { router.push('/admin/login'); return; }
            if (res.ok && !cancelled) setJokes(await res.json());
        })();
        return () => { cancelled = true; };
    }, [router]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.setup.trim()) { setError('Setup is required'); return; }
        if (!form.punchline.trim()) { setError('Punchline is required'); return; }
        setError('');
        setSubmitting(true);

        const res = await fetch('/api/jokes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setSubmitting(false);

        if (res.ok) {
            setForm({ setup: '', punchline: '' });
            setIsAddFormOpen(false);
            fetchJokes();
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to add joke');
        }
    }

    async function handleStar(id) {
        await fetch(`/api/jokes/${id}/star`, { method: 'PATCH' });
        fetchJokes();
    }

    async function handleDelete(id) {
        if (!confirm('Delete this joke?')) return;
        await fetch(`/api/jokes/${id}`, { method: 'DELETE' });
        fetchJokes();
    }

    const highlightText = (text, term) => {
        if (!term) return text;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part)
                ? <mark key={i} className="bg-accent/20 dark:bg-accentDark/20 text-accent dark:text-accentDark rounded px-1">{part}</mark>
                : part
        );
    };

    const filteredJokes = debouncedSearch
        ? jokes.filter(j =>
            j.setup.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            j.punchline.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : jokes;

    return (
        <main className="min-h-screen px-6 py-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:100%_6px] bg-left-bottom bg-no-repeat pb-2">
                            Jokes Collection
                        </span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-full border border-accent/30 dark:border-accentDark/30 text-sm font-medium hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors"
                    >
                        Log out
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar: Search & Add */}
                    <aside className="lg:col-span-5 space-y-8">
                        {/* Search Section */}
                        <div className="glass rounded-[2rem] p-6 shadow-modern">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-accent dark:text-accentDark">🔍</span> Search
                            </h2>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Search jokes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { if (searchTerm.trim()) fetchJokes(searchTerm.trim()); }}
                                        className="flex-1 btn-primary text-sm py-2"
                                    >
                                        Search Server
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchTerm(''); fetchJokes(); }}
                                        className="px-4 py-2 rounded-full border border-accent/20 dark:border-accentDark/20 text-sm hover:bg-light/10 dark:hover:bg-dark/10 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add joke form */}
                        <div className="space-y-4">
                            {!isAddFormOpen ? (
                                <button
                                    onClick={() => setIsAddFormOpen(true)}
                                    className="w-full py-4 glass rounded-2xl shadow-modern font-bold text-accent dark:text-accentDark hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border-2 border-dashed border-accent/30 dark:border-accentDark/30"
                                >
                                    <span>➕</span> Add New Joke
                                </button>
                            ) : (
                                <form 
                                    onSubmit={async (e) => {
                                        await handleAdd(e);
                                        // We don't close here because handleAdd might fail with error.
                                        // But if handleAdd succeeded, we'd want to close.
                                        // Let's modify handleAdd to return success.
                                    }} 
                                    className="glass rounded-[2rem] p-6 shadow-modern animate-fade-in"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <span className="text-accent dark:text-accentDark">➕</span> Add New
                                        </h2>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setIsAddFormOpen(false);
                                                setError('');
                                            }}
                                            className="text-sm opacity-50 hover:opacity-100"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <textarea
                                            placeholder="Setup..."
                                            value={form.setup}
                                            onChange={(e) => setForm(f => ({ ...f, setup: e.target.value }))}
                                            rows={2}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none"
                                        />
                                        <textarea
                                            placeholder="Punchline..."
                                            value={form.punchline}
                                            onChange={(e) => setForm(f => ({ ...f, punchline: e.target.value }))}
                                            rows={2}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none"
                                        />
                                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="btn-primary w-full"
                                        >
                                            {submitting ? 'Adding…' : 'Add Joke'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </aside>

                    {/* Main Content: Jokes list */}
                    <div className="lg:col-span-7">
                        <div className="flex flex-col gap-6">
                            {filteredJokes.length === 0 && (
                                <div className="glass rounded-[2rem] p-12 text-center shadow-modern">
                                    <p className="opacity-50 text-lg">No jokes found. Add one or try a different search!</p>
                                </div>
                            )}
                            {filteredJokes.map((joke) => (
                                <div key={joke.id} className="glass rounded-[2rem] p-6 shadow-modern group hover:shadow-modern-lg transition-all duration-300">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-xl font-bold text-accent dark:text-accentDark mb-2 leading-tight">
                                                {highlightText(joke.setup, debouncedSearch)}
                                            </p>
                                            <p className="text-lg opacity-80 leading-relaxed">
                                                {highlightText(joke.punchline, debouncedSearch)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => handleStar(joke.id)}
                                                title={joke.jc_starred ? 'Remove JC star' : 'Add JC star'}
                                                className={`text-2xl transition-all hover:scale-125 ${joke.jc_starred ? 'text-accentDark drop-shadow-[0_0_8px_rgba(255,219,77,0.5)]' : 'opacity-20 hover:opacity-100'}`}
                                            >
                                                ★
                                            </button>
                                            <button
                                                onClick={() => handleDelete(joke.id)}
                                                title="Delete joke"
                                                className="text-xl opacity-20 hover:opacity-100 hover:text-red-500 transition-all hover:scale-125"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
