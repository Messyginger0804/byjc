'use client';

import { useAdminJokes, useJokeEditor } from './_hooks/useAdminJokes';
import SearchPanel from './_components/SearchPanel';
import AddJokeForm from './_components/AddJokeForm';
import JokeCard from './_components/JokeCard';
import Top10Panel from './_components/Top10Panel';

export default function AdminJokesPage() {
    const jokes = useAdminJokes();
    const { fetchJokes, searchTerm, setSearchTerm, debouncedSearch, draftTop10Ids } = jokes;
    const editor = useJokeEditor(() => fetchJokes());

    function handleSearch() {
        if (searchTerm.trim()) fetchJokes(searchTerm.trim());
    }

    function handleClear() {
        setSearchTerm('');
        fetchJokes();
    }

    function toggleDraft(jokeId, isInDraft) {
        if (isInDraft) jokes.removeFromTop10Draft(jokeId);
        else jokes.addToTop10Draft(jokeId);
    }

    return (
        <div className="min-h-screen px-6 py-12 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:100%_6px] bg-left-bottom bg-no-repeat pb-2">
                            Jokes Collection
                        </span>
                    </h1>
                    <button
                        onClick={jokes.handleLogout}
                        className="px-6 py-2 rounded-full border border-accent/30 dark:border-accentDark/30 text-sm font-medium hover:bg-accent/10 dark:hover:bg-accentDark/10 transition-colors cursor-pointer"
                    >
                        Log out
                    </button>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <aside className="xl:col-span-3 space-y-8">
                        <SearchPanel
                            searchTerm={searchTerm}
                            onSearchTermChange={setSearchTerm}
                            onSearch={handleSearch}
                            onClear={handleClear}
                        />
                        <AddJokeForm onAdded={() => fetchJokes()} />
                    </aside>

                    <div className="xl:col-span-6">
                        <div className="flex flex-col gap-6">
                            {jokes.filteredJokes.length === 0 && (
                                <div className="glass rounded-[2rem] p-12 text-center shadow-modern">
                                    <p className="opacity-50 text-lg">No jokes found. Add one or try a different search.</p>
                                </div>
                            )}

                            {jokes.filteredJokes.map((joke) => (
                                <JokeCard
                                    key={joke.id}
                                    joke={joke}
                                    draftPosition={draftTop10Ids.indexOf(joke.id)}
                                    isEditing={editor.editingId === joke.id}
                                    editor={editor}
                                    searchTerm={debouncedSearch}
                                    onStar={jokes.handleStar}
                                    onDelete={jokes.handleDelete}
                                    onToggleDraft={toggleDraft}
                                />
                            ))}
                        </div>
                    </div>

                    <aside className="xl:col-span-3">
                        <Top10Panel
                            stagedCount={draftTop10Ids.length}
                            stagedJokes={jokes.draftTop10Jokes}
                            isDirty={jokes.isTop10Dirty}
                            isSaving={jokes.isSavingTop10}
                            message={jokes.top10Message}
                            onRemove={jokes.removeFromTop10Draft}
                            onMove={jokes.moveDraftTop10}
                            onSave={jokes.saveTop10}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}
