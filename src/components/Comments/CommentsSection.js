'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

export default function CommentsSection({ slug }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [name, setName] = useState('')
    const [body, setBody] = useState('')

    useEffect(() => {
        fetch(`/api/comments/${slug}`)
            .then(r => r.json())
            .then(data => {
                const fetched = Array.isArray(data) ? data : []
                // Keep comments posted locally while the request was in flight
                setComments(prev => [...fetched, ...prev.filter(c => !fetched.some(f => f.id === c.id))])
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [slug])

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')

        const trimmedName = name.trim()
        const trimmedBody = body.trim()

        if (!trimmedName || !trimmedBody) {
            setFormError('Name and comment are required.')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/comments/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName, body: trimmedBody }),
            })

            if (res.status === 409) {
                setFormError('That comment was already posted.')
                return
            }
            if (res.status === 429) {
                setFormError('Please wait a moment before posting again.')
                return
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setFormError(data.error || 'Something went wrong. Please try again.')
                return
            }

            const created = await res.json()
            setComments(prev => [...prev, created])
            setName('')
            setBody('')
        } catch {
            setFormError('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section id="comments" className="mt-16 scroll-mt-24">
            <div className="glass rounded-3xl p-6 md:p-10 max-w-3xl mx-auto lg:ml-auto lg:mr-0 lg:w-2/3">
                <p className="eyebrow mb-2">Discussion</p>
                <h2 className="display-md font-display mb-6">
                    Comments {comments.length > 0 && <span className="text-accent dark:text-accent-bright">({comments.length})</span>}
                </h2>

                {loading ? (
                    <p className="text-muted text-sm">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-muted text-sm mb-8">Be the first to leave a comment!</p>
                ) : (
                    <ul className="space-y-4 mb-10">
                        {comments.map(comment => (
                            <li key={comment.id} className="rounded-2xl p-5 bg-ink/[0.04] dark:bg-white/[0.05] border border-ink/5 dark:border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-accent dark:text-accent-bright">{comment.name}</span>
                                    <span className="font-mono-jb text-xs uppercase tracking-[0.1em] text-muted">
                                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="leading-relaxed">{comment.body}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Leave a comment</h3>

                    {formError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                    )}

                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        aria-label="Your name"
                        className="w-full bg-ink/[0.04] dark:bg-white/[0.05] border border-ink/10 dark:border-white/10 rounded-2xl px-4 py-3 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-bright transition-colors"
                    />

                    <textarea
                        placeholder="Write a comment..."
                        rows={4}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        aria-label="Write a comment"
                        className="w-full bg-ink/[0.04] dark:bg-white/[0.05] border border-ink/10 dark:border-white/10 rounded-2xl px-4 py-3 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-bright transition-colors resize-none"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-signal-cta px-7 py-3 font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-bright focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </section>
    )
}
