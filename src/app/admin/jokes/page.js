'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminJokesPage() {
    const router = useRouter();
    const [jokes, setJokes] = useState([]);
    const [form, setForm] = useState({ title: '', body: '', source: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchJokes = useCallback(async () => {
        const res = await fetch('/api/jokes');
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

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!form.body.trim()) { setError('Joke body is required'); return; }
        setError('');
        setSubmitting(true);

        const res = await fetch('/api/jokes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setSubmitting(false);

        if (res.ok) {
            setForm({ title: '', body: '', source: '' });
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

                {/* Add joke form */}
                <form onSubmit={handleAdd} className="bg-gray-900 rounded-2xl p-6 mb-8 flex flex-col gap-3">
                    <h2 className="font-semibold text-gray-300 mb-1">Add a Joke</h2>
                    <input
                        type="text"
                        placeholder="Title (optional)"
                        value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                    />
                    <textarea
                        placeholder="The joke (required)"
                        value={form.body}
                        onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                        rows={3}
                        required
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400 resize-none"
                    />
                    <input
                        type="text"
                        placeholder="Source (optional)"
                        value={form.source}
                        onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
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
                    {jokes.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No jokes yet. Add your first one above!</p>
                    )}
                    {jokes.map((joke) => (
                        <div key={joke.id} className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    {joke.title && (
                                        <p className="font-semibold text-gray-200 mb-1">{joke.title}</p>
                                    )}
                                    <p className="text-gray-300 whitespace-pre-wrap">{joke.body}</p>
                                    {joke.source && (
                                        <p className="text-xs text-gray-500 mt-1">— {joke.source}</p>
                                    )}
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
