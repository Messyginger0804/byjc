import * as yup from 'yup';

export const jokeSchema = yup.object({
  setup: yup.string().trim().min(1).max(500).required(),
  punchline: yup.string().trim().min(1).max(1000).required(),
});

export const commentSchema = yup.object({
  name: yup.string().trim().min(1).max(80).required(),
  body: yup.string().trim().min(1).max(2000).required(),
});

const slugRegex = /^[a-z0-9-]+$/;

export const blogSchema = yup.object({
  title: yup.string().trim().min(1).max(200).required(),
  description: yup.string().trim().min(1).max(500).required(),
  content: yup.string().min(1).required(),
  slug: yup.string().trim().matches(slugRegex, 'slug must be lowercase alphanumeric with hyphens').max(120).required(),
  author: yup.string().trim().max(80).optional(),
  tags: yup.array().of(yup.string().trim().max(40)).max(20).optional(),
  image_url: yup.string().trim().max(500).optional().nullable(),
  is_published: yup.boolean().optional(),
  is_featured: yup.boolean().optional(),
  featured_slot: yup.string().nullable().optional(),
  published_at: yup.string().optional().nullable(),
});

export async function validateBody(schema, body) {
  try {
    const value = await schema.validate(body, { abortEarly: false, stripUnknown: true });
    return { ok: true, value };
  } catch (err) {
    return { ok: false, errors: err.errors || [err.message] };
  }
}
