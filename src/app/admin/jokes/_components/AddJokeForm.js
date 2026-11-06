'use client';

import { useAddJokeForm } from '../_hooks/useAdminJokes';

const TEXTAREA_CLASS = 'w-full px-4 py-3 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all resize-none';

export default function AddJokeForm({ onAdded }) {
    const { form, setForm, error, submitting, isOpen, open, close, handleAdd } = useAddJokeForm(onAdded);

    return (
        <div className="space-y-4">
            {!isOpen ? (
                <button
                    onClick={open}
                    className="w-full py-4 glass rounded-2xl shadow-modern font-bold text-accent dark:text-accentDark hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border-2 border-dashed border-accent/30 dark:border-accentDark/30 cursor-pointer"
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
                            onClick={close}
                            className="text-sm opacity-50 hover:opacity-100 cursor-pointer"
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
                            className={TEXTAREA_CLASS}
                        />
                        <textarea
                            placeholder="Punchline..."
                            value={form.punchline}
                            onChange={(e) => setForm((f) => ({ ...f, punchline: e.target.value }))}
                            rows={2}
                            required
                            className={TEXTAREA_CLASS}
                        />
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full cursor-pointer disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Adding...' : 'Add Joke'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
