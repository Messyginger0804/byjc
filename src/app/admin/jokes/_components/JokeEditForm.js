'use client';

const TEXTAREA_CLASS = 'w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none';

export default function JokeEditForm({ editor, jokeId }) {
    const { editForm, setEditForm, editError, isSavingEdit, saveEdit, cancelEdit } = editor;

    return (
        <div className="space-y-3 mb-3">
            <textarea
                rows={2}
                value={editForm.setup}
                onChange={(e) => setEditForm((current) => ({ ...current, setup: e.target.value }))}
                className={TEXTAREA_CLASS}
            />
            <textarea
                rows={2}
                value={editForm.punchline}
                onChange={(e) => setEditForm((current) => ({ ...current, punchline: e.target.value }))}
                className={TEXTAREA_CLASS}
            />
            {editError && <p className="text-xs text-red-500">{editError}</p>}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => saveEdit(jokeId)}
                    disabled={isSavingEdit}
                    className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                    {isSavingEdit ? 'Saving...' : 'Save Edit'}
                </button>
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs font-semibold px-3 py-1 rounded-full border border-accent/25 dark:border-accentDark/25 hover:bg-light/10 dark:hover:bg-dark/10 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
