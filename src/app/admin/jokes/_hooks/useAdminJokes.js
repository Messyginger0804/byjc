'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    EMPTY_JOKE_FORM,
    validateJoke,
    getSavedTop10Ids,
    filterJokes,
    addToDraft,
    moveInDraft,
    top10SavedMessage,
    jsonHeaders,
} from './jokeHelpers';

export function useAdminJokes() {
    const router = useRouter();
    const [jokes, setJokes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [draftTop10Ids, setDraftTop10Ids] = useState([]);
    const [savedTop10Ids, setSavedTop10Ids] = useState([]);
    const [isSavingTop10, setIsSavingTop10] = useState(false);
    const [top10Message, setTop10Message] = useState('');

    const syncTop10FromRows = useCallback((rows) => {
        const savedIds = getSavedTop10Ids(rows);

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

    function addToTop10Draft(jokeId) {
        setTop10Message('');
        setDraftTop10Ids((current) => addToDraft(current, jokeId));
    }

    function removeFromTop10Draft(jokeId) {
        setTop10Message('');
        setDraftTop10Ids((current) => current.filter((id) => id !== jokeId));
    }

    function moveDraftTop10(jokeId, direction) {
        setTop10Message('');
        setDraftTop10Ids((current) => moveInDraft(current, jokeId, direction));
    }

    async function saveTop10() {
        setTop10Message('');
        setIsSavingTop10(true);

        const res = await fetch('/api/jokes/top10', {
            method: 'PATCH',
            headers: jsonHeaders(),
            body: JSON.stringify({ jokeIds: draftTop10Ids }),
        });

        setIsSavingTop10(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setTop10Message(data.error || 'Failed to save top 10 list.');
            return;
        }

        const data = await res.json();
        setTop10Message(top10SavedMessage(data.droppedCount));

        await fetchJokes();
        setDraftTop10Ids(data.savedIds);
    }

    const filteredJokes = filterJokes(jokes, debouncedSearch);

    const jokesById = useMemo(() => {
        const map = new Map();
        jokes.forEach((joke) => map.set(joke.id, joke));
        return map;
    }, [jokes]);

    const draftTop10Jokes = draftTop10Ids
        .map((id) => jokesById.get(id))
        .filter(Boolean);

    const isTop10Dirty = draftTop10Ids.join(',') !== savedTop10Ids.join(',');

    return {
        fetchJokes,
        searchTerm,
        setSearchTerm,
        debouncedSearch,
        filteredJokes,
        draftTop10Ids,
        draftTop10Jokes,
        isTop10Dirty,
        isSavingTop10,
        top10Message,
        handleLogout,
        handleStar,
        handleDelete,
        addToTop10Draft,
        removeFromTop10Draft,
        moveDraftTop10,
        saveTop10,
    };
}

export function useAddJokeForm(onAdded) {
    const [form, setForm] = useState(EMPTY_JOKE_FORM);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    async function handleAdd(e) {
        e.preventDefault();
        const validationError = validateJoke(form);
        if (validationError) { setError(validationError); return; }
        setError('');
        setSubmitting(true);

        const res = await fetch('/api/jokes', {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify(form),
        });
        setSubmitting(false);

        if (res.ok) {
            setForm(EMPTY_JOKE_FORM);
            setIsOpen(false);
            onAdded();
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to add joke');
        }
    }

    function close() {
        setIsOpen(false);
        setError('');
    }

    return { form, setForm, error, submitting, isOpen, open: () => setIsOpen(true), close, handleAdd };
}

export function useJokeEditor(onSaved) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_JOKE_FORM);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    function startEdit(joke) {
        setEditingId(joke.id);
        setEditForm({ setup: joke.setup, punchline: joke.punchline });
        setEditError('');
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm(EMPTY_JOKE_FORM);
        setEditError('');
    }

    async function saveEdit(id) {
        const validationError = validateJoke(editForm);
        if (validationError) { setEditError(validationError); return; }

        setIsSavingEdit(true);
        setEditError('');

        const res = await fetch(`/api/jokes/${id}`, {
            method: 'PATCH',
            headers: jsonHeaders(),
            body: JSON.stringify(editForm),
        });

        setIsSavingEdit(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setEditError(data.error || 'Failed to update joke.');
            return;
        }

        cancelEdit();
        await onSaved();
    }

    return { editingId, editForm, setEditForm, isSavingEdit, editError, startEdit, cancelEdit, saveEdit };
}
