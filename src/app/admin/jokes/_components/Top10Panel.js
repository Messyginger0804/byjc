'use client';

import { MAX_STAGED_TOP10 } from '../_hooks/jokeHelpers';

function StagedJoke({ joke, index, isLast, onRemove, onMove }) {
    return (
        <div className="rounded-xl border border-accent/20 dark:border-accentDark/20 p-3 bg-light/5 dark:bg-dark/5">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold mb-1">#{index + 1}</p>
                    <p className="text-sm font-medium leading-snug line-clamp-2">{joke.setup}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(joke.id)}
                    className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                    title="Remove"
                >
                    Remove
                </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
                <button
                    type="button"
                    onClick={() => onMove(joke.id, 'up')}
                    disabled={index === 0}
                    className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                    Up
                </button>
                <button
                    type="button"
                    onClick={() => onMove(joke.id, 'down')}
                    disabled={isLast}
                    className="text-xs px-2 py-1 rounded border border-accent/20 dark:border-accentDark/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                    Down
                </button>
            </div>
        </div>
    );
}

export default function Top10Panel({
    stagedCount,
    stagedJokes,
    isDirty,
    isSaving,
    message,
    onRemove,
    onMove,
    onSave,
}) {
    return (
        <div className="glass rounded-[2rem] p-6 shadow-modern sticky top-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">JC&apos;s Top 10</h2>
                <span className="text-xs font-semibold px-2 py-1 rounded-full border border-accent/25 dark:border-accentDark/25">
                    {stagedCount}/{MAX_STAGED_TOP10} staged
                </span>
            </div>

            <p className="text-xs opacity-70 mb-4">
                You can stage up to 15 here. Saving keeps the first 10 and drops the rest.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {stagedJokes.length === 0 && (
                    <div className="rounded-xl border border-dashed border-accent/25 dark:border-accentDark/25 px-4 py-5 text-sm opacity-70">
                        No staged jokes yet.
                    </div>
                )}

                {stagedJokes.map((joke, index) => (
                    <StagedJoke
                        key={joke.id}
                        joke={joke}
                        index={index}
                        isLast={index === stagedJokes.length - 1}
                        onRemove={onRemove}
                        onMove={onMove}
                    />
                ))}
            </div>

            <div className="mt-5 space-y-2">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving || !isDirty}
                    className="btn-primary w-full disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Top 10'}
                </button>
                {message && (
                    <p className="text-xs opacity-80">{message}</p>
                )}
                {isDirty && !message && (
                    <p className="text-xs opacity-70">Unsaved top 10 changes.</p>
                )}
            </div>
        </div>
    );
}
