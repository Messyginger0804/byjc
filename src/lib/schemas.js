import { parseBlogDateToUtc } from './dateUtils.js';

function stringField(value, { min, max, required, matches, nullable } = {}) {
  if (value === undefined) {
    if (required) return { ok: false, errors: ['This field is required'] };
    return { ok: true, value: undefined };
  }
  if (value === null) {
    if (nullable) return { ok: true, value: null };
    if (required) return { ok: false, errors: ['This field is required'] };
    return { ok: false, errors: ['Must be a string'] };
  }
  if (typeof value !== 'string') return { ok: false, errors: ['Must be a string'] };
  const str = value.trim();
  if (required && str.length === 0) return { ok: false, errors: ['This field is required'] };
  if (min !== undefined && str.length < min) return { ok: false, errors: [`Must be at least ${min} characters`] };
  if (max !== undefined && str.length > max) return { ok: false, errors: [`Must be at most ${max} characters`] };
  if (matches && !matches.test(str)) return { ok: false, errors: ['Invalid format'] };
  return { ok: true, value: str };
}

function arrayField(value, { of: itemRules, max, optional } = {}) {
  if (value === undefined) {
    if (optional) return { ok: true, value };
    return { ok: false, errors: ['This field is required'] };
  }
  if (!Array.isArray(value)) return { ok: false, errors: ['Must be an array'] };
  if (max !== undefined && value.length > max) return { ok: false, errors: [`Must have at most ${max} items`] };
  if (itemRules) {
    const normalized = [];
    for (const item of value) {
      const res = stringField(item, itemRules);
      if (!res.ok) return res;
      normalized.push(res.value);
    }
    return { ok: true, value: normalized };
  }
  return { ok: true, value };
}

function booleanField(value, { optional } = {}) {
  if (value === undefined) {
    if (optional) return { ok: true, value };
    return { ok: false, errors: ['This field is required'] };
  }
  if (typeof value !== 'boolean') return { ok: false, errors: ['Must be a boolean'] };
  return { ok: true, value };
}

function dateTimeField(value, rules) {
  const stringResult = stringField(value, rules);
  if (!stringResult.ok || stringResult.value === undefined || stringResult.value === null) return stringResult;
  if (!parseBlogDateToUtc(stringResult.value)) return { ok: false, errors: ['Must be a valid ISO date or datetime'] };
  return stringResult;
}

const slugRegex = /^[a-z0-9-]+$/;

function buildValidator(fields) {
  return {
    validate(body, opts = {}) {
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        const err = new Error('Validation failed');
        err.errors = ['Must be a JSON object'];
        throw err;
      }
      const errors = [];
      const result = {};
      const { stripUnknown } = opts;

      for (const [key, rules] of Object.entries(fields)) {
        const raw = body?.[key];
        let res;
        if (rules.type === 'string') {
          res = stringField(raw, rules);
        } else if (rules.type === 'array') {
          res = arrayField(raw, rules);
        } else if (rules.type === 'boolean') {
          res = booleanField(raw, rules);
        } else if (rules.type === 'datetime') {
          res = dateTimeField(raw, rules);
        } else {
          res = { ok: true, value: raw };
        }

        if (!res.ok) {
          errors.push(...res.errors);
        } else {
          result[key] = res.value;
        }
      }

      if (!stripUnknown) {
        for (const key of Object.keys(body || {})) {
          if (!(key in fields)) {
            result[key] = body[key];
          }
        }
      }

      if (errors.length > 0) {
        const err = new Error('Validation failed');
        err.errors = errors;
        throw err;
      }

      return result;
    }
  };
}

export const jokeSchema = buildValidator({
  setup: { type: 'string', trim: true, min: 1, max: 500, required: true },
  punchline: { type: 'string', trim: true, min: 1, max: 1000, required: true },
});

export const commentSchema = buildValidator({
  name: { type: 'string', trim: true, min: 1, max: 80, required: true },
  body: { type: 'string', trim: true, min: 1, max: 2000, required: true },
});

export const blogSchema = buildValidator({
  title: { type: 'string', trim: true, min: 1, max: 200, required: true },
  description: { type: 'string', trim: true, min: 1, max: 500, required: true },
  content: { type: 'string', trim: true, min: 1, required: true },
  slug: { type: 'string', trim: true, matches: slugRegex, max: 120, required: true },
  author: { type: 'string', trim: true, max: 80, optional: true },
  tags: { type: 'array', of: { trim: true, max: 40 }, max: 20, optional: true },
  image_url: { type: 'string', trim: true, max: 500, optional: true, nullable: true },
  is_published: { type: 'boolean', optional: true },
  is_featured: { type: 'boolean', optional: true },
  featured_slot: { type: 'string', optional: true, nullable: true },
  published_at: { type: 'datetime', optional: true, nullable: true },
});

// PATCH fields are intentionally all optional. Keeping this separate from the
// create schema ensures an omitted property is not validated as required or
// written back as a default value.
export const blogPatchSchema = buildValidator({
  title: { type: 'string', trim: true, min: 1, max: 200 },
  description: { type: 'string', trim: true, min: 1, max: 500 },
  content: { type: 'string', trim: true, min: 1 },
  slug: { type: 'string', trim: true, matches: slugRegex, max: 120 },
  author: { type: 'string', trim: true, max: 80 },
  tags: { type: 'array', of: { trim: true, max: 40 }, max: 20, optional: true },
  image_url: { type: 'string', trim: true, max: 500, nullable: true },
  is_published: { type: 'boolean', optional: true },
  is_featured: { type: 'boolean', optional: true },
  featured_slot: { type: 'string', optional: true, nullable: true },
  published_at: { type: 'datetime', nullable: true },
});

export async function validateBody(schema, body) {
  try {
    const value = await schema.validate(body, { abortEarly: false, stripUnknown: true });
    return { ok: true, value };
  } catch (err) {
    return { ok: false, errors: err.errors || [err.message] };
  }
}
