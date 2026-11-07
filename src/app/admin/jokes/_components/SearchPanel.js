'use client';

export default function SearchPanel({ searchTerm, onSearchTermChange, onSearch, onClear }) {
    return (
        <div className="glass rounded-[2rem] p-6 shadow-modern">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-accent dark:text-accentDark">🔍</span> Search
            </h2>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Search jokes..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all"
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onSearch}
                        className="flex-1 btn-primary text-sm py-2 cursor-pointer"
                    >
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        className="px-4 py-2 rounded-full border border-accent/20 dark:border-accentDark/20 text-sm hover:bg-light/10 dark:hover:bg-dark/10 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
