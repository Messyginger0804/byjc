export const MAX_STAGED_TOP10 = 15;

export const EMPTY_JOKE_FORM = { setup: '', punchline: '' };

// Returns an error message when the joke is invalid, otherwise ''.
export function validateJoke(form) {
    if (!form.setup.trim()) return 'Setup is required';
    if (!form.punchline.trim()) return 'Punchline is required';
    return '';
}

export function getSavedTop10Ids(rows) {
    return rows
        .filter((joke) => joke.top10_rank !== null)
        .sort((a, b) => a.top10_rank - b.top10_rank)
        .map((joke) => joke.id);
}

export function filterJokes(jokes, term) {
    if (!term) return jokes;
    const lower = term.toLowerCase();
    return jokes.filter((j) =>
        j.setup.toLowerCase().includes(lower) ||
        j.punchline.toLowerCase().includes(lower)
    );
}

export function addToDraft(current, jokeId) {
    if (current.includes(jokeId)) return current;
    if (current.length >= MAX_STAGED_TOP10) return current;
    return [...current, jokeId];
}

export function moveInDraft(current, jokeId, direction) {
    const index = current.indexOf(jokeId);
    if (index < 0) return current;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= current.length) return current;
    const next = [...current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
}

export function top10SavedMessage(droppedCount) {
    if (droppedCount > 0) return `Saved top 10. Dropped ${droppedCount} staged item(s).`;
    return 'Saved top 10 order.';
}

export function jsonHeaders() {
    return { 'Content-Type': 'application/json' };
}
