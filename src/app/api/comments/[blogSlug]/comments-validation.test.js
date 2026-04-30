import { describe, it, expect } from 'vitest';

function validateCommentFields({ name, body }) {
    if (!name?.trim() || !body?.trim()) {
        return { valid: false, error: 'Name and body are required' };
    }
    return { valid: true };
}

describe('comment POST — field validation', () => {
    it('passes when both name and body are non-empty strings', () => {
        expect(validateCommentFields({ name: 'Alice', body: 'Great post!' })).toEqual({ valid: true });
    });

    it('fails when name is undefined', () => {
        expect(validateCommentFields({ name: undefined, body: 'body' }).valid).toBe(false);
    });

    it('fails when name is null', () => {
        expect(validateCommentFields({ name: null, body: 'body' }).valid).toBe(false);
    });

    it('fails when name is empty string', () => {
        expect(validateCommentFields({ name: '', body: 'body' }).valid).toBe(false);
    });

    it('fails when name is only whitespace', () => {
        expect(validateCommentFields({ name: '   ', body: 'body' }).valid).toBe(false);
    });

    it('fails when body is undefined', () => {
        expect(validateCommentFields({ name: 'Alice', body: undefined }).valid).toBe(false);
    });

    it('fails when body is null', () => {
        expect(validateCommentFields({ name: 'Alice', body: null }).valid).toBe(false);
    });

    it('fails when body is empty string', () => {
        expect(validateCommentFields({ name: 'Alice', body: '' }).valid).toBe(false);
    });

    it('fails when body is only whitespace', () => {
        expect(validateCommentFields({ name: 'Alice', body: '\t\n' }).valid).toBe(false);
    });

    it('fails when both fields are missing', () => {
        expect(validateCommentFields({ name: undefined, body: undefined }).valid).toBe(false);
    });

    it('error message is exactly "Name and body are required"', () => {
        expect(validateCommentFields({ name: '', body: '' }).error).toBe('Name and body are required');
    });

    it('passes when name has leading/trailing whitespace but non-empty content', () => {
        expect(validateCommentFields({ name: '  Alice  ', body: 'body' })).toEqual({ valid: true });
    });

    it('passes when body has leading/trailing whitespace but non-empty content', () => {
        expect(validateCommentFields({ name: 'Alice', body: '  Great post!  ' })).toEqual({ valid: true });
    });
});
