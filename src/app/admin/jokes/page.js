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
                ? <mark key={i} className="bg-yellow-400/30 text-yellow-100 rounded px-0.5">{part}</mark>
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
        <main className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-2xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Jokes Collection</h1>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Log out
                    </button>
                </header>

                {/* Search Section */}
                <div className="bg-gray-900 rounded-2xl p-6 mb-8 flex flex-col gap-3">
                    <h2 className="font-semibold text-gray-300 mb-1">Search Jokes</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by setup or punchline (case-insensitive)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                        />
                        <button
                            type="button"
                            onClick={() => { if (searchTerm.trim()) fetchJokes(searchTerm.trim()); }}
                            className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-950 font-semibold hover:bg-yellow-300 transition-colors"
                        >
                            Search Server
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSearchTerm(''); fetchJokes(); }}
                            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Type to filter the current list instantly, or click &ldquo;Search Server&rdquo; to query the database.
                    </p>
                </div>

                {/* Add joke form */}
                <form onSubmit={handleAdd} className="bg-gray-900 rounded-2xl p-6 mb-8 flex flex-col gap-3">
                    <h2 className="font-semibold text-gray-300 mb-1">Add a Joke</h2>
                    <textarea
                        placeholder="Setup (required)"
                        value={form.setup}
                        onChange={(e) => setForm(f => ({ ...f, setup: e.target.value }))}
                        rows={2}
                        required
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 resize-none"
                    />
                    <textarea
                        placeholder="Punchline (required)"
                        value={form.punchline}
                        onChange={(e) => setForm(f => ({ ...f, punchline: e.target.value }))}
                        rows={2}
                        required
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 resize-none"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="self-start px-6 py-2 rounded-lg bg-yellow-400 text-gray-950 font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Adding…' : 'Add Joke'}
                    </button>
                </form>

                {/* Jokes list */}
                <div className="flex flex-col gap-4">
                    {filteredJokes.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No jokes yet. Add your first one above!</p>
                    )}
                    {filteredJokes.map((joke) => (
                        <div key={joke.id} className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-200 mb-1">{highlightText(joke.setup, debouncedSearch)}</p>
                                    <p className="text-gray-300">{highlightText(joke.punchline, debouncedSearch)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleStar(joke.id)}
                                        title={joke.jc_starred ? 'Remove JC star' : 'Add JC star'}
                                        className={`text-xl transition-transform hover:scale-110 ${joke.jc_starred ? 'text-yellow-400' : 'text-gray-600'}`}
                                    >
                                        ★
                                    </button>
                                    <button
                                        onClick={() => handleDelete(joke.id)}
                                        title="Delete joke"
                                        className="text-gray-600 hover:text-red-400 transition-colors text-lg"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
