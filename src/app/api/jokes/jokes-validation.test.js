import { describe, it, expect } from 'vitest';

function validateJokeFields({ setup, punchline }) {
    if (!setup?.trim()) return { valid: false, error: 'Setup is required' };
    if (!punchline?.trim()) return { valid: false, error: 'Punchline is required' };
    return { valid: true };
}

describe('joke POST — field validation', () => {
    it('passes when both setup and punchline are provided', () => {
        expect(validateJokeFields({ setup: 'Why did the chicken cross the road?', punchline: 'To get to the other side.' })).toEqual({ valid: true });
    });

    it('fails with "Setup is required" when setup is undefined', () => {
        const result = validateJokeFields({ setup: undefined, punchline: 'punchline' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Setup is required');
    });

    it('fails with "Setup is required" when setup is null', () => {
        const result = validateJokeFields({ setup: null, punchline: 'punchline' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Setup is required');
    });

    it('fails with "Setup is required" when setup is empty string', () => {
        const result = validateJokeFields({ setup: '', punchline: 'punchline' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Setup is required');
    });

    it('fails with "Setup is required" when setup is only whitespace', () => {
        const result = validateJokeFields({ setup: '   ', punchline: 'punchline' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Setup is required');
    });

    it('fails with "Punchline is required" when setup is valid but punchline is undefined', () => {
        const result = validateJokeFields({ setup: 'A setup', punchline: undefined });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Punchline is required');
    });

    it('fails with "Punchline is required" when setup is valid but punchline is null', () => {
        const result = validateJokeFields({ setup: 'A setup', punchline: null });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Punchline is required');
    });

    it('fails with "Punchline is required" when setup is valid but punchline is empty string', () => {
        const result = validateJokeFields({ setup: 'A setup', punchline: '' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Punchline is required');
    });

    it('fails with "Punchline is required" when setup is valid but punchline is only whitespace', () => {
        const result = validateJokeFields({ setup: 'A setup', punchline: '\t\n' });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Punchline is required');
    });

    it('returns setup error (not punchline error) when both fields are missing — sequential check order', () => {
        const result = validateJokeFields({ setup: undefined, punchline: undefined });
        expect(result.error).toBe('Setup is required');
    });
});

describe('joke POST — trim behavior', () => {
    it('whitespace-padded but non-empty setup passes', () => {
        expect(validateJokeFields({ setup: '  A valid setup  ', punchline: 'punchline' })).toEqual({ valid: true });
    });

    it('whitespace-padded but non-empty punchline passes', () => {
        expect(validateJokeFields({ setup: 'setup', punchline: '  A valid punchline  ' })).toEqual({ valid: true });
    });
});
