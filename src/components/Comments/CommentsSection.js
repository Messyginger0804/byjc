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
            .then(data => setComments(Array.isArray(data) ? data : []))
            .catch(() => setComments([]))
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
        <section id="comments" className="mt-10 scroll-mt-24 px-5 md:px-10 pb-16">
            <div className="max-w-3xl mx-auto lg:ml-[33.333%]">
                <h2 className="text-2xl font-bold text-dark dark:text-light mb-6 border-t border-dark/20 dark:border-light/20 pt-8">
                    Comments {comments.length > 0 && <span className="text-accent dark:text-accentDark">({comments.length})</span>}
                </h2>

                {loading ? (
                    <p className="text-dark/50 dark:text-light/50 text-sm">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-dark/50 dark:text-light/50 text-sm mb-8">Be the first to leave a comment!</p>
                ) : (
                    <ul className="space-y-4 mb-10">
                        {comments.map(comment => (
                            <li key={comment.id} className="glass rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-accent dark:text-accentDark">{comment.name}</span>
                                    <span className="text-xs text-dark/40 dark:text-light/40">
                                        {format(new Date(comment.created_at), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="text-dark/80 dark:text-light/80 leading-relaxed">{comment.body}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-dark dark:text-light">Leave a comment</h3>

                    {formError && (
                        <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
                    )}

                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 rounded-xl px-4 py-3 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-colors"
                    />

                    <textarea
                        placeholder="Write a comment..."
                        rows={4}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        className="w-full bg-dark/5 dark:bg-light/5 border border-dark/10 dark:border-light/10 rounded-xl px-4 py-3 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accentDark transition-colors resize-none"
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </section>
    )
}
