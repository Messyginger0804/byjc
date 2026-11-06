import { parseBlogDateToUtc } from './dateUtils.js';

const REQUIRED_ERROR = { ok: false, errors: ['This field is required'] };
const fail = (message) => ({ ok: false, errors: [message] });

// Returns a result for undefined/null/non-string input, or null for a real string.
function checkStringPresence(value, { required, nullable }) {
  if (value === undefined) return required ? REQUIRED_ERROR : { ok: true, value: undefined };
  if (value === null) {
    if (nullable) return { ok: true, value: null };
    return required ? REQUIRED_ERROR : fail('Must be a string');
  }
  return typeof value === 'string' ? null : fail('Must be a string');
}

function stringLengthError(str, { min, max, required }) {
  if (required && str.length === 0) return 'This field is required';
  if (min !== undefined && str.length < min) return `Must be at least ${min} characters`;
  if (max !== undefined && str.length > max) return `Must be at most ${max} characters`;
  return null;
}

function stringField(value, rules = {}) {
  const early = checkStringPresence(value, rules);
  if (early) return early;
  const str = value.trim();
  const message = stringLengthError(str, rules) || (rules.matches && !rules.matches.test(str) ? 'Invalid format' : null);
  return message ? fail(message) : { ok: true, value: str };
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

const passthroughField = (value) => ({ ok: true, value });

const FIELD_VALIDATORS = {
  string: stringField,
  array: arrayField,
  boolean: booleanField,
  datetime: dateTimeField,
};

const slugRegex = /^[a-z0-9-]+$/;

function validationError(errors) {
  const err = new Error('Validation failed');
  err.errors = errors;
  return err;
}

function validateFields(fields, body) {
  const errors = [];
  const result = {};
  for (const [key, rules] of Object.entries(fields)) {
    const res = (FIELD_VALIDATORS[rules.type] || passthroughField)(body[key], rules);
    if (res.ok) result[key] = res.value;
    else errors.push(...res.errors);
  }
  return { errors, result };
}

function buildValidator(fields) {
  return {
    validate(body, opts = {}) {
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw validationError(['Must be a JSON object']);
      }
      const { errors, result } = validateFields(fields, body);

      if (!opts.stripUnknown) {
        for (const key of Object.keys(body)) {
          if (!(key in fields)) result[key] = body[key];
        }
      }

      if (errors.length > 0) throw validationError(errors);
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
