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
        <main className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="w-full max-w-sm p-8 rounded-2xl bg-gray-900 shadow-xl">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">JC Admin</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-yellow-400"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="py-3 rounded-lg bg-yellow-400 text-gray-950 font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Logging in…' : 'Log in'}
                    </button>
                </form>
            </div>
        </main>
    );
}
