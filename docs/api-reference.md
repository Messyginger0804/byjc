# API Reference

## Overview

This documents the REST API endpoints for Blogs by JC. All endpoints return JSON responses.

## Authentication

Some endpoints require a shared API secret. Include it in request headers:

```
BLOG_API_SECRET: your-secret-key
```

For local development, set `BLOG_API_SECRET` in `.env.local`. For production, use `BLOG_API_SECRET_PROD`.

---

## Database Schema

The application uses PostgreSQL with the following schema:

### blogs Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| title | VARCHAR | NOT NULL | Blog post title |
| description | TEXT | NOT NULL | Short description for previews |
| content | TEXT | NOT NULL | Full MDX content |
| slug | VARCHAR | UNIQUE, NOT NULL | URL-friendly identifier |
| author | VARCHAR | DEFAULT 'JC Ashley' | Author name |
| tags | TEXT[] | DEFAULT '{}' | PostgreSQL array of tag strings |
| image_url | TEXT | | Path to featured image |
| is_published | BOOLEAN | DEFAULT true | Whether post is published |
| published_at | TIMESTAMPTZ | DEFAULT NOW() | Publication timestamp |
| featured_slot | VARCHAR(50) | | One of: featured-main, featured-secondary-1, featured-secondary-2 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### Indexes

```sql
CREATE INDEX blogs_slug_idx ON blogs(slug);
CREATE INDEX blogs_published_at_idx ON blogs(published_at DESC);
CREATE INDEX blogs_featured_slot_idx ON blogs(featured_slot);
```

---

## Endpoints

### GET /api/blogs

Returns all published blog posts, ordered by publication date (newest first).

**Authentication:** None

**Query Parameters:** None

**Response:**
```json
[
  {
    "id": 1,
    "title": "Blog Title",
    "description": "Short description",
    "slug": "blog-title",
    "author": "Jeremy Ashley",
    "tags": ["react", "nextjs"],
    "image_url": "/blog-images/post.jpg",
    "published_at": "2024-01-15T00:00:00.000Z",
    "updated_at": "2024-01-15T00:00:00.000Z",
    "is_published": true,
    "featured_slot": null
  }
]
```

**Example:**
```bash
curl https://www.byjc.dev/api/blogs
```

---

### GET /api/blogs/[slug]

Returns a single published blog post by slug.

**Authentication:** None

**URL Parameters:**
- `slug` (string): The blog post slug

**Response:**
```json
{
  "id": 1,
  "title": "Blog Title",
  "description": "Short description",
  "slug": "blog-title",
  "author": "Jeremy Ashley",
  "tags": ["react", "nextjs"],
  "image_url": "/blog-images/post.jpg",
  "content": "# MDX content here\n\nThis is the full blog post content in MDX format.",
  "published_at": "2024-01-15T00:00:00.000Z",
  "updated_at": "2024-01-15T00:00:00.000Z",
  "is_published": true,
  "featured_slot": "featured-main"
}
```

**Example:**
```bash
curl https://www.byjc.dev/api/blogs/my-first-post
```

**Errors:**
- `400`: Invalid slug
- `404`: Blog not found or not yet published
- `500`: Server error (see server logs for details)

---

### Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

**Database Errors:**
- If the database is unavailable, `GET /api/blogs` returns an empty array `[]` rather than an error
- Single blog endpoints return `500` with error details in server logs

**Debug Logging:**
- Server logs include `[API]` prefix for all blog API requests
- When a blog exists but is not visible, logs show: `Blog '[slug]' found but not visible: is_published=..., published_at=...`

---

### POST /api/blogs

Creates a new blog post.

**Authentication:** Required (BLOG_API_SECRET in header)

**Request Body:**
```json
{
  "title": "Blog Title",
  "description": "Short description",
  "content": "# MDX content here",
  "author": "Jeremy Ashley",
  "tags": ["react", "nextjs"],
  "image_url": "/blog-images/post.jpg",
  "slug": "blog-title",
  "is_published": true,
  "featured_slot": "featured-main",
  "published_at": "2024-01-15"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|--------------|
| title | string | Yes | Blog post title |
| description | string | Yes | Short description for previews |
| content | string | Yes | MDX content |
| author | string | Yes | Author name |
| tags | array | No | Array of tag strings |
| image_url | string | No | Path to featured image |
| slug | string | No | URL slug (auto-generated from title if not provided) |
| is_published | boolean | No | Default: true |
| featured_slot | string | No | One of: "featured-main", "featured-secondary-1", "featured-secondary-2" |
| published_at | string | No | Publication date (ISO format or YYYY-MM-DD, interpreted as CST) |

**Response:** Returns the created blog post with all fields.

**Example:**
```bash
curl -X POST https://www.byjc.dev/api/blogs \
  -H "Content-Type: application/json" \
  -H "BLOG_API_SECRET: your-secret" \
  -d '{"title":"New Post","description":"Description","content":"# Content","author":"Jeremy Ashley"}'
```

---

### PATCH /api/blogs/[slug]

Updates an existing blog post (currently only supports updating featured_slot).

**Authentication:** Required (BLOG_API_SECRET in header)

**URL Parameters:**
- `slug` (string): The blog post slug

**Request Body:**
```json
{
  "featured_slot": "featured-main"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|--------------|
| featured_slot | string | No | One of: "featured-main", "featured-secondary-1", "featured-secondary-2", or null to remove |

**Example:**
```bash
curl -X PATCH https://www.byjc.dev/api/blogs/my-post \
  -H "Content-Type: application/json" \
  -H "BLOG_API_SECRET: your-secret" \
  -d '{"featured_slot": "featured-main"}'
```

---

### GET /api/resume/download

Downloads the resume PDF file.

**Authentication:** None

**Response:** Binary PDF file with headers:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="resume.pdf"`

**Example:**
```bash
curl -o resume.pdf https://www.byjc.dev/api/resume/download
```

---

## Featured Slots

Blog posts can be featured in three slots:

| Slot | Description |
|------|-------------|
| featured-main | Main featured post (top of homepage) |
| featured-secondary-1 | Secondary featured post |
| featured-secondary-2 | Tertiary featured post |

Only one blog post can occupy each slot at a time. Assigning a new post to a slot automatically removes the previous post from that slot.

---

## CLI Commands

The project includes npm scripts for managing blogs:

### Create a Blog

```bash
npm run blog:create ./path/to/blog.md
```

This reads an MD file with YAML frontmatter and creates the blog via the API.

### Feature a Blog

```bash
npm run blog:feature -- --slug=my-post --slot=featured-main
```

### Migrate Blogs (development)

```bash
npm run blog:migrate
```