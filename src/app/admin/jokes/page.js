'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const MAX_STAGED_TOP10 = 15;

export default function AdminJokesPage() {
    const router = useRouter();
    const [jokes, setJokes] = useState([]);
    const [form, setForm] = useState({ setup: '', punchline: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [draftTop10Ids, setDraftTop10Ids] = useState([]);
    const [savedTop10Ids, setSavedTop10Ids] = useState([]);
    const [isSavingTop10, setIsSavingTop10] = useState(false);
    const [top10Message, setTop10Message] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ setup: '', punchline: '' });
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    const syncTop10FromRows = useCallback((rows) => {
        const savedIds = rows
            .filter((joke) => joke.top10_rank !== null)
            .sort((a, b) => a.top10_rank - b.top10_rank)
            .map((joke) => joke.id);

        setSavedTop10Ids(savedIds);
        setDraftTop10Ids((currentDraft) => {
            if (currentDraft.length === 0) return savedIds;
            return currentDraft;
        });
    }, []);

    const fetchJokes = useCallback(async (search = '') => {
        const url = search ? `/api/jokes?search=${encodeURIComponent(search)}` : '/api/jokes';
        const res = await fetch(url);
        if (res.status === 401) { router.push('/admin/login'); return; }
        if (res.ok) {
            const rows = await res.json();
            setJokes(rows);
            syncTop10FromRows(rows);
        }
    }, [router, syncTop10FromRows]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch('/api/jokes');
            if (res.status === 401) { router.push('/admin/login'); return; }
            if (res.ok && !cancelled) {
                const rows = await res.json();
                setJokes(rows);
                syncTop10FromRows(rows);
            }
        })();
        return () => { cancelled = true; };
    }, [router, syncTop10FromRows]);

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
        setDraftTop10Ids((current) => current.filter((jokeId) => jokeId !== id));
        fetchJokes();
    }

    function startEdit(joke) {
        setEditingId(joke.id);
        setEditForm({ setup: joke.setup, punchline: joke.punchline });
        setEditError('');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({ setup: '', punchline: '' });
        setEditError('');
    }

    async function saveEdit(id) {
        if (!editForm.setup.trim()) { setEditError('Setup is required'); return; }
        if (!editForm.punchline.trim()) { setEditError('Punchline is required'); return; }

        setIsSavingEdit(true);
        setEditError('');

        const res = await fetch(`/api/jokes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
        });

        setIsSavingEdit(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setEditError(data.error || 'Failed to update joke.');
            return;
        }

        cancelEdit();
        await fetchJokes();
    }

    function addToTop10Draft(jokeId) {
        setTop10Message('');
        setDraftTop10Ids((current) => {
            if (current.includes(jokeId)) return current;
            if (current.length >= MAX_STAGED_TOP10) return current;
            return [...current, jokeId];
        });
    }

    function removeFromTop10Draft(jokeId) {
        setTop10Message('');
        setDraftTop10Ids((current) => current.filter((id) => id !== jokeId));
    }

    function moveDraftTop10(jokeId, direction) {
        setTop10Message('');
        setDraftTop10Ids((current) => {
            const index = current.indexOf(jokeId);
            if (index < 0) return current;
            const nextIndex = direction === 'up' ? index - 1 : index + 1;
            if (nextIndex < 0 || nextIndex >= current.length) return current;
            const next = [...current];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
    }

    async function saveTop10() {
        setTop10Message('');
        setIsSavingTop10(true);

        const res = await fetch('/api/jokes/top10', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jokeIds: draftTop10Ids }),
        });

        setIsSavingTop10(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setTop10Message(data.error || 'Failed to save top 10 list.');
            return;
        }

        const data = await res.json();
        if (data.droppedCount > 0) {
            setTop10Message(`Saved top 10. Dropped ${data.droppedCount} staged item(s).`);
        } else {
            setTop10Message('Saved top 10 order.');
        }

        await fetchJokes();
        setDraftTop10Ids(data.savedIds);
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
        ? jokes.filter((j) =>
            j.setup.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            j.punchline.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
        : jokes;

    const jokesById = useMemo(() => {
        const map = new Map();
        jokes.forEach((joke) => map.set(joke.id, joke));
        return map;
    }, [jokes]);

    const draftTop10Jokes = draftTop10Ids
        .map((id) => jokesById.get(id))
        .filter(Boolean);

    const isTop10Dirty = draftTop10Ids.join(',') !== savedTop10Ids.join(',');

    return (
        <main className="min-h-screen px-6 py-12 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto">
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

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <aside className="xl:col-span-3 space-y-8">
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
                                        Search
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

                        <div className="space-y-4">
                            {!isAddFormOpen ? (
                                <button
                                    onClick={() => setIsAddFormOpen(true)}
                                    className="w-full py-4 glass rounded-2xl shadow-modern font-bold text-accent dark:text-accentDark hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border-2 border-dashed border-accent/30 dark:border-accentDark/30"
                                >
                                    <span>➕</span> Add New Joke
                                </button>
                            ) : (
                                <form onSubmit={handleAdd} className="glass rounded-[2rem] p-6 shadow-modern animate-fade-in">
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
                                            onChange={(e) => setForm((f) => ({ ...f, setup: e.target.value }))}
                                            rows={2}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none"
                                        />
                                        <textarea
                                            placeholder="Punchline..."
                                            value={form.punchline}
                                            onChange={(e) => setForm((f) => ({ ...f, punchline: e.target.value }))}
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
                                            {submitting ? 'Adding...' : 'Add Joke'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </aside>

                    <div className="xl:col-span-6">
                        <div className="flex flex-col gap-6">
                            {filteredJokes.length === 0 && (
                                <div className="glass rounded-[2rem] p-12 text-center shadow-modern">
                                    <p className="opacity-50 text-lg">No jokes found. Add one or try a different search.</p>
                                </div>
                            )}

                            {filteredJokes.map((joke) => {
                                const draftPosition = draftTop10Ids.indexOf(joke.id);
                                const isInDraftTop10 = draftPosition >= 0;

                                return (
                                    <div key={joke.id} className="glass rounded-[2rem] p-6 shadow-modern group hover:shadow-modern-lg transition-all duration-300">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    {editingId === joke.id ? (
                                                        <p className="text-sm font-semibold opacity-70">Editing joke</p>
                                                    ) : (
                                                        <p className="text-xl font-bold text-accent dark:text-accentDark leading-tight">
                                                            {highlightText(joke.setup, debouncedSearch)}
                                                        </p>
                                                    )}
                                                    {joke.top10_rank !== null && (
                                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/15 dark:bg-accentDark/15 text-accent dark:text-accentDark border border-accent/25 dark:border-accentDark/25">
                                                            Top 10 #{joke.top10_rank}
                                                        </span>
                                                    )}
                                                    {isInDraftTop10 && joke.top10_rank !== draftPosition + 1 && (
                                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-light/10 dark:bg-dark/10 border border-accent/25 dark:border-accentDark/25">
                                                            Draft #{draftPosition + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                {editingId === joke.id ? (
                                                    <div className="space-y-3 mb-3">
                                                        <textarea
                                                            rows={2}
                                                            value={editForm.setup}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, setup: e.target.value }))}
                                                            className="w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none"
                                                        />
                                                        <textarea
                                                            rows={2}
                                                            value={editForm.punchline}
                                                            onChange={(e) => setEditForm((current) => ({ ...current, punchline: e.target.value }))}
                                                            className="w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none"
                                                        />
                                                        {editError && <p className="text-xs text-red-500">{editError}</p>}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => saveEdit(joke.id)}
                                                                disabled={isSavingEdit}
                                                                className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors disabled:opacity-50"
                                                            >
                                                                {isSavingEdit ? 'Saving...' : 'Save Edit'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEdit}
                                                                className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-light/10 dark:hover:bg-dark/10 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-lg opacity-80 leading-relaxed mb-3">
                                                            {highlightText(joke.punchline, debouncedSearch)}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => isInDraftTop10 ? removeFromTop10Draft(joke.id) : addToTop10Draft(joke.id)}
                                                                className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors"
                                                            >
                                                                {isInDraftTop10 ? 'Remove from Top 10 Draft' : 'Add to Top 10 Draft'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(joke)}
                                                                className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-light/10 dark:hover:bg-dark/10 transition-colors"
                                                            >
                                                                Edit Joke
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
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
                                );
                            })}
                        </div>
                    </div>

                    <aside className="xl:col-span-3">
                        <div className="glass rounded-[2rem] p-6 shadow-modern sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">JC&apos;s Top 10</h2>
                                <span className="text-xs font-semibold px-2 py-1 rounded-full border border-accent/25 dark:border-accentDark/25">
                                    {draftTop10Ids.length}/{MAX_STAGED_TOP10} staged
                                </span>
                            </div>

                            <p className="text-xs opacity-70 mb-4">
                                You can stage up to 15 here. Saving keeps the first 10 and drops the rest.
                            </p>

                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {draftTop10Jokes.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-accent/25 dark:border-accentDark/25 px-4 py-5 text-sm opacity-70">
                                        No staged jokes yet.
                                    </div>
                                )}

                                {draftTop10Jokes.map((joke, index) => (
                                    <div key={joke.id} className="rounded-xl border border-accent/20 dark:border-accentDark/20 p-3 bg-light/5 dark:bg-dark/5">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold mb-1">#{index + 1}</p>
                                                <p className="text-sm font-medium leading-snug line-clamp-2">{joke.setup}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromTop10Draft(joke.id)}
                                                className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 hover:bg-red-500/10 hover:text-red-500"
                                                title="Remove"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={() => moveDraftTop10(joke.id, 'up')}
                                                disabled={index === 0}
                                                className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 disabled:opacity-30"
                                            >
                                                Up
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveDraftTop10(joke.id, 'down')}
                                                disabled={index === draftTop10Jokes.length - 1}
                                                className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 disabled:opacity-30"
                                            >
                                                Down
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 space-y-2">
                                <button
                                    type="button"
                                    onClick={saveTop10}
                                    disabled={isSavingTop10 || !isTop10Dirty}
                                    className="btn-primary w-full disabled:opacity-50"
                                >
                                    {isSavingTop10 ? 'Saving...' : 'Save Top 10'}
                                </button>
                                {top10Message && (
                                    <p className="text-xs opacity-80">{top10Message}</p>
                                )}
                                {isTop10Dirty && !top10Message && (
                                    <p className="text-xs opacity-70">Unsaved top 10 changes.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
