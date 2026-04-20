# Blog Migration: Custom PostgreSQL + npm MD File Creator

## Summary
Migrate blog content from hardcoded data/local MDX files to PostgreSQL database with npm command-line tool for creating blogs from MD files.

## Current State
- Blog data hardcoded in `blog.json` and MDX files in `/content`
- Contentlayer processes MDX files for reading time, TOC, syntax highlighting
- Blog routes exist at `/blogs` and `/blogs/[slug]`

## Target Architecture
- PostgreSQL database for blog content storage
- API endpoints for CRUD operations
- npm script (`npm run blog:create`) to post MD files
- Preserve existing MDX processing pipeline (remark/rehype plugins)

## Implementation Plan

### 1. Database Setup
- Create `blogs` table in PostgreSQL with schema:
  - id (SERIAL PRIMARY KEY)
  - title (VARCHAR)
  - description (TEXT)
  - content (TEXT) - raw MDX
  - published_at, updated_at (TIMESTAMP)
  - author (VARCHAR)
  - tags (TEXT[])
  - is_published (BOOLEAN)
  - image_url (TEXT)
  - slug (VARCHAR, auto-generated from title)
- Create appropriate indexes
- Configure on Coolify with DATABASE_URL

### 2. API Endpoints
- GET /api/blogs - List published blogs
- GET /api/blogs/[id] - Get single blog
- POST /api/blogs - Create blog (via curl/npm)
- PUT /api/blogs/[id] - Update blog
- DELETE /api/blogs/[id] - Delete blog

### 3. npm Command
- Create `/scripts/create-blog.js`
- Reads MD file with YAML frontmatter + MDX content
- Uses gray-matter to parse frontmatter
- Posts to API endpoint via axios
- Usage: `npm run blog:create ./path/to/file.md`

### 4. MDX Processing Integration
- Update blog pages to fetch from PostgreSQL
- Process raw MDX content through existing remark/rehype plugins
- Preserve reading time, TOC, syntax highlighting features

### 5. Data Migration
- Export current blog.json and MDX files
- Import into PostgreSQL

## MD File Format
```yaml
---
title: "Blog Post Title"
description: "Short description"
tags: ["tag1", "tag2"]
image_url: "/blog-images/post.jpg"
---
# MDX content here
```

## Acceptance Criteria
- [ ] PostgreSQL database configured on Coolify
- [ ] blogs table created with proper schema
- [ ] API endpoints implemented for CRUD
- [ ] npm script created and tested
- [ ] Existing MDX features preserved (reading time, TOC, code highlighting)
- [ ] Data migrated from blog.json
- [ ] Blog pages work with new data source
- [ ] Documentation for usage workflow

## Priority
- High - Improves content management workflow significantly

## Status
- [ ] Not Started
- [x] Planned
- [ ] In Progress
- [ ] Complete

## Related
- Related to: Contentlayer configuration
- Related to: Blog pages (/blogs, /blogs/[slug])
- Related to: Coolify hosting