'use client';

import JokeEditForm from './JokeEditForm';

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

function JokeBadges({ joke, draftPosition }) {
    const showDraft = draftPosition >= 0 && joke.top10_rank !== draftPosition + 1;
    return (
        <>
            {joke.top10_rank !== null && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-accent/15 dark:bg-accentDark/15 text-accent dark:text-accentDark border border-accent/25 dark:border-accentDark/25">
                    Top 10 #{joke.top10_rank}
                </span>
            )}
            {showDraft && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-light/10 dark:bg-dark/10 border border-accent/25 dark:border-accentDark/25">
                    Draft #{draftPosition + 1}
                </span>
            )}
        </>
    );
}

function JokeActions({ joke, onStar, onEdit, onDelete }) {
    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={() => onStar(joke.id)}
                title={joke.jc_starred ? 'Remove JC star' : 'Add JC star'}
                className={`text-2xl transition-all hover:scale-125 cursor-pointer ${joke.jc_starred ? 'text-accentDark drop-shadow-[0_0_8px_rgba(255,219,77,0.5)]' : 'opacity-20 hover:opacity-100'}`}
            >
                ★
            </button>
            <button
                type="button"
                onClick={() => onEdit(joke)}
                title="Edit joke"
                className="text-xl opacity-20 hover:opacity-100 transition-all hover:scale-125 cursor-pointer"
            >
                ✏
            </button>
            <button
                onClick={() => onDelete(joke.id)}
                title="Delete joke"
                className="text-xl opacity-20 hover:opacity-100 hover:text-red-500 transition-all hover:scale-125 cursor-pointer"
            >
                🗑
            </button>
        </div>
    );
}

export default function JokeCard({
    joke,
    draftPosition,
    isEditing,
    editor,
    searchTerm,
    onStar,
    onDelete,
    onToggleDraft,
}) {
    const isInDraftTop10 = draftPosition >= 0;

    return (
        <div className="glass rounded-[2rem] p-6 shadow-modern group hover:shadow-modern-lg transition-all duration-300">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {isEditing ? (
                            <p className="text-sm font-semibold opacity-70">Editing joke</p>
                        ) : (
                            <p className="text-xl font-bold text-accent dark:text-accentDark leading-tight">
                                {highlightText(joke.setup, searchTerm)}
                            </p>
                        )}
                        <JokeBadges joke={joke} draftPosition={draftPosition} />
                    </div>
                    {isEditing ? (
                        <JokeEditForm editor={editor} jokeId={joke.id} />
                    ) : (
                        <>
                            <p className="text-lg opacity-80 leading-relaxed mb-3">
                                {highlightText(joke.punchline, searchTerm)}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onToggleDraft(joke.id, isInDraftTop10)}
                                    className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors cursor-pointer"
                                >
                                    {isInDraftTop10 ? 'Remove from Top 10 Draft' : 'Add to Top 10 Draft'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <JokeActions joke={joke} onStar={onStar} onEdit={editor.startEdit} onDelete={onDelete} />
            </div>
        </div>
    );
}
