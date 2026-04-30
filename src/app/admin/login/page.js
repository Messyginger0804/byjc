'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        setLoading(false);
        if (res.ok) {
            router.push('/admin/jokes');
        } else {
            const data = await res.json();
            setError(data.error || 'Login failed');
        }
    }

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-6 transition-colors duration-300">
            <div className="w-full max-w-md p-8 md:p-12 glass rounded-[2.5rem] shadow-modern flex flex-col items-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center tracking-tight">
                    <span className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:100%_6px] bg-left-bottom bg-no-repeat pb-2">
                        JC Admin
                    </span>
                </h1>
                
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium opacity-70 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-3 rounded-2xl bg-light/5 dark:bg-dark/5 border border-accent/20 dark:border-accentDark/20 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-all duration-300"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 dark:text-red-400 text-sm font-medium px-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-2"
                    >
                        {loading ? 'Logging in…' : 'Log in'}
                    </button>
                </form>
            </div>
        </main>
    );
}
